import {
  ArrowLeft, ArrowRight, Building2, Calendar, Check, CheckCircle2, CreditCard,
  FileText, IdCard, Loader2, Lock, MapPin, ShieldCheck, Sparkles, UserCheck, Users
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTexasConfig } from '../config/texas'
import { api, withLocalFallback } from '../lib/api'
import { useApp } from '../context/AppContext'
import { useBusiness } from '../context/BusinessContext'
import { useOrders } from '../context/OrdersContext'
import { plans } from '../components/PricingCards'
import SEO from '../components/SEO'
import { normalizeBusinessName, validateBusinessName } from '../lib/businessName'
import { validateFullName, validateEmail, validatePhone, validatePreferredContactMethod } from '../validations/contactValidation'
import { validateStreetAddress, validateCity } from '../validations/addressValidation'
import { validateText, isValidCalendarDate, valid, invalid } from '../validations/commonValidation'
import { validateOwnershipPercentage, validateOwnershipTotal, validateEffectiveDate } from '../validations/formationValidation'
import { validatePassword, validatePasswordConfirmation } from '../validations/authValidation'
import { validateSelectedPlan } from '../validations/paymentValidation'
import { fieldAria, focusFirstInvalid } from '../lib/formErrors'

const texas = getTexasConfig()

const steps = [
  'Business name', 'Business basics', 'Contact information', 'Business address',
  'Ownership & management', 'Registered agent', 'Organizer', 'Effective date',
  'EIN assistance', 'Additional services', 'Package', 'Account', 'Review', 'Payment', 'Confirmation'
]

function businessNameFromQuery() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('businessName')
    return fromQuery ? normalizeBusinessName(fromQuery) : ''
  } catch {
    return ''
  }
}

// Only add-ons tied to currently-active services are offered here. Keep
// this list in sync with the active entries in src/data/services.js.
const addOnCatalog = [
  { id: 'registered-agent', name: 'Registered agent (1 year)', price: 125 },
  { id: 'ein-assist', name: 'EIN application assistance', price: 75 },
  { id: 'operating-agreement', name: 'Operating agreement', price: 60 },
  { id: 'texas-dba', name: 'Assumed name (DBA) filing', price: 85 },
  { id: 'compliance', name: 'Compliance reminders', price: 90 },
  { id: 'expedited', name: 'Expedited processing', price: texas.expeditedFee }
]

function priceToNumber(price) {
  return Number(String(price).replace(/[^0-9.]/g, '')) || 0
}

export default function Onboarding(){
  const {user,notify,businessName:draftBusinessName,setBusinessName}=useApp()
  const {addBusiness}=useBusiness()
  const {addToCart,checkout}=useOrders()
  const navigate=useNavigate();const [step,setStep]=useState(0);const [loading,setLoading]=useState(false)
  const [confirmedOrder,setConfirmedOrder]=useState(null)
  const [nameError,setNameError]=useState('')
  const [errors,setErrors]=useState({})
  const [touched,setTouched]=useState({})
  const [formError,setFormError]=useState('')
  const fieldRefs=useRef({})
  const [form,setForm]=useState({
    businessName: draftBusinessName || businessNameFromQuery(), altName:'', nameFinalized:true, industry:'', purpose:'', county:'', city:'', launchDate:'',
    fullName: user?.name||'', email:user?.email||'', phone:'', commPref:'email',
    principalAddress:'', mailingSame:true, mailingAddress:'', addressPrivacy:false,
    registeredAgentType:'abf', registeredAgentName:'', registeredOfficeAddress:'', registeredAgentConsent:false,
    entityType:'LLC', owners:'1', management:'Member-managed', ownerDetails:[{name:'',percentage:100}],
    organizerType:'self', organizerName:'', organizerAddress:'',
    effectiveDateOption:'filing', effectiveDate:'',
    employees:'none', hiring:false, salesTax:false,
    needsEIN:true, expectEmployees:false, needsBanking:true, responsibleParty:'',
    plan:'Accelerated', addOns:[],
    accountEmail:user?.email||'', password:'', confirmPassword:'', termsAccepted:false, marketingConsent:false,
    finalTermsAccepted:false
  })
  useEffect(()=>{ setBusinessName(form.businessName) },[form.businessName])
  const set=(key,value)=>setForm(v=>({...v,[key]:value}))

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
    const n = count==='4+' ? 4 : Number(count)
    const details = Array.from({length:n}, (_,i)=>form.ownerDetails[i] || {name:'',percentage: Math.round(100/n)})
    setForm(v=>({...v,owners:count,ownerDetails:details}))
  }
  const setOwnerField=(i,key,value)=>setForm(v=>({...v,ownerDetails:v.ownerDetails.map((o,idx)=>idx===i?{...o,[key]:value}:o)}))
  const markOwnerTouched = (i) => {
    setTouched(t => ({ ...t, [`ownerName${i}`]: true, [`ownerPct${i}`]: true }))
    setErrors(e => ({ ...e, ...computeOwnerErrors(form) }))
  }
  const toggleAddOn=id=>setForm(v=>({...v,addOns:v.addOns.includes(id)?v.addOns.filter(x=>x!==id):[...v.addOns,id]}))

  const ownerPercentTotal = useMemo(()=>form.ownerDetails.reduce((s,o)=>s+(Number(o.percentage)||0),0), [form.ownerDetails])
  const selectedPlan = useMemo(()=>plans.find(p=>p.name===form.plan)||plans[1], [form.plan])
  const stateFee = texas.filingFee

  const goNext = () => {
    const order = step===4 ? Object.keys(computeOwnerErrors(form)) : (stepFields[step] || [])
    const stepErrors = computeStepErrors(step, form)
    setErrors(prev => {
      const next = { ...prev }
      const keysToClear = step===4
        ? form.ownerDetails.flatMap((_, i) => [`ownerName${i}`, `ownerPct${i}`]).concat('ownerTotal')
        : (stepFields[step] || [])
      keysToClear.forEach(k => { delete next[k] })
      return { ...next, ...stepErrors }
    })
    if (step===4) {
      const allKeys = form.ownerDetails.flatMap((_,i)=>[`ownerName${i}`,`ownerPct${i}`]).concat('ownerTotal')
      setTouched(t => ({ ...t, ...Object.fromEntries(allKeys.map(k=>[k,true])) }))
    } else {
      setTouched(t => ({ ...t, ...Object.fromEntries(order.map(k=>[k,true])) }))
    }
    if (Object.keys(stepErrors).length) {
      setFormError('Please correct the highlighted fields before continuing.')
      focusFirstInvalid(fieldRefs, stepErrors, step===4 ? Object.keys(stepErrors) : order)
      return
    }
    setFormError('')
    if (step === 10) addToCart({ id: `plan-${selectedPlan.name}`, type: 'plan', name: `${selectedPlan.name} plan`, price: priceToNumber(selectedPlan.price) })
    setStep(s=>Math.min(s+1, steps.length-1))
  }
  const goBack = () => step===0 ? navigate('/') : setStep(s=>s-1)

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
    setLoading(true)
    addToCart({ id: `plan-${selectedPlan.name}`, type: 'plan', name: `${selectedPlan.name} plan`, price: priceToNumber(selectedPlan.price) })
    addToCart({ id: 'state-fee-tx', type: 'state-fee', name: 'Texas state filing fee', price: stateFee })
    form.addOns.forEach(id => {
      const item = addOnCatalog.find(a=>a.id===id)
      if (item) addToCart({ id: `addon-${item.id}`, type: 'add-on', name: item.name, price: item.price })
    })
    const business = addBusiness({
      name: form.businessName, entityType: form.entityType, state: 'Texas', industry: form.industry,
      description: form.purpose, owners: form.owners, management: form.management,
      registeredAgentType: form.registeredAgentType, organizerType: form.organizerType,
      effectiveDateOption: form.effectiveDateOption,
      services: [selectedPlan.name, ...form.addOns]
    })
    await withLocalFallback(()=>api.submitOnboarding({ ...form, state: 'Texas', stateFee }),()=>({ok:true}))
    setTimeout(() => {
      const order = checkout(business.id)
      setConfirmedOrder(order)
      notify('Your LLC formation plan has been saved.')
      setLoading(false)
      setStep(14)
    }, 700)
  }

  return <><SEO title="Form Your LLC" description="Complete your LLC formation details. Currently available for Texas LLC formations." path="/formation-details" noindex /><section className="onboarding-page"><div className="onboarding-shell"><aside><div className="onboarding-brand"><img src="/logo.webp" alt="American Business Formations" className="brand-mini-light"/></div><h2>Let&rsquo;s form your LLC.</h2><p>Your answers save automatically as you go.</p><ol>{steps.map((label,i)=><li key={label} className={i===step?'active':i<step?'done':''}><span>{i<step?<Check/>:i+1}</span>{label}</li>)}</ol><small>General information only. This workflow is not legal or tax advice.</small></aside><main><div className="onboarding-progress"><span>Step {step+1} of {steps.length}</span><div><i style={{width:`${((step+1)/steps.length)*100}%`}}></i></div></div>
    {formError && step<14 && <p className="form-error-summary" role="alert">{formError}</p>}

    {step===0&&<div key={step} className="step-panel"><Building2 className="step-icon"/><span>Business name</span><h1>Let&rsquo;s confirm your business name</h1><p>Review the name you entered, or make changes before continuing. This is a preliminary review only the Texas Secretary of State determines final availability.</p><label>Proposed business name<input value={form.businessName} onChange={e=>{const v=e.target.value;set('businessName',v);if(nameError&&validateBusinessName(v).valid)setNameError('');if(touched.businessName){const r=validateBusinessName(v);setErrors(er=>({...er,businessName:r.valid?'':r.message}))}}} onBlur={()=>{const v=validateBusinessName(form.businessName);setNameError(v.valid?'':v.message);markTouched('businessName')}} placeholder="Example: North Ridge Consulting LLC" maxLength={80} ref={el=>fieldRefs.current.businessName=el} {...fieldAria('business-name-error', errors.businessName||nameError)}/></label><div aria-live="polite">{(errors.businessName||nameError)&&<p id="business-name-error" className="field-error">{errors.businessName||nameError}</p>}</div><label>Alternate name (optional)<input value={form.altName} onChange={e=>set('altName',e.target.value)} placeholder="A backup option if your first choice is unavailable"/></label><label className="check-control"><input type="checkbox" checked={form.nameFinalized} onChange={e=>set('nameFinalized',e.target.checked)}/> This name is finalized</label><label>Industry<select value={form.industry} onChange={e=>handleFieldChange('industry',e.target.value)} onBlur={()=>markTouched('industry')} ref={el=>fieldRefs.current.industry=el} {...fieldAria('industry-error', errors.industry)}><option value="">Choose an industry</option><option>Professional Services</option><option>Ecommerce</option><option>Technology</option><option>Construction</option><option>Food & Hospitality</option><option>Health & Wellness</option><option>Creative Services</option><option>Other</option></select>{errors.industry&&<p id="industry-error" className="field-error">{errors.industry}</p>}</label><p className="onboarding-note"><ShieldCheck size={15}/> This is a preliminary name review only. Final availability is determined by the Texas Secretary of State when your Certificate of Formation is filed no name is guaranteed.</p></div>}

    {step===1&&<div key={step} className="step-panel"><MapPin className="step-icon"/><span>Business basics</span><h1>Tell us about your business</h1><div className="state-lock-badge"><Lock size={14}/> State: Texas</div><p className="hero-availability-note" style={{margin:'-8px 0 18px'}}>LLC formation is currently available in Texas only.</p><label>Business purpose<input value={form.purpose} onChange={e=>handleFieldChange('purpose',e.target.value)} onBlur={()=>markTouched('purpose')} placeholder="Example: Provide marketing consulting services" ref={el=>fieldRefs.current.purpose=el} {...fieldAria('purpose-error', errors.purpose)}/>{errors.purpose&&<p id="purpose-error" className="field-error">{errors.purpose}</p>}</label><div className="form-grid"><label>County<input value={form.county} onChange={e=>handleFieldChange('county',e.target.value)} onBlur={()=>markTouched('county')} placeholder="Example: Travis County" ref={el=>fieldRefs.current.county=el} {...fieldAria('county-error', errors.county)}/>{errors.county&&<p id="county-error" className="field-error">{errors.county}</p>}</label><label>City<input value={form.city} onChange={e=>handleFieldChange('city',e.target.value)} onBlur={()=>markTouched('city')} placeholder="Example: Austin" ref={el=>fieldRefs.current.city=el} {...fieldAria('city-error', errors.city)}/>{errors.city&&<p id="city-error" className="field-error">{errors.city}</p>}</label></div><label>Expected launch date<input type="date" value={form.launchDate} onChange={e=>handleFieldChange('launchDate',e.target.value)} onBlur={()=>markTouched('launchDate')} ref={el=>fieldRefs.current.launchDate=el} {...fieldAria('launchDate-error', errors.launchDate)}/>{errors.launchDate&&<p id="launchDate-error" className="field-error">{errors.launchDate}</p>}</label><div className="radio-cards"><button type="button" className={form.entityType==='LLC'?'selected':''} onClick={()=>set('entityType','LLC')}><strong>LLC</strong><span>A flexible structure for most small businesses.</span></button><button type="button" className={form.entityType==='Series LLC'?'selected':''} onClick={()=>set('entityType','Series LLC')}><strong>Series LLC</strong><span>Separate series under one parent LLC for more complex structures.</span></button></div></div>}

    {step===2&&<div key={step} className="step-panel"><Users className="step-icon"/><span>Contact information</span><h1>How should we reach you?</h1><label>Full name<input value={form.fullName} onChange={e=>handleFieldChange('fullName',e.target.value)} onBlur={()=>markTouched('fullName')} placeholder="Jordan Lee" autoComplete="name" ref={el=>fieldRefs.current.fullName=el} {...fieldAria('fullName-error', errors.fullName)}/>{errors.fullName&&<p id="fullName-error" className="field-error">{errors.fullName}</p>}</label><label>Email<input type="email" value={form.email} onChange={e=>handleFieldChange('email',e.target.value)} onBlur={()=>markTouched('email')} placeholder="you@example.com" autoComplete="email" ref={el=>fieldRefs.current.email=el} {...fieldAria('contact-email-error', errors.email)}/>{errors.email&&<p id="contact-email-error" className="field-error">{errors.email}</p>}</label><label>Phone<input type="tel" inputMode="tel" value={form.phone} onChange={e=>handleFieldChange('phone',e.target.value)} onBlur={()=>markTouched('phone')} placeholder="(555) 555-5555" autoComplete="tel" ref={el=>fieldRefs.current.phone=el} {...fieldAria('phone-error', errors.phone)}/>{errors.phone&&<p id="phone-error" className="field-error">{errors.phone}</p>}</label><label>Preferred contact method<select value={form.commPref} onChange={e=>handleFieldChange('commPref',e.target.value)} onBlur={()=>markTouched('commPref')} ref={el=>fieldRefs.current.commPref=el} {...fieldAria('commPref-error', errors.commPref)}><option value="email">Email</option><option value="phone">Phone</option><option value="sms">Text message</option></select>{errors.commPref&&<p id="commPref-error" className="field-error">{errors.commPref}</p>}</label></div>}

    {step===3&&<div key={step} className="step-panel"><MapPin className="step-icon"/><span>Business address</span><h1>Where is the business located?</h1><label>Principal office address<input value={form.principalAddress} onChange={e=>handleFieldChange('principalAddress',e.target.value)} onBlur={()=>markTouched('principalAddress')} placeholder="Street, city, TX, ZIP" autoComplete="street-address" ref={el=>fieldRefs.current.principalAddress=el} {...fieldAria('principalAddress-error', errors.principalAddress)}/>{errors.principalAddress&&<p id="principalAddress-error" className="field-error">{errors.principalAddress}</p>}</label><label className="check-control"><input type="checkbox" checked={form.mailingSame} onChange={e=>{set('mailingSame',e.target.checked); if(e.target.checked) setErrors(er=>({...er,mailingAddress:''}))}}/> Mailing address is the same as the principal address</label>{!form.mailingSame&&<label>Mailing address<input value={form.mailingAddress} onChange={e=>handleFieldChange('mailingAddress',e.target.value)} onBlur={()=>markTouched('mailingAddress')} ref={el=>fieldRefs.current.mailingAddress=el} {...fieldAria('mailingAddress-error', errors.mailingAddress)}/>{errors.mailingAddress&&<p id="mailingAddress-error" className="field-error">{errors.mailingAddress}</p>}</label>}<label className="check-control"><input type="checkbox" checked={form.addressPrivacy} onChange={e=>set('addressPrivacy',e.target.checked)}/> I&rsquo;d like to explore a virtual business address instead of my home address</label></div>}

    {step===4&&<div key={step} className="step-panel"><Users className="step-icon"/><span>Ownership & management</span><h1>How will the business be owned?</h1><label>Number of owners or members<select value={form.owners} onChange={e=>setOwnerCount(e.target.value)}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4+">4+</option></select></label><div className="radio-cards"><button type="button" className={form.management==='Member-managed'?'selected':''} onClick={()=>set('management','Member-managed')}><strong>Member-managed</strong><span>Owners participate in day-to-day decisions.</span></button><button type="button" className={form.management==='Manager-managed'?'selected':''} onClick={()=>set('management','Manager-managed')}><strong>Manager-managed</strong><span>Selected managers handle operations.</span></button></div>{form.owners!=='4+'&&<div className="owner-rows"><div className="owner-rows-head"><span>Owner</span><span>Ownership %</span></div>{form.ownerDetails.map((o,i)=><div key={i}><div className="owner-row"><input value={o.name} onChange={e=>{setOwnerField(i,'name',e.target.value); if(touched[`ownerName${i}`]) markOwnerTouched(i)}} onBlur={()=>markOwnerTouched(i)} placeholder={`Owner ${i+1} name`} ref={el=>fieldRefs.current[`ownerName${i}`]=el} {...fieldAria(`ownerName${i}-error`, errors[`ownerName${i}`])}/><input type="number" min="0" max="100" value={o.percentage} onChange={e=>{setOwnerField(i,'percentage',e.target.value); if(touched[`ownerPct${i}`]) markOwnerTouched(i)}} onBlur={()=>markOwnerTouched(i)} ref={el=>fieldRefs.current[`ownerPct${i}`]=el} {...fieldAria(`ownerPct${i}-error`, errors[`ownerPct${i}`])}/></div>{errors[`ownerName${i}`]&&<p id={`ownerName${i}-error`} className="field-error">{errors[`ownerName${i}`]}</p>}{errors[`ownerPct${i}`]&&<p id={`ownerPct${i}-error`} className="field-error">{errors[`ownerPct${i}`]}</p>}</div>)}<div className={`owner-total ${ownerPercentTotal===100?'ok':'error'}`}>Total: {ownerPercentTotal}% {ownerPercentTotal!==100&&'(must equal 100%)'}</div>{errors.ownerTotal&&<p className="field-error">{errors.ownerTotal}</p>}</div>}{form.owners==='4+'&&<p className="onboarding-note"><Users size={15}/> Ownership percentages for 4 or more owners will be collected during document preparation.</p>}</div>}

    {step===5&&<div key={step} className="step-panel"><ShieldCheck className="step-icon"/><span>Registered agent</span><h1>Who will serve as your registered agent?</h1><p>Texas law requires a registered agent with a physical Texas street address a P.O. box alone is not enough.</p><div className="radio-cards"><button type="button" className={form.registeredAgentType==='abf'?'selected':''} onClick={()=>set('registeredAgentType','abf')}><strong>American Business Formations</strong><span>Use our registered agent service.</span></button><button type="button" className={form.registeredAgentType==='self'?'selected':''} onClick={()=>set('registeredAgentType','self')}><strong>Appoint myself</strong><span>I have an eligible Texas street address.</span></button><button type="button" className={form.registeredAgentType==='other'?'selected':''} onClick={()=>set('registeredAgentType','other')}><strong>Appoint someone else</strong><span>An individual or eligible business entity.</span></button></div>{form.registeredAgentType!=='abf'&&<><label>Registered agent name<input value={form.registeredAgentName} onChange={e=>handleFieldChange('registeredAgentName',e.target.value)} onBlur={()=>markTouched('registeredAgentName')} placeholder="Full name or entity name" ref={el=>fieldRefs.current.registeredAgentName=el} {...fieldAria('registeredAgentName-error', errors.registeredAgentName)}/>{errors.registeredAgentName&&<p id="registeredAgentName-error" className="field-error">{errors.registeredAgentName}</p>}</label><label>Registered office address (Texas street address, not a P.O. box)<input value={form.registeredOfficeAddress} onChange={e=>handleFieldChange('registeredOfficeAddress',e.target.value)} onBlur={()=>markTouched('registeredOfficeAddress')} placeholder="Street address, city, TX, ZIP" ref={el=>fieldRefs.current.registeredOfficeAddress=el} {...fieldAria('registeredOfficeAddress-error', errors.registeredOfficeAddress)}/>{errors.registeredOfficeAddress&&<p id="registeredOfficeAddress-error" className="field-error">{errors.registeredOfficeAddress}</p>}</label></>}<label className="check-control terms-check"><input type="checkbox" checked={form.registeredAgentConsent} onChange={e=>handleFieldChange('registeredAgentConsent',e.target.checked)} ref={el=>fieldRefs.current.registeredAgentConsent=el} {...fieldAria('registeredAgentConsent-error', errors.registeredAgentConsent)}/> {form.registeredAgentType==='abf' ? 'I authorize American Business Formations to serve as my registered agent.' : 'I confirm this registered agent has consented to serve, and I will keep a signed record of that consent.'}</label>{errors.registeredAgentConsent&&<p id="registeredAgentConsent-error" className="field-error">{errors.registeredAgentConsent}</p>}</div>}

    {step===6&&<div key={step} className="step-panel"><UserCheck className="step-icon"/><span>Organizer</span><h1>Who is organizing this LLC?</h1><p>The organizer signs the Certificate of Formation to create the LLC this can be an owner, an attorney, or anyone you authorize.</p><div className="radio-cards"><button type="button" className={form.organizerType==='self'?'selected':''} onClick={()=>set('organizerType','self')}><strong>I am the organizer</strong><span>Use your contact information from this application.</span></button><button type="button" className={form.organizerType==='other'?'selected':''} onClick={()=>set('organizerType','other')}><strong>Someone else is the organizer</strong><span>Provide their name and address.</span></button></div>{form.organizerType==='other'&&<><label>Organizer name<input value={form.organizerName} onChange={e=>handleFieldChange('organizerName',e.target.value)} onBlur={()=>markTouched('organizerName')} placeholder="Full name" ref={el=>fieldRefs.current.organizerName=el} {...fieldAria('organizerName-error', errors.organizerName)}/>{errors.organizerName&&<p id="organizerName-error" className="field-error">{errors.organizerName}</p>}</label><label>Organizer address<input value={form.organizerAddress} onChange={e=>handleFieldChange('organizerAddress',e.target.value)} onBlur={()=>markTouched('organizerAddress')} placeholder="Street, city, state, ZIP" ref={el=>fieldRefs.current.organizerAddress=el} {...fieldAria('organizerAddress-error', errors.organizerAddress)}/>{errors.organizerAddress&&<p id="organizerAddress-error" className="field-error">{errors.organizerAddress}</p>}</label></>}</div>}

    {step===7&&<div key={step} className="step-panel"><Calendar className="step-icon"/><span>Effective date</span><h1>When should your LLC take effect?</h1><div className="radio-cards"><button type="button" className={form.effectiveDateOption==='filing'?'selected':''} onClick={()=>{set('effectiveDateOption','filing'); setErrors(er=>({...er,effectiveDate:''}))}}><strong>Effective upon filing</strong><span>Your LLC exists as soon as the state approves it.</span></button><button type="button" className={form.effectiveDateOption==='delayed'?'selected':''} onClick={()=>set('effectiveDateOption','delayed')}><strong>Delayed effective date</strong><span>Choose a future date, up to 90 days out.</span></button></div>{form.effectiveDateOption==='delayed'&&<label>Requested effective date<input type="date" value={form.effectiveDate} min={new Date().toISOString().slice(0,10)} max={new Date(Date.now()+90*86400000).toISOString().slice(0,10)} onChange={e=>handleFieldChange('effectiveDate',e.target.value)} onBlur={()=>markTouched('effectiveDate')} ref={el=>fieldRefs.current.effectiveDate=el} {...fieldAria('effectiveDate-error', errors.effectiveDate)}/>{errors.effectiveDate&&<p id="effectiveDate-error" className="field-error">{errors.effectiveDate}</p>}</label>}<p className="onboarding-note"><ShieldCheck size={15}/> Texas allows a delayed effective date up to 90 days after filing. Most businesses choose to be effective immediately upon filing.</p></div>}

    {step===8&&<div key={step} className="step-panel"><IdCard className="step-icon"/><span>EIN assistance</span><h1>Do you need a federal tax ID (EIN)?</h1><label className="check-control"><input type="checkbox" checked={form.needsEIN} onChange={e=>set('needsEIN',e.target.checked)}/> I need an EIN for this business</label><label className="check-control"><input type="checkbox" checked={form.expectEmployees} onChange={e=>set('expectEmployees',e.target.checked)}/> I expect to have employees</label><label className="check-control"><input type="checkbox" checked={form.needsBanking} onChange={e=>set('needsBanking',e.target.checked)}/> I need this for opening a business bank account</label><label>Responsible party full name<input value={form.responsibleParty} onChange={e=>handleFieldChange('responsibleParty',e.target.value)} onBlur={()=>markTouched('responsibleParty')} placeholder="The individual responsible for the business" ref={el=>fieldRefs.current.responsibleParty=el} {...fieldAria('responsibleParty-error', errors.responsibleParty)}/>{errors.responsibleParty&&<p id="responsibleParty-error" className="field-error">{errors.responsibleParty}</p>}</label><p className="onboarding-note"><ShieldCheck size={15}/> The IRS issues EINs directly at no cost. We never collect Social Security Numbers or ITINs through this form that information, if needed, is gathered through a separate secure process.</p></div>}

    {step===9&&<div key={step} className="step-panel"><span>Additional services</span><h1>Would you like to add any of these?</h1><p>Nothing is preselected. Add only what your business needs.</p><div className="addon-grid">{addOnCatalog.map(a=><button type="button" key={a.id} className={form.addOns.includes(a.id)?'selected':''} onClick={()=>toggleAddOn(a.id)}><span>{form.addOns.includes(a.id)?<Check/>:'+'}</span><strong>{a.name}</strong><em>${a.price}</em></button>)}</div></div>}

    {step===10&&<div key={step} className="step-panel review-panel"><CreditCard className="step-icon"/><span>Package</span><h1>Choose the plan that fits your business</h1><div className="pricing-grid onboarding-pricing">{plans.map(p=><button type="button" key={p.name} className={`price-card price-${p.theme} ${form.plan===p.name?'selected-plan':''}`} onClick={()=>set('plan',p.name)}><div className="price-card-head">{p.popular&&<span className="popular-label">Most popular</span>}<h3>{p.name}</h3><div className="price"><strong>{p.price}</strong><span>{p.note}</span></div></div><div className="price-card-body"><p>{p.description}</p>{form.plan===p.name&&<span className="plan-selected-badge"><Check size={16}/> Selected</span>}</div></button>)}</div></div>}

    {step===11&&<div key={step} className="step-panel review-panel"><Sparkles className="step-icon"/><span>Account</span><h1>{user?'You’re signed in':'Create your account'}</h1>{user?<p>Continuing as {user.email}. Your formation will be saved to your dashboard.</p>:<><p>Create an account to save your progress, track filing status, and access your documents.</p><label>Email<input type="email" value={form.accountEmail} onChange={e=>handleFieldChange('accountEmail',e.target.value)} onBlur={()=>markTouched('accountEmail')} placeholder="you@example.com" autoComplete="email" ref={el=>fieldRefs.current.accountEmail=el} {...fieldAria('accountEmail-error', errors.accountEmail)}/>{errors.accountEmail&&<p id="accountEmail-error" className="field-error">{errors.accountEmail}</p>}</label><label>Password<input type="password" value={form.password} onChange={e=>handleFieldChange('password',e.target.value)} onBlur={()=>markTouched('password')} placeholder="At least 8 characters" autoComplete="new-password" ref={el=>fieldRefs.current.password=el} {...fieldAria('onboarding-password-error', errors.password)}/>{errors.password?<p id="onboarding-password-error" className="field-error">{errors.password}</p>:<small>Use at least 8 characters, including uppercase, lowercase, a number, and a special character.</small>}</label><label>Confirm password<input type="password" value={form.confirmPassword} onChange={e=>handleFieldChange('confirmPassword',e.target.value)} onBlur={()=>markTouched('confirmPassword')} placeholder="Re-enter your password" autoComplete="new-password" ref={el=>fieldRefs.current.confirmPassword=el} {...fieldAria('confirmPassword-error', errors.confirmPassword)}/>{errors.confirmPassword&&<p id="confirmPassword-error" className="field-error">{errors.confirmPassword}</p>}</label><label className="check-control terms-check"><input type="checkbox" checked={form.termsAccepted} onChange={e=>handleFieldChange('termsAccepted',e.target.checked)} ref={el=>fieldRefs.current.termsAccepted=el} {...fieldAria('termsAccepted-error', errors.termsAccepted)}/> I agree to the Terms of Service and Privacy Policy</label>{errors.termsAccepted&&<p id="termsAccepted-error" className="field-error">{errors.termsAccepted}</p>}<label className="check-control"><input type="checkbox" checked={form.marketingConsent} onChange={e=>set('marketingConsent',e.target.checked)}/> Send me occasional product and compliance tips (optional)</label></>}</div>}

    {step===12&&<div key={step} className="step-panel review-panel"><FileText className="step-icon"/><span>Review your plan</span><h1>Confirm your LLC details</h1><div className="review-card"><div><small>Business name</small><strong>{form.businessName}</strong></div><div><small>Entity</small><strong>{form.entityType} in Texas</strong></div><div><small>Ownership</small><strong>{form.owners} owner(s), {form.management}</strong></div><div><small>Registered agent</small><strong>{form.registeredAgentType==='abf'?'American Business Formations':form.registeredAgentName||'Self / other'}</strong></div><div><small>Organizer</small><strong>{form.organizerType==='self'?'Self':form.organizerName}</strong></div><div><small>Effective date</small><strong>{form.effectiveDateOption==='filing'?'Upon filing':form.effectiveDate||'Delayed'}</strong></div><div><small>Plan</small><strong>{selectedPlan.name} {selectedPlan.price} {selectedPlan.note}</strong></div><div className="full"><small>Selected add-ons</small><div className="tag-row">{form.addOns.length?form.addOns.map(id=><span key={id}>{addOnCatalog.find(a=>a.id===id)?.name}</span>):<span>None selected</span>}</div></div></div><div className="order-breakdown"><div><span>Service plan ({selectedPlan.name})</span><strong>${priceToNumber(selectedPlan.price)}</strong></div><div><span>Texas state filing fee</span><strong>${stateFee}</strong></div>{form.addOns.map(id=>{const a=addOnCatalog.find(x=>x.id===id);return a?<div key={id}><span>{a.name}</span><strong>${a.price}</strong></div>:null})}<div className="order-total"><span>Estimated total due today</span><strong>${priceToNumber(selectedPlan.price)+stateFee+form.addOns.reduce((s,id)=>s+(addOnCatalog.find(a=>a.id===id)?.price||0),0)}</strong></div></div>{!texas.filingFeeVerified&&<p className="onboarding-note"><ShieldCheck size={15}/> The filing fee shown is an owner-configured estimate pending confirmation against the Texas Secretary of State. It will be verified before your order is finalized.</p>}<label className="check-control terms-check"><input type="checkbox" checked={form.finalTermsAccepted} onChange={e=>handleFieldChange('finalTermsAccepted',e.target.checked)} ref={el=>fieldRefs.current.finalTermsAccepted=el} {...fieldAria('finalTermsAccepted-error', errors.finalTermsAccepted)}/> I agree to the Terms of Service, recurring billing terms, and refund policy.</label>{errors.finalTermsAccepted&&<p id="finalTermsAccepted-error" className="field-error">{errors.finalTermsAccepted}</p>}</div>}

    {step===13&&<div key={step} className="step-panel review-panel"><CreditCard className="step-icon"/><span>Payment</span><h1>Secure checkout</h1><p>This is a demo checkout. No real payment provider is connected and no card data is stored or transmitted.</p><div className="mock-payment-form"><label>Name on card<input placeholder="Jordan Lee" disabled={loading}/></label><label>Card number<input placeholder="4242 4242 4242 4242" disabled={loading}/></label><div className="form-grid"><label>Expiration<input placeholder="MM/YY" disabled={loading}/></label><label>CVC<input placeholder="123" disabled={loading}/></label></div><p className="onboarding-note"><ShieldCheck size={15}/> A production build uses hosted Stripe fields here so card data never touches this app&rsquo;s servers, and your order is only marked paid after Stripe confirms the charge server-side.</p></div></div>}

    {step===14&&confirmedOrder&&<div key={step} className="step-panel review-panel confirmation-panel"><div className="confirmation-check"><CheckCircle2/></div><h1>You&rsquo;re all set.</h1><p>Order <strong>{confirmedOrder.id}</strong> has been recorded. Your LLC formation now appears in your dashboard for tracking it has not yet been filed with or approved by the state.</p><div className="review-card"><div><small>Order total</small><strong>${confirmedOrder.total}</strong></div><div><small>Status</small><strong>Paid information under review</strong></div></div><div className="onboarding-actions confirmation-actions"><button className="btn btn-primary" onClick={()=>navigate(user?'/dashboard':'/signup')}>Go to my dashboard <ArrowRight/></button></div></div>}

    {step<14&&<div className="onboarding-actions">{step>0?<button className="btn btn-ghost" onClick={goBack}><ArrowLeft/> Back</button>:<span/>}{step<13?<button className="btn btn-primary" onClick={goNext}>Continue <ArrowRight/></button>:<button className="btn btn-primary" disabled={loading} onClick={submitPayment}>{loading&&<Loader2 className="spin" size={18}/>}{loading?'Processing...':'Complete purchase'} <ArrowRight/></button>}</div>}
  </main></div></section></>
}
