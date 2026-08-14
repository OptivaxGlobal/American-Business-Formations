from ..extensions import db
from .base import BaseModel

APPLICATION_STATUSES = (
    "draft", "submitted", "under_review", "info_requested", "ready_to_file",
    "submitted_to_state", "approved", "rejected",
)


class Address(BaseModel):
    __tablename__ = "addresses"

    line1 = db.Column(db.String(255), nullable=False)
    line2 = db.Column(db.String(255))
    city = db.Column(db.String(120), nullable=False)
    state = db.Column(db.String(2), nullable=False, default="TX")
    postal_code = db.Column(db.String(12), nullable=False)
    county = db.Column(db.String(120))
    is_po_box = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            "line1": self.line1, "line2": self.line2, "city": self.city,
            "state": self.state, "postal_code": self.postal_code, "county": self.county,
        }


class Business(BaseModel):
    __tablename__ = "businesses"

    owner_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    alternate_name = db.Column(db.String(200))
    entity_type = db.Column(db.String(40), nullable=False, default="LLC")
    state = db.Column(db.String(2), nullable=False, default="TX")
    industry = db.Column(db.String(120))
    purpose = db.Column(db.Text)
    status = db.Column(db.String(30), nullable=False, default="draft")
    formation_status_notes = db.Column(db.Text)

    principal_address_id = db.Column(db.String(36), db.ForeignKey("addresses.id"))
    mailing_address_id = db.Column(db.String(36), db.ForeignKey("addresses.id"))
    principal_address = db.relationship("Address", foreign_keys=[principal_address_id])
    mailing_address = db.relationship("Address", foreign_keys=[mailing_address_id])

    management_structure = db.Column(db.String(30))  # member_managed | manager_managed

    applications = db.relationship("FormationApplication", backref="business", lazy="dynamic")
    governing_persons = db.relationship("GoverningPerson", backref="business", lazy="dynamic")
    documents = db.relationship("Document", backref="business", lazy="dynamic")
    compliance_tasks = db.relationship("ComplianceTask", backref="business", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "entity_type": self.entity_type, "state": self.state,
            "industry": self.industry, "status": self.status,
            "management_structure": self.management_structure,
            "created_at": self.created_at.isoformat(),
        }


class RegisteredAgent(BaseModel):
    __tablename__ = "registered_agents"

    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=False, unique=True)
    agent_type = db.Column(db.String(20), nullable=False, default="abf")  # abf | self | other
    name = db.Column(db.String(200))
    registered_office_address_id = db.Column(db.String(36), db.ForeignKey("addresses.id"))
    registered_office_address = db.relationship("Address")
    consent_given = db.Column(db.Boolean, default=False, nullable=False)
    consent_given_at = db.Column(db.DateTime)
    # Electronic-signature evidence for registered-agent consent (Part 15):
    # a typed full legal name captured alongside the consent checkbox on
    # the wizard's Registered Agent step. Kept on file as the acceptance
    # record no state in STATES requires this to be filed with the
    # state itself (see registeredAgentRequirements.consentFiledWithState
    # in src/config/stateRequirements.js).
    signer_name = db.Column(db.String(200))
    active = db.Column(db.Boolean, default=True, nullable=False)
    renewal_date = db.Column(db.Date)

    business = db.relationship("Business", backref=db.backref("registered_agent", uselist=False))


class Organizer(BaseModel):
    __tablename__ = "organizers"

    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=False)
    organizer_type = db.Column(db.String(10), nullable=False, default="self")  # self | other
    name = db.Column(db.String(200))
    address_id = db.Column(db.String(36), db.ForeignKey("addresses.id"))
    address = db.relationship("Address")


class GoverningPerson(BaseModel):
    __tablename__ = "governing_persons"

    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(80))  # Member | Manager
    ownership_percentage = db.Column(db.Numeric(5, 2))
    address_id = db.Column(db.String(36), db.ForeignKey("addresses.id"))
    address = db.relationship("Address")

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "title": self.title,
            "ownership_percentage": float(self.ownership_percentage) if self.ownership_percentage is not None else None,
        }


class FormationApplication(BaseModel):
    __tablename__ = "formation_applications"

    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=False, index=True)
    status = db.Column(db.String(30), nullable=False, default="draft")
    effective_date_option = db.Column(db.String(10), default="filing")  # filing | delayed
    effective_date = db.Column(db.Date, nullable=True)
    ein_requested = db.Column(db.Boolean, default=False, nullable=False)
    operating_agreement_requested = db.Column(db.Boolean, default=False, nullable=False)
    package_name = db.Column(db.String(60))
    add_ons = db.Column(db.JSON, default=list)  # list of add-on ids selected non-sensitive
    submitted_at = db.Column(db.DateTime, nullable=True)
    reviewed_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    internal_notes = db.Column(db.Text)
    # Generated-document review acknowledgement (Part 16): recorded the
    # moment the customer checks "I confirm the information above is
    # accurate..." on the Review step, after previewing the state-specific
    # formation document data we're about to prepare from their answers.
    # formation_data_version increments each time they re-confirm (e.g.
    # after going back to correct something), so the acceptance record
    # always reflects which version of their data was actually approved.
    formation_data_confirmed_at = db.Column(db.DateTime, nullable=True)
    formation_data_version = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "business_id": self.business_id, "status": self.status,
            "effective_date_option": self.effective_date_option,
            "package_name": self.package_name, "add_ons": self.add_ons or [],
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "formation_data_confirmed_at": self.formation_data_confirmed_at.isoformat() if self.formation_data_confirmed_at else None,
            "formation_data_version": self.formation_data_version,
        }
