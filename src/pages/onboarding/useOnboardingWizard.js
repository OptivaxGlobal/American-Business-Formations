import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getStateFilingFee, isSupportedState, getState, isVirtualOfficeAvailable } from '../../data/states'
import { getEntityTypeOptions } from '../../config/stateRequirements'
import { api } from '../../lib/api'
import { useApp } from '../../context/AppContext'
import { normalizeBusinessName, validateBusinessName } from '../../lib/businessName'
import { validateFullName, validateEmail, validatePhone, validatePreferredContactMethod } from '../../validations/contactValidation'
import { validateStreetAddress, validateCity, validateZip } from '../../validations/addressValidation'
import { validateText, isValidCalendarDate, valid, invalid } from '../../validations/commonValidation'
import { validateOwnershipPercentage, validateOwnershipTotal, validateEffectiveDate } from '../../validations/formationValidation'
import { validatePassword, validatePasswordConfirmation } from '../../validations/authValidation'
import { validateSelectedPlan } from '../../validations/paymentValidation'
import { focusFirstInvalid } from '../../lib/formErrors'
import { getActiveAddOns } from '../../data/pricing'
import { plans } from '../../components/PricingCards'

export const steps = [
  'Business name', 'Business basics', 'Contact information', 'Business address',
  'Ownership & management', 'Registered agent', 'Organizer', 'Effective date',
  'EIN assistance', 'Additional services', 'Documents & verification', 'Package',
  'Account', 'Review', 'Submit order', 'Confirmation'
]

// Index of the 'Account' step above the one place an anonymous visitor's
// email/password/terms collected in AccountStep.jsx must actually become a
// real signed-in session (see goNext below) before Review/Submit, which
// both require a JWT, can possibly succeed. (Shifted from 11 -> 12 by the
// new "Documents & verification" step inserted before Package.)
const ACCOUNT_STEP = 12
// Index of the Review step, used as the upper bound when validating every
// prior step before allowing final submission (see findFirstInvalidStep).
const REVIEW_STEP = 13

// Only currently-sellable add-ons are offered here (temporarily-disabled
// entries like registered-agent are excluded by getActiveAddOns()) every
// lookup in this file shares this same filtered list, so a disabled add-on
// can never be selected or ordered even from a stale sessionStorage draft.
export const addOnCatalog = getActiveAddOns()

export function priceToNumber(price) {
  return Number(String(price).replace(/[^0-9.]/g, '')) || 0
}

function businessNameFromQuery() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('businessName')
    return fromQuery ? normalizeBusinessName(fromQuery) : ''
  } catch {
    return ''
  }
}

// Maps the wizard's camelCase form state to the exact snake_case shape
// POST/GET /api/applications expects (server/app/api/applications.py).
// Registered-office and organizer address fields are only included when
// they're actually collected (self/abf registered agent and "I am the
// organizer" never show those inputs, so there's nothing valid to send).
export function buildApplicationPayload(form, businessId) {
  const payload = {
    business_name: form.businessName,
    state: form.state,
    entity_type: form.entityType,
    industry: form.industry,
    purpose: form.purpose,
    management_structure: form.management,
    principal_line1: form.principalLine1,
    principal_city: form.principalCity,
    principal_zip: form.principalZip,
    // No county field is collected from the customer (Part 1) for the
    // one state that actually requires it on its own formation document
    // (New York), the backend derives it server-side from this verified
    // address via the U.S. Census Geocoder (see
    // server/app/services/geocoding.py) rather than asking for it here.
    registered_agent_type: form.registeredAgentType,
    registered_agent_name: form.registeredAgentName,
    registered_agent_consent: form.registeredAgentConsent,
    registered_agent_signer_name: form.registeredAgentSignerName,
    organizer_type: form.organizerType,
    organizer_name: form.organizerName,
    effective_date_option: form.effectiveDateOption,
    needs_ein: form.needsEIN,
    package_name: form.plan,
    add_ons: form.addOns,
    owners: form.ownerDetails.map(o => ({ name: o.name, percentage: Number(o.percentage) || 0 }))
  }
  if (businessId) payload.business_id = businessId
  // Generated-document review acknowledgement (Part 16) only sent once the
  // customer has actually checked the box on the Review step; omitted
  // otherwise so an in-progress autosave from an earlier step never
  // overwrites a previously-recorded approval with "unapproved."
  if (form.formationReviewApproved) {
    payload.formation_review_approved = true
    payload.formation_review_version = form.formationReviewVersion
  }
  if (form.effectiveDateOption === 'delayed') payload.effective_date = form.effectiveDate
  if (form.registeredAgentType !== 'abf') {
    payload.registered_office_line1 = form.registeredOfficeLine1
    payload.registered_office_city = form.registeredOfficeCity
    payload.registered_office_zip = form.registeredOfficeZip
  }
  if (form.organizerType === 'other') {
    payload.organizer_line1 = form.organizerLine1
    payload.organizer_city = form.organizerCity
    payload.organizer_zip = form.organizerZip
  }
  return payload
}

function generateIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// --- Session recovery ------------------------------------------------------
// Persists { step, form, businessId } to sessionStorage so a refresh or
// browser back/forward restores progress instead of resetting to step 0.
// Password/confirm-password are stripped before every save and never
// persisted, even to sessionStorage there is no card data anywhere in
// this module to worry about (the mock payment form has been removed).
const DRAFT_KEY = 'abf_onboarding_draft'
const NEVER_PERSIST_FIELDS = ['password', 'confirmPassword']
const MAX_RESTORABLE_STEP = 14 // never restore directly into the confirmation step (15) that requires a live order fetched from the server

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || typeof parsed.form !== 'object' || parsed.form === null) return null
    return parsed
  } catch {
    return null
  }
}

function saveDraft(step, form, businessId) {
  try {
    const safeForm = { ...form }
    NEVER_PERSIST_FIELDS.forEach(key => { delete safeForm[key] })
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form: safeForm, businessId: businessId || null, savedAt: Date.now() }))
  } catch {
    // sessionStorage unavailable (private browsing, quota, etc.) fail silently, same convention as AppContext's draft persistence
  }
}

function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* storage unavailable */ }
}

export default function useOnboardingWizard() {
  const { user, notify, login, businessName: draftBusinessName, setBusinessName } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderIdFromUrl = searchParams.get('order')

  const [initialDraft] = useState(() => loadDraft())

  const [step, setStep] = useState(() => {
    const restored = initialDraft?.step
    return typeof restored === 'number' ? Math.min(Math.max(restored, 0), MAX_RESTORABLE_STEP) : 0
  })
  const [loading, setLoading] = useState(false)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [businessId, setBusinessId] = useState(initialDraft?.businessId || null)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | failed
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [confirmationError, setConfirmationError] = useState('')
  const [nameError, setNameError] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const fieldRefs = useRef({})
  const [idempotencyKey] = useState(generateIdempotencyKey)

  const defaultForm = {
    businessName: draftBusinessName || businessNameFromQuery(), altName: '', nameFinalized: true, industry: '', purpose: '', launchDate: '',
    // Formation state drives the real government filing fee shown from
    // this point forward (see stateFee below) and is what checkout.py
    // independently re-validates and re-prices from server-side this
    // default is only a starting point on-screen, never assumed silently.
    state: 'TX',
    fullName: user?.name || '', email: user?.email || '', phone: '', commPref: 'email',
    principalLine1: '', principalCity: '', principalZip: '', mailingSame: true, mailingLine1: '', mailingCity: '', mailingZip: '', addressPrivacy: false,
    registeredAgentType: 'abf', registeredAgentName: '', registeredOfficeLine1: '', registeredOfficeCity: '', registeredOfficeZip: '', registeredAgentConsent: false,
    // Electronic signature evidence for registered-agent consent (Part 15)
    // a typed full legal name captured alongside the consent checkbox,
    // with the timestamp recorded server-side the moment consent is given
    // (RegisteredAgent.consent_given_at).
    registeredAgentSignerName: '',
    entityType: 'LLC', owners: '1', management: 'Member-managed', ownerDetails: [{ name: '', percentage: 100 }],
    organizerType: 'self', organizerName: '', organizerLine1: '', organizerCity: '', organizerZip: '',
    effectiveDateOption: 'filing', effectiveDate: '',
    employees: 'none', hiring: false, salesTax: false,
    needsEIN: true, expectEmployees: false, needsBanking: true, responsibleParty: '',
    plan: 'Accelerated', addOns: [],
    accountEmail: user?.email || '', password: '', confirmPassword: '', termsAccepted: false, marketingConsent: false,
    // Generated formation-document review acknowledgement (Part 16) —
    // distinct from finalTermsAccepted (the checkout/billing terms
    // agreement); this one specifically confirms the filing data itself.
    formationReviewApproved: false, formationReviewApprovedAt: '', formationReviewVersion: 0,
    finalTermsAccepted: false
  }
  const [form, setForm] = useState(() => (initialDraft?.form ? { ...defaultForm, ...initialDraft.form } : defaultForm))

  useEffect(() => { setBusinessName(form.businessName) }, [form.businessName])
  const set = (key, value) => setForm(v => ({ ...v, [key]: value }))

  // Load a confirmed order fresh from the server whenever the URL carries
  // one (?order=<id>) this is what makes the confirmation step survive a
  // refresh instead of depending on the confirmedOrder React state set at
  // submission time, and is exactly how a returning/refreshed tab lands
  // back on the right screen with the server's real status and totals.
  useEffect(() => {
    if (!orderIdFromUrl) return
    let cancelled = false
    setConfirmationError('')
    api.getOrder(orderIdFromUrl)
      .then(result => {
        if (cancelled) return
        setConfirmedOrder(result?.data || null)
        clearDraft()
        setStep(steps.length - 1) // Confirmation is always the last step
      })
      .catch(err => {
        if (cancelled) return
        setConfirmationError(err?.message || 'We could not load your order. Please check the link or contact support.')
      })
    return () => { cancelled = true }
  }, [orderIdFromUrl])

  // Debounced session-recovery autosave to sessionStorage never fires
  // more than once every 400ms of inactivity. Runs regardless of auth state
  // (this is the safe, non-sensitive draft Step 2 explicitly allows).
  const saveTimeoutRef = useRef(null)
  useEffect(() => {
    if (confirmedOrder) return
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveDraft(step, form, businessId), 400)
    return () => clearTimeout(saveTimeoutRef.current)
  }, [step, form, businessId, confirmedOrder])

  // Once the visitor is authenticated, also autosave the application to the
  // real backend (debounced the same way) so "Saving.../Saved/Save failed"
  // reflects an actual server round-trip, not just the local sessionStorage
  // write above. Waits for a plausible business name so the very first
  // render (before the user has typed anything) doesn't immediately flash
  // "Save failed" from a 422 on an empty name.
  const backendSaveTimeoutRef = useRef(null)
  useEffect(() => {
    if (confirmedOrder || !user) return
    if (!form.businessName || form.businessName.trim().length < 2) return
    clearTimeout(backendSaveTimeoutRef.current)
    backendSaveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        const result = await api.saveApplication(buildApplicationPayload(form, businessId))
        const savedBusinessId = result?.data?.business?.id
        if (savedBusinessId) setBusinessId(savedBusinessId)
        setSaveStatus('saved')
      } catch {
        setSaveStatus('failed')
      }
    }, 600)
    return () => clearTimeout(backendSaveTimeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, form, confirmedOrder, user])

  // Central map of field -> validator. Each validator reads whatever
  // conditional context it needs off the live form (and `user`) so the
  // same function backs both per-field onBlur checks and the per-step
  // "Continue" gate below.
  const fieldValidators = useMemo(() => ({
    businessName: f => validateBusinessName(f.businessName),
    state: f => isSupportedState(f.state) ? valid() : invalid('Select a state where LLC formation is currently available.'),
    industry: f => f.industry ? valid() : invalid('Select an industry.'),
    purpose: f => validateText(f.purpose, { required: true, min: 5, max: 500, label: 'Business purpose' }),
    entityType: f => getEntityTypeOptions(f.state).find(t => t.id === f.entityType)?.available
      ? valid() : invalid('This entity type is not currently available in your selected state. Choose another option below.'),
    launchDate: f => (!f.launchDate || isValidCalendarDate(f.launchDate)) ? valid() : invalid('Enter a valid date.'),
    fullName: f => validateFullName(f.fullName, { required: true }),
    email: f => validateEmail(f.email, { required: true }),
    phone: f => validatePhone(f.phone, { required: true }),
    commPref: f => validatePreferredContactMethod(f.commPref, ['email', 'phone', 'sms']),
    principalLine1: f => validateStreetAddress(f.principalLine1, { required: true }),
    principalCity: f => validateCity(f.principalCity, { required: true }),
    principalZip: f => validateZip(f.principalZip, { required: true }),
    mailingLine1: f => f.mailingSame ? valid() : validateStreetAddress(f.mailingLine1, { required: true }),
    mailingCity: f => f.mailingSame ? valid() : validateCity(f.mailingCity, { required: true }),
    mailingZip: f => f.mailingSame ? valid() : validateZip(f.mailingZip, { required: true }),
    registeredAgentName: f => f.registeredAgentType === 'abf' ? valid() : validateText(f.registeredAgentName, { required: true, min: 2, max: 200, label: 'Registered agent name' }),
    registeredOfficeLine1: f => f.registeredAgentType === 'abf' ? valid() : validateStreetAddress(f.registeredOfficeLine1, { required: true, disallowPoBox: true }),
    registeredOfficeCity: f => f.registeredAgentType === 'abf' ? valid() : validateCity(f.registeredOfficeCity, { required: true }),
    registeredOfficeZip: f => f.registeredAgentType === 'abf' ? valid() : validateZip(f.registeredOfficeZip, { required: true }),
    registeredAgentConsent: f => f.registeredAgentConsent ? valid() : invalid('You must confirm registered agent consent before continuing.'),
    registeredAgentSignerName: f => validateFullName(f.registeredAgentSignerName, { required: true }),
    organizerName: f => f.organizerType !== 'other' ? valid() : validateFullName(f.organizerName, { required: true }),
    organizerLine1: f => f.organizerType !== 'other' ? valid() : validateStreetAddress(f.organizerLine1, { required: true }),
    organizerCity: f => f.organizerType !== 'other' ? valid() : validateCity(f.organizerCity, { required: true }),
    organizerZip: f => f.organizerType !== 'other' ? valid() : validateZip(f.organizerZip, { required: true }),
    effectiveDate: f => f.effectiveDateOption !== 'delayed' ? valid() : validateEffectiveDate(f.effectiveDate, { maxDaysOut: 90 }),
    responsibleParty: f => !f.needsEIN ? valid() : validateFullName(f.responsibleParty, { required: true }),
    plan: f => validateSelectedPlan(f.plan, plans),
    accountEmail: f => user ? valid() : validateEmail(f.accountEmail, { required: true }),
    password: f => user ? valid() : validatePassword(f.password, { required: true }),
    confirmPassword: f => user ? valid() : validatePasswordConfirmation(f.password, f.confirmPassword),
    termsAccepted: f => (user || f.termsAccepted) ? valid() : invalid('You must agree to the Terms of Service before continuing.'),
    formationReviewApproved: f => f.formationReviewApproved ? valid() : invalid('Please confirm your formation details are accurate before continuing.'),
    finalTermsAccepted: f => f.finalTermsAccepted ? valid() : invalid('You must agree before completing your purchase.')
  }), [user])

  // Step 10 ("Documents & verification") intentionally has no entry here —
  // it never blocks Continue. Required customer uploads are rare (see
  // src/config/stateRequirements.js none of the 52 states/jurisdictions require one for
  // a standard formation) and conditional ones only appear once the
  // customer has an account/business record to attach a file to (Part 14);
  // blocking the step itself before that record exists would create a
  // dead end. Progress is still shown ("X of Y completed") and any
  // outstanding item stays visible on the customer's dashboard afterward.
  const stepFields = {
    0: ['businessName', 'state', 'industry'],
    // Business Basics collects the principal business address directly
    // (no separate County field see src/config/stateRequirements.js;
    // the one state whose own formation document actually asks for a
    // county, New York, has it derived server-side from this same
    // verified address instead of asking the customer to pick one).
    // These are the exact same form fields (principalLine1/City/Zip) the
    // Business Address step below reads and edits one address record,
    // entered once, never asked for twice.
    1: ['purpose', 'principalLine1', 'principalCity', 'principalZip', 'entityType', 'launchDate'],
    2: ['fullName', 'email', 'phone', 'commPref'],
    // Only the mailing address (when different from principal) is
    // validated here the principal address was already required and
    // validated back on Business Basics.
    3: ['mailingLine1', 'mailingCity', 'mailingZip'],
    5: ['registeredAgentName', 'registeredOfficeLine1', 'registeredOfficeCity', 'registeredOfficeZip', 'registeredAgentConsent', 'registeredAgentSignerName'],
    6: ['organizerName', 'organizerLine1', 'organizerCity', 'organizerZip'],
    7: ['effectiveDate'],
    8: ['responsibleParty'],
    11: ['plan'],
    12: ['accountEmail', 'password', 'confirmPassword', 'termsAccepted'],
    13: ['formationReviewApproved', 'finalTermsAccepted']
  }

  const computeOwnerErrors = (f) => {
    const result = {}
    if (f.owners !== '4+') {
      f.ownerDetails.forEach((o, i) => {
        const nameResult = validateFullName(o.name, { required: true })
        if (!nameResult.valid) result[`ownerName${i}`] = nameResult.message
        const pctResult = validateOwnershipPercentage(o.percentage)
        if (!pctResult.valid) result[`ownerPct${i}`] = pctResult.message
      })
      const anyPctError = Object.keys(result).some(k => k.startsWith('ownerPct'))
      if (!anyPctError) {
        const totalResult = validateOwnershipTotal(f.ownerDetails)
        if (!totalResult.valid) result.ownerTotal = totalResult.message
      }
    }
    return result
  }

  const computeStepErrors = (stepIndex, f) => {
    if (stepIndex === 4) return computeOwnerErrors(f)
    const fields = stepFields[stepIndex] || []
    const result = {}
    fields.forEach(key => {
      const r = fieldValidators[key](f)
      if (!r.valid) result[key] = r.message
    })
    return result
  }

  const markTouched = (key) => {
    setTouched(t => ({ ...t, [key]: true }))
    const validator = fieldValidators[key]
    if (validator) {
      const result = validator(form)
      setErrors(e => ({ ...e, [key]: result.valid ? '' : result.message }))
    }
  }

  // Changing the formation state must never reset the whole application —
  // only the state-scoped pieces that could now be wrong: the City
  // autocomplete (a different state's geography see
  // src/data/geography/; the street address and ZIP are free text and
  // not state-sourced, so they're left alone rather than wiped) and, if
  // the now-selected entity type isn't offered in the new state (e.g.
  // Series LLC picked while on Texas, then switched to California), the
  // entity type falls back to the standard LLC every state supports.
  // Everything else the customer already entered (name, addresses,
  // agent, owners, etc.) is left exactly as-is. stateFee/selectedState
  // below already recompute from `form.state` on every render, and
  // DocumentsStep/BusinessBasicsStep re-derive their state-specific
  // content the same way nothing needs to be "reset," it's all
  // live-derived from this one field.
  const handleFieldChange = (key, value) => {
    if (key === 'state' && value !== form.state) {
      const stillAvailable = getEntityTypeOptions(value).find(t => t.id === form.entityType && t.available)
      // Virtual Office stayed at its original 21-state footprint even
      // though LLC Formation went nationwide (Part 7) — if the new state
      // doesn't have it, drop it from the selected add-ons rather than
      // leaving a now-unavailable service silently selected through
      // checkout. Mail Forwarding has no such restriction.
      const dropVirtualOffice = form.addOns.includes('virtual-office') && !isVirtualOfficeAvailable(value)
      setForm(v => ({
        ...v, state: value, principalCity: '', entityType: stillAvailable ? v.entityType : 'LLC',
        addOns: dropVirtualOffice ? v.addOns.filter(id => id !== 'virtual-office') : v.addOns,
      }))
      setErrors(e => ({ ...e, principalCity: '' }))
      if (touched.state) {
        const result = fieldValidators.state({ ...form, state: value })
        setErrors(e => ({ ...e, state: result.valid ? '' : result.message }))
      }
      return
    }
    set(key, value)
    if (touched[key]) {
      const validator = fieldValidators[key]
      if (validator) {
        const result = validator({ ...form, [key]: value })
        setErrors(e => ({ ...e, [key]: result.valid ? '' : result.message }))
      }
    }
  }

  const setOwnerCount = (count) => {
    const n = count === '4+' ? 4 : Number(count)
    const details = Array.from({ length: n }, (_, i) => form.ownerDetails[i] || { name: '', percentage: Math.round(100 / n) })
    setForm(v => ({ ...v, owners: count, ownerDetails: details }))
  }
  const setOwnerField = (i, key, value) => setForm(v => ({ ...v, ownerDetails: v.ownerDetails.map((o, idx) => idx === i ? { ...o, [key]: value } : o) }))
  const markOwnerTouched = (i) => {
    setTouched(t => ({ ...t, [`ownerName${i}`]: true, [`ownerPct${i}`]: true }))
    setErrors(e => ({ ...e, ...computeOwnerErrors(form) }))
  }
  // Virtual Office and Mail Forwarding are alternatives, not a bundle both
  // are the same underlying business-address service, priced differently
  // depending on whether a lease agreement is included. Selecting one
  // always drops the other, so a customer can never end up subscribed to
  // (and billed for) both address services at once.
  const MUTUALLY_EXCLUSIVE_ADD_ONS = [['virtual-office', 'mail-forwarding']]
  const toggleAddOn = id => setForm(v => {
    if (v.addOns.includes(id)) return { ...v, addOns: v.addOns.filter(x => x !== id) }
    const exclusiveGroup = MUTUALLY_EXCLUSIVE_ADD_ONS.find(group => group.includes(id))
    const withoutExclusivePartner = exclusiveGroup ? v.addOns.filter(x => !exclusiveGroup.includes(x)) : v.addOns
    return { ...v, addOns: [...withoutExclusivePartner, id] }
  })

  const ownerPercentTotal = useMemo(() => form.ownerDetails.reduce((s, o) => s + (Number(o.percentage) || 0), 0), [form.ownerDetails])
  const selectedPlan = useMemo(() => plans.find(p => p.name === form.plan) || plans[1], [form.plan])
  // The real government filing fee for whichever state the customer chose
  // in Step 1 (src/data/states.js) never a single hardcoded state's fee.
  // checkout.py independently recomputes this server-side from
  // business.state before an order is ever priced for real.
  const stateFee = getStateFilingFee(form.state) ?? 0
  const selectedState = getState(form.state)

  const goNext = async () => {
    const order = step === 4 ? Object.keys(computeOwnerErrors(form)) : (stepFields[step] || [])
    const stepErrors = computeStepErrors(step, form)
    setErrors(prev => {
      const next = { ...prev }
      const keysToClear = step === 4
        ? form.ownerDetails.flatMap((_, i) => [`ownerName${i}`, `ownerPct${i}`]).concat('ownerTotal')
        : (stepFields[step] || [])
      keysToClear.forEach(k => { delete next[k] })
      return { ...next, ...stepErrors }
    })
    if (step === 4) {
      const allKeys = form.ownerDetails.flatMap((_, i) => [`ownerName${i}`, `ownerPct${i}`]).concat('ownerTotal')
      setTouched(t => ({ ...t, ...Object.fromEntries(allKeys.map(k => [k, true])) }))
    } else {
      setTouched(t => ({ ...t, ...Object.fromEntries(order.map(k => [k, true])) }))
    }
    if (Object.keys(stepErrors).length) {
      setFormError('Please correct the highlighted fields before continuing.')
      focusFirstInvalid(fieldRefs, stepErrors, step === 4 ? Object.keys(stepErrors) : order)
      return
    }
    setFormError('')

    // AccountStep.jsx only ever collected accountEmail/password/terms into
    // local wizard state nothing previously turned that into a real
    // account. An anonymous visitor could fill it in, see it marked
    // "completed" in the sidebar, and reach Submit Order still fully
    // anonymous: saveApplication/submitApplication/createCheckoutSession
    // all require a JWT, so submission failed with a 401 every time,
    // reported as "We could not submit your order." Real signup now
    // happens here, the one place that transition actually needs to occur
    // never a fake "completed" state for a step that did nothing.
    if (step === ACCOUNT_STEP && !user) {
      setCreatingAccount(true)
      try {
        const result = await api.signup({
          name: form.fullName,
          email: form.accountEmail,
          password: form.password,
          marketing_consent: form.marketingConsent,
        })
        const newUser = result?.data
        if (!newUser) throw new Error('We could not create your account. Please try again.')
        login(newUser)
      } catch (err) {
        setCreatingAccount(false)
        if (err?.fieldErrors && Object.keys(err.fieldErrors).length) {
          setErrors(prev => ({ ...prev, ...err.fieldErrors }))
        }
        setFormError(err?.message || 'We could not create your account. Please try again.')
        focusFirstInvalid(fieldRefs, err?.fieldErrors || {}, ['accountEmail', 'password', 'confirmPassword'])
        return
      }
      setCreatingAccount(false)
    }

    setStep(s => Math.min(s + 1, steps.length - 1))
  }
  const goBack = () => step === 0 ? navigate('/') : setStep(s => s - 1)

  const findFirstInvalidStep = () => {
    for (let s = 0; s <= REVIEW_STEP; s++) {
      if (Object.keys(computeStepErrors(s, form)).length) return s
    }
    return null
  }

  const submitOrder = async () => {
    const invalidStep = findFirstInvalidStep()
    if (invalidStep !== null) {
      notify('Please complete the required information before finishing checkout.')
      setStep(invalidStep)
      return
    }
    if (loading) return // duplicate-submission guard: a second click while a request is already in flight is a no-op
    setLoading(true)
    setFormError('')
    try {
      setSaveStatus('saving')
      const saveResult = await api.saveApplication(buildApplicationPayload(form, businessId))
      const savedBusinessId = saveResult?.data?.business?.id || businessId
      setBusinessId(savedBusinessId)
      setSaveStatus('saved')

      await api.submitApplication(savedBusinessId)

      const checkoutResult = await api.createCheckoutSession({
        business_id: savedBusinessId,
        package_id: selectedPlan.name,
        add_on_ids: form.addOns,
        idempotency_key: idempotencyKey
      })
      const order = checkoutResult?.data?.order
      if (!order) throw new Error('We could not submit your order. Please try again.')

      clearDraft()
      notify('Your formation order has been received.')
      setLoading(false)
      navigate(`/formation-details?order=${order.id}`)
    } catch (err) {
      // A genuine backend rejection must never be shown to the user as a
      // success the draft is kept intact and the user can retry from
      // exactly where they left off, with the same idempotency key so a
      // retry can never create a second order.
      setLoading(false)
      setSaveStatus('failed')
      setFormError(err?.message || 'We could not submit your order. Please try again.')
      notify('We could not submit your order. Please try again.')
    }
  }

  return {
    user, notify, navigate, steps,
    step, setStep, loading, creatingAccount, confirmedOrder, confirmationError,
    saveStatus, businessId,
    nameError, setNameError,
    errors, setErrors, touched, setTouched, formError, fieldRefs,
    form, set, handleFieldChange, markTouched,
    setOwnerCount, setOwnerField, markOwnerTouched, toggleAddOn,
    ownerPercentTotal, selectedPlan, stateFee, selectedState,
    goNext, goBack, submitOrder,
    addOnCatalog, plans
  }
}
