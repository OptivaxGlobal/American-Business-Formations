import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTexasConfig } from '../../config/texas'
import { api, withLocalFallback } from '../../lib/api'
import { useApp } from '../../context/AppContext'
import { useBusiness } from '../../context/BusinessContext'
import { useOrders } from '../../context/OrdersContext'
import { plans } from '../../components/PricingCards'
import { normalizeBusinessName, validateBusinessName } from '../../lib/businessName'
import { validateFullName, validateEmail, validatePhone, validatePreferredContactMethod } from '../../validations/contactValidation'
import { validateStreetAddress, validateCity } from '../../validations/addressValidation'
import { validateText, isValidCalendarDate, valid, invalid } from '../../validations/commonValidation'
import { validateOwnershipPercentage, validateOwnershipTotal, validateEffectiveDate } from '../../validations/formationValidation'
import { validatePassword, validatePasswordConfirmation } from '../../validations/authValidation'
import { validateSelectedPlan, validateCardName, validateCardNumber, validateCardExpiry, validateCardCvc } from '../../validations/paymentValidation'
import { focusFirstInvalid } from '../../lib/formErrors'
import { getActiveAddOns } from '../../data/pricing'

export const texas = getTexasConfig()

export const steps = [
  'Business name', 'Business basics', 'Contact information', 'Business address',
  'Ownership & management', 'Registered agent', 'Organizer', 'Effective date',
  'EIN assistance', 'Additional services', 'Package', 'Account', 'Review', 'Payment', 'Confirmation'
]

// Only currently-sellable add-ons are offered here (temporarily-disabled
// entries like registered-agent are excluded by getActiveAddOns()) — every
// lookup in this file (goNext's plan add, submitPayment's cart build, etc.)
// shares this same filtered list, so a disabled add-on can never be selected
// or charged for even from a stale sessionStorage draft.
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

// --- Session recovery ------------------------------------------------------
// Persists { step, form } to sessionStorage so a refresh or browser back/
// forward restores progress instead of resetting to step 0 — this is what
// makes the sidebar's existing "Your answers save automatically as you go"
// copy actually true. Password and confirm-password are stripped before
// every save and never persisted, even to sessionStorage; the mock payment
// fields (card name/number/expiry/cvc) live in fully separate state that
// this module never touches, so they are never persisted either.
const DRAFT_KEY = 'abf_onboarding_draft'
const NEVER_PERSIST_FIELDS = ['password', 'confirmPassword']
const MAX_RESTORABLE_STEP = 13 // never restore directly into the confirmation step (14) — it requires a live confirmedOrder that isn't persisted

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

function saveDraft(step, form) {
  try {
    const safeForm = { ...form }
    NEVER_PERSIST_FIELDS.forEach(key => { delete safeForm[key] })
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, form: safeForm, savedAt: Date.now() }))
  } catch {
    // sessionStorage unavailable (private browsing, quota, etc.) fail silently, same convention as AppContext's draft persistence
  }
}

function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* storage unavailable */ }
}

export default function useOnboardingWizard() {
  const { user, notify, businessName: draftBusinessName, setBusinessName } = useApp()
  const { addBusiness } = useBusiness()
  const { addToCart, checkout } = useOrders()
  const navigate = useNavigate()

  const [initialDraft] = useState(() => loadDraft())

  const [step, setStep] = useState(() => {
    const restored = initialDraft?.step
    return typeof restored === 'number' ? Math.min(Math.max(restored, 0), MAX_RESTORABLE_STEP) : 0
  })
  const [loading, setLoading] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [nameError, setNameError] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const fieldRefs = useRef({})

  // Kept separate from `form` on purpose: these mock card fields are
  // validated for format only and are never merged into the saved
  // business/order state, never sent to any API, and never persisted to
  // sessionStorage a production build replaces this whole panel with
  // Stripe's hosted fields.
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', cardExpiry: '', cardCvc: '' })
  const [paymentErrors, setPaymentErrors] = useState({})
  const paymentValidators = { cardName: validateCardName, cardNumber: validateCardNumber, cardExpiry: validateCardExpiry, cardCvc: validateCardCvc }
  const handlePaymentChange = (key, value) => {
    setPayment(p => ({ ...p, [key]: value }))
    if (paymentErrors[key]) {
      const result = paymentValidators[key](value)
      setPaymentErrors(e => ({ ...e, [key]: result.valid ? '' : result.message }))
    }
  }
  const markPaymentTouched = (key) => {
    const result = paymentValidators[key](payment[key])
    setPaymentErrors(e => ({ ...e, [key]: result.valid ? '' : result.message }))
  }
  const computePaymentErrors = () => {
    const result = {}
    Object.keys(paymentValidators).forEach(key => {
      const r = paymentValidators[key](payment[key])
      if (!r.valid) result[key] = r.message
    })
    return result
  }

  const defaultForm = {
    businessName: draftBusinessName || businessNameFromQuery(), altName: '', nameFinalized: true, industry: '', purpose: '', county: '', city: '', launchDate: '',
    fullName: user?.name || '', email: user?.email || '', phone: '', commPref: 'email',
    principalAddress: '', mailingSame: true, mailingAddress: '', addressPrivacy: false,
    registeredAgentType: 'abf', registeredAgentName: '', registeredOfficeAddress: '', registeredAgentConsent: false,
    entityType: 'LLC', owners: '1', management: 'Member-managed', ownerDetails: [{ name: '', percentage: 100 }],
    organizerType: 'self', organizerName: '', organizerAddress: '',
    effectiveDateOption: 'filing', effectiveDate: '',
    employees: 'none', hiring: false, salesTax: false,
    needsEIN: true, expectEmployees: false, needsBanking: true, responsibleParty: '',
    plan: 'Accelerated', addOns: [],
    accountEmail: user?.email || '', password: '', confirmPassword: '', termsAccepted: false, marketingConsent: false,
    finalTermsAccepted: false
  }
  const [form, setForm] = useState(() => (initialDraft?.form ? { ...defaultForm, ...initialDraft.form } : defaultForm))

  useEffect(() => { setBusinessName(form.businessName) }, [form.businessName])
  const set = (key, value) => setForm(v => ({ ...v, [key]: value }))

  // Debounced session-recovery autosave — never fires more than once every
  // 400ms of inactivity, matching the "don't repeatedly write on every
  // keystroke" convention already used elsewhere in the app. Stops once the
  // order is confirmed (the draft is explicitly cleared at that point instead).
  const saveTimeoutRef = useRef(null)
  useEffect(() => {
    if (confirmedOrder) return
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveDraft(step, form), 400)
    return () => clearTimeout(saveTimeoutRef.current)
  }, [step, form, confirmedOrder])

  // Central map of field -> validator. Each validator reads whatever
  // conditional context it needs off the live form (and `user`) so the
  // same function backs both per-field onBlur checks and the per-step
  // "Continue" gate below.
  const fieldValidators = useMemo(() => ({
    businessName: f => validateBusinessName(f.businessName),
    industry: f => f.industry ? valid() : invalid('Select an industry.'),
    purpose: f => validateText(f.purpose, { required: true, min: 5, max: 500, label: 'Business purpose' }),
    county: f => validateText(f.county, { required: true, min: 2, max: 100, label: 'County' }),
    city: f => validateCity(f.city, { required: true }),
    launchDate: f => (!f.launchDate || isValidCalendarDate(f.launchDate)) ? valid() : invalid('Enter a valid date.'),
    fullName: f => validateFullName(f.fullName, { required: true }),
    email: f => validateEmail(f.email, { required: true }),
    phone: f => validatePhone(f.phone, { required: true }),
    commPref: f => validatePreferredContactMethod(f.commPref, ['email', 'phone', 'sms']),
    principalAddress: f => validateStreetAddress(f.principalAddress, { required: true }),
    mailingAddress: f => f.mailingSame ? valid() : validateStreetAddress(f.mailingAddress, { required: true }),
    registeredAgentName: f => f.registeredAgentType === 'abf' ? valid() : validateText(f.registeredAgentName, { required: true, min: 2, max: 200, label: 'Registered agent name' }),
    registeredOfficeAddress: f => f.registeredAgentType === 'abf' ? valid() : validateStreetAddress(f.registeredOfficeAddress, { required: true, disallowPoBox: true }),
    registeredAgentConsent: f => f.registeredAgentConsent ? valid() : invalid('You must confirm registered agent consent before continuing.'),
    organizerName: f => f.organizerType !== 'other' ? valid() : validateFullName(f.organizerName, { required: true }),
    organizerAddress: f => f.organizerType !== 'other' ? valid() : validateStreetAddress(f.organizerAddress, { required: true }),
    effectiveDate: f => f.effectiveDateOption !== 'delayed' ? valid() : validateEffectiveDate(f.effectiveDate, { maxDaysOut: 90 }),
    responsibleParty: f => !f.needsEIN ? valid() : validateFullName(f.responsibleParty, { required: true }),
    plan: f => validateSelectedPlan(f.plan, plans),
    accountEmail: f => user ? valid() : validateEmail(f.accountEmail, { required: true }),
    password: f => user ? valid() : validatePassword(f.password, { required: true }),
    confirmPassword: f => user ? valid() : validatePasswordConfirmation(f.password, f.confirmPassword),
    termsAccepted: f => (user || f.termsAccepted) ? valid() : invalid('You must agree to the Terms of Service before continuing.'),
    finalTermsAccepted: f => f.finalTermsAccepted ? valid() : invalid('You must agree before completing your purchase.')
  }), [user])

  const stepFields = {
    0: ['businessName', 'industry'],
    1: ['purpose', 'county', 'city', 'launchDate'],
    2: ['fullName', 'email', 'phone', 'commPref'],
    3: ['principalAddress', 'mailingAddress'],
    5: ['registeredAgentName', 'registeredOfficeAddress', 'registeredAgentConsent'],
    6: ['organizerName', 'organizerAddress'],
    7: ['effectiveDate'],
    8: ['responsibleParty'],
    10: ['plan'],
    11: ['accountEmail', 'password', 'confirmPassword', 'termsAccepted'],
    12: ['finalTermsAccepted']
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

  const handleFieldChange = (key, value) => {
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
  const toggleAddOn = id => setForm(v => ({ ...v, addOns: v.addOns.includes(id) ? v.addOns.filter(x => x !== id) : [...v.addOns, id] }))

  const ownerPercentTotal = useMemo(() => form.ownerDetails.reduce((s, o) => s + (Number(o.percentage) || 0), 0), [form.ownerDetails])
  const selectedPlan = useMemo(() => plans.find(p => p.name === form.plan) || plans[1], [form.plan])
  const stateFee = texas.filingFee

  const goNext = () => {
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
    if (step === 10) addToCart({ id: `plan-${selectedPlan.name}`, type: 'plan', name: `${selectedPlan.name} plan`, price: priceToNumber(selectedPlan.price) })
    setStep(s => Math.min(s + 1, steps.length - 1))
  }
  const goBack = () => step === 0 ? navigate('/') : setStep(s => s - 1)

  const findFirstInvalidStep = () => {
    for (let s = 0; s <= 12; s++) {
      if (Object.keys(computeStepErrors(s, form)).length) return s
    }
    return null
  }

  const submitPayment = async () => {
    const invalidStep = findFirstInvalidStep()
    if (invalidStep !== null) {
      notify('Please complete the required information before finishing checkout.')
      setStep(invalidStep)
      return
    }
    const paymentFieldErrors = computePaymentErrors()
    setPaymentErrors(paymentFieldErrors)
    if (Object.keys(paymentFieldErrors).length) {
      focusFirstInvalid(fieldRefs, paymentFieldErrors, ['cardName', 'cardNumber', 'cardExpiry', 'cardCvc'])
      return
    }
    if (loading) return // duplicate-submission guard: a second click while a request is already in flight is a no-op
    setLoading(true)
    addToCart({ id: `plan-${selectedPlan.name}`, type: 'plan', name: `${selectedPlan.name} plan`, price: priceToNumber(selectedPlan.price) })
    addToCart({ id: 'state-fee-tx', type: 'state-fee', name: 'Texas state filing fee', price: stateFee })
    form.addOns.forEach(id => {
      const item = addOnCatalog.find(a => a.id === id)
      if (item) addToCart({ id: `addon-${item.id}`, type: 'add-on', name: item.name, price: item.price })
    })
    const business = addBusiness({
      name: form.businessName, entityType: form.entityType, state: 'Texas', industry: form.industry,
      description: form.purpose, owners: form.owners, management: form.management,
      registeredAgentType: form.registeredAgentType, organizerType: form.organizerType,
      effectiveDateOption: form.effectiveDateOption,
      services: [selectedPlan.name, ...form.addOns]
    })
    try {
      await withLocalFallback(() => api.submitOnboarding({ ...form, state: 'Texas', stateFee }), () => ({ ok: true }))
    } catch (err) {
      // A genuine backend rejection (not a network/5xx/404 fallback case) must
      // never be shown to the user as a success — surface it and let them retry.
      setLoading(false)
      setFormError(err?.message || 'We could not save your order. Please try again.')
      notify('We could not complete checkout. Please try again.')
      return
    }
    setTimeout(() => {
      const order = checkout(business.id)
      setConfirmedOrder(order)
      clearDraft()
      notify('Your LLC formation plan has been saved.')
      setLoading(false)
      setStep(14)
    }, 700)
  }

  return {
    user, notify, navigate, steps,
    step, setStep, loading, confirmedOrder,
    nameError, setNameError,
    errors, setErrors, touched, setTouched, formError, fieldRefs,
    payment, paymentErrors, handlePaymentChange, markPaymentTouched,
    form, set, handleFieldChange, markTouched,
    setOwnerCount, setOwnerField, markOwnerTouched, toggleAddOn,
    ownerPercentTotal, selectedPlan, stateFee, texas,
    goNext, goBack, submitPayment,
    addOnCatalog, plans
  }
}
