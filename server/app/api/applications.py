
from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db, limiter
from ..models import (
    Business, FormationApplication, Address, RegisteredAgent, Organizer,
    GoverningPerson, AuditLog, StatusHistory,
)
from ..services.email import send_email
from ..services.states import is_supported_state, get_state_config, DEFAULT_STATE
from .notifications import notify_user
from ..utils import ok, error, sanitize_text, utcnow
from ..validations.address import validate_city, validate_street_address, validate_zip
from ..validations.business import validate_business_name
from ..validations.common import validate_choice
from ..validations.formation import validate_effective_date, validate_ownership_total

bp = Blueprint("applications", __name__, url_prefix="/api/applications")

ENTITY_TYPES = ("LLC", "Series LLC")
MANAGEMENT_STRUCTURES = ("Member-managed", "Manager-managed")
REGISTERED_AGENT_TYPES = ("abf", "self", "other")
ORGANIZER_TYPES = ("self", "other")
EFFECTIVE_DATE_OPTIONS = ("filing", "delayed")


def _address_errors(data, prefix, required, disallow_po_box=False):
    line1_value, line1_err = validate_street_address(data.get(f"{prefix}_line1"), required=required, disallow_po_box=disallow_po_box)
    city_value, city_err = validate_city(data.get(f"{prefix}_city"), required=required)
    zip_value, zip_err = validate_zip(data.get(f"{prefix}_zip"), required=required)
    errors = {}
    if line1_err:
        errors[f"{prefix}_line1"] = line1_err
    if city_err:
        errors[f"{prefix}_city"] = city_err
    if zip_err:
        errors[f"{prefix}_zip"] = zip_err
    return (line1_value, city_value, zip_value), errors


def _build_address(data, prefix, line1, city, zip_code, state):
    if not line1:
        return None
    return Address(
        line1=line1,
        line2=sanitize_text(data.get(f"{prefix}_line2"), 255),
        city=city or "",
        # Defaults to the business's own formation state rather than a
        # hardcoded one — this address doesn't collect its own state field
        # in the wizard yet, and for the large majority of customers the
        # principal/registered/organizer address is in the same state
        # they're forming in. A customer whose address is genuinely in a
        # different state isn't supported by this field yet; the formation
        # state itself (business.state, validated below) is what always
        # drives the real filing fee, independent of this.
        state=state,
        postal_code=zip_code or "",
        county=sanitize_text(data.get(f"{prefix}_county"), 120),
        is_po_box=False,
    )


@bp.post("")
@jwt_required(optional=True)
@limiter.limit("30 per hour")
def create_application():
    """Creates (or autosaves into) a draft Business + FormationApplication.
    Used for both the initial draft and subsequent autosave calls when a
    business_id is supplied in the payload."""
    data = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    if not user_id:
        return error("Sign in required to save an application.", 401)

    business_id = data.get("business_id")
    business = Business.query.filter_by(id=business_id, owner_id=user_id).first() if business_id else None

    errors = {}

    name_required = not business
    name_value, name_err = validate_business_name(data.get("business_name"), required=name_required)
    if name_err:
        errors["business_name"] = name_err

    # LLC Formation State the one input that decides the real government
    # filing fee at checkout (see checkout.py). Only validated/applied when
    # actually supplied so an in-progress autosave that hasn't reached the
    # state-selection step yet doesn't get rejected; a business created
    # with no state at all defaults to DEFAULT_STATE until the customer
    # picks one, and checkout.py independently re-validates whatever
    # ends up stored before ever pricing an order from it.
    state_value = None
    if data.get("state"):
        state_value = str(data.get("state")).strip().upper()
        if not is_supported_state(state_value):
            errors["state"] = "Select a state where LLC formation is currently available."

    entity_type = data.get("entity_type")
    if entity_type:
        _, entity_err = validate_choice(entity_type, ENTITY_TYPES, "Select a valid entity type.")
        if entity_err:
            errors["entity_type"] = entity_err

    management_structure = data.get("management_structure")
    if management_structure:
        _, mgmt_err = validate_choice(management_structure, MANAGEMENT_STRUCTURES, "Select a valid management structure.")
        if mgmt_err:
            errors["management_structure"] = mgmt_err

    (principal_line1, principal_city, principal_zip), principal_errors = (
        _address_errors(data, "principal", required=False) if data.get("principal_line1") else ((None, None, None), {})
    )
    errors.update(principal_errors)

    ra_type = data.get("registered_agent_type")
    if ra_type:
        _, ra_type_err = validate_choice(ra_type, REGISTERED_AGENT_TYPES, "Select a valid registered agent type.")
        if ra_type_err:
            errors["registered_agent_type"] = ra_type_err

    (office_line1, office_city, office_zip), office_errors = ((None, None, None), {})
    if ra_type and ra_type != "abf" and data.get("registered_office_line1"):
        (office_line1, office_city, office_zip), office_errors = _address_errors(
            data, "registered_office", required=True, disallow_po_box=True
        )
        errors.update(office_errors)

    org_type = data.get("organizer_type")
    if org_type:
        _, org_type_err = validate_choice(org_type, ORGANIZER_TYPES, "Select a valid organizer type.")
        if org_type_err:
            errors["organizer_type"] = org_type_err

    (organizer_line1, organizer_city, organizer_zip), organizer_errors = ((None, None, None), {})
    if org_type == "other" and data.get("organizer_line1"):
        (organizer_line1, organizer_city, organizer_zip), organizer_errors = _address_errors(
            data, "organizer", required=True
        )
        errors.update(organizer_errors)

    effective_date_option = data.get("effective_date_option")
    if effective_date_option:
        _, eff_opt_err = validate_choice(effective_date_option, EFFECTIVE_DATE_OPTIONS, "Select a valid effective date option.")
        if eff_opt_err:
            errors["effective_date_option"] = eff_opt_err
    effective_date_value = None
    if effective_date_option == "delayed" and data.get("effective_date"):
        effective_date_value, eff_date_err = validate_effective_date(data.get("effective_date"), max_days_out=90)
        if eff_date_err:
            errors["effective_date"] = eff_date_err

    owners = data.get("owners") or []
    if owners:
        for i, owner in enumerate(owners):
            owner_name = sanitize_text(owner.get("name"), 200)
            if owner_name and not any(ch.isalpha() for ch in owner_name):
                errors[f"owner_{i}_name"] = "Enter a valid owner name."
        _, ownership_err = validate_ownership_total(owners)
        if ownership_err and len(owners) < 4:
            errors["owners"] = ownership_err

    if errors:
        return error("Please correct the highlighted fields.", 422, field_errors=errors)

    if not business:
        business = Business(owner_id=user_id, name=name_value, state=state_value or DEFAULT_STATE)
        db.session.add(business)
        db.session.flush()

    business.name = name_value or business.name
    business.state = state_value or business.state
    business.entity_type = sanitize_text(entity_type, 40) or business.entity_type or "LLC"
    business.industry = sanitize_text(data.get("industry"), 120) or business.industry
    business.purpose = sanitize_text(data.get("purpose"), 2000) or business.purpose
    business.management_structure = management_structure or business.management_structure

    principal = _build_address(data, "principal", principal_line1, principal_city, principal_zip, business.state)
    if principal:
        db.session.add(principal)
        db.session.flush()
        business.principal_address_id = principal.id

    application = business.applications.order_by(FormationApplication.created_at.desc()).first()
    if not application or application.status != "draft":
        application = FormationApplication(business_id=business.id, status="draft")
        db.session.add(application)

    application.effective_date_option = effective_date_option or application.effective_date_option or "filing"
    application.effective_date = effective_date_value or application.effective_date
    application.package_name = sanitize_text(data.get("package_name"), 60) or application.package_name
    application.add_ons = data.get("add_ons") or application.add_ons or []
    application.ein_requested = bool(data.get("needs_ein", application.ein_requested))
    application.operating_agreement_requested = bool(
        data.get("operating_agreement_requested", application.operating_agreement_requested)
    )

    # Registered agent
    if ra_type:
        agent = business.registered_agent or RegisteredAgent(business_id=business.id)
        agent.agent_type = ra_type
        agent.name = sanitize_text(data.get("registered_agent_name"), 200) or agent.name
        office = _build_address(data, "registered_office", office_line1, office_city, office_zip, business.state)
        if office:
            db.session.add(office)
            db.session.flush()
            agent.registered_office_address_id = office.id
        agent.consent_given = bool(data.get("registered_agent_consent"))
        if agent.consent_given and not agent.consent_given_at:
            agent.consent_given_at = utcnow()
        db.session.add(agent)

    # Organizer upsert-by-business (not a plain insert): without this, every
    # autosave call that includes organizer_type would add another Organizer
    # row for the same business.
    if org_type:
        organizer = Organizer.query.filter_by(business_id=business.id).first() or Organizer(business_id=business.id)
        organizer.organizer_type = org_type
        organizer.name = sanitize_text(data.get("organizer_name"), 200) or organizer.name
        organizer_address = _build_address(data, "organizer", organizer_line1, organizer_city, organizer_zip, business.state)
        if organizer_address:
            db.session.add(organizer_address)
            db.session.flush()
            organizer.address_id = organizer_address.id
        db.session.add(organizer)

    # Governing persons (owners)
    if owners:
        GoverningPerson.query.filter_by(business_id=business.id).delete()
        for owner in owners:
            db.session.add(GoverningPerson(
                business_id=business.id,
                name=sanitize_text(owner.get("name"), 200) or "Unnamed owner",
                title=business.management_structure,
                ownership_percentage=owner.get("percentage"),
            ))

    db.session.commit()
    return ok({"business": business.to_dict(), "application": application.to_dict()}, 201)


@bp.get("")
@jwt_required()
def list_applications():
    """Every business the current user owns, with its latest application —
    the customer dashboard's Businesses list. Ownership is enforced by the
    owner_id filter itself; there is no way to pass another user's id in."""
    user_id = get_jwt_identity()
    businesses = Business.query.filter_by(owner_id=user_id).order_by(Business.created_at.desc()).all()
    results = []
    for business in businesses:
        application = business.applications.order_by(FormationApplication.created_at.desc()).first()
        results.append({"business": business.to_dict(), "application": application.to_dict() if application else None})
    return ok(results)


@bp.get("/<business_id>")
@jwt_required()
def get_application(business_id):
    user_id = get_jwt_identity()
    business = Business.query.filter_by(id=business_id, owner_id=user_id).first()
    if not business:
        return error("Not found", 404)
    application = business.applications.order_by(FormationApplication.created_at.desc()).first()
    return ok({"business": business.to_dict(), "application": application.to_dict() if application else None})


@bp.post("/<business_id>/submit")
@jwt_required()
@limiter.limit("10 per hour")
def submit_application(business_id):
    user_id = get_jwt_identity()
    business = Business.query.filter_by(id=business_id, owner_id=user_id).first()
    if not business:
        return error("Not found", 404)

    application = business.applications.order_by(FormationApplication.created_at.desc()).first()
    if not application:
        return error("No draft application found to submit.", 400)

    if application.status != "draft":
        return error("This application has already been submitted.", 409)

    if not business.registered_agent or not business.registered_agent.consent_given:
        return error("Registered agent consent is required before submitting.", 422)

    previous_status = application.status
    application.status = "submitted"
    application.submitted_at = utcnow()
    business.status = "submitted"
    db.session.add(StatusHistory(
        entity_type="application", entity_id=application.id,
        from_status=previous_status, to_status="submitted", changed_by=user_id,
    ))
    db.session.commit()

    db.session.add(AuditLog(actor_id=user_id, action="Submitted formation application", details=business.id))
    db.session.commit()

    from ..models import User
    owner = User.query.get(user_id)
    state_config = get_state_config(business.state)
    send_email("application_submitted", owner.email, {
        "business_name": business.name,
        "state_name": state_config["name"] if state_config else business.state,
        "filing_authority": state_config["filing_authority"] if state_config else "your state's filing authority",
        "dashboard_url": f"{current_app.config['FRONTEND_ORIGIN']}/dashboard/businesses/{business.id}",
        "support_email": current_app.config["SUPPORT_EMAIL"],
    })
    notify_user(user_id, "Formation application submitted", f"{business.name} is now under review.", link=f"/dashboard/businesses/{business.id}")
    db.session.commit()

    return ok({"business": business.to_dict(), "application": application.to_dict()})
