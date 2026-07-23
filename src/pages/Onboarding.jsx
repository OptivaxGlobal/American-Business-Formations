import {
  ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, CreditCard, FileText,
  IdCard, Loader2, MapPin, Rocket, ShieldCheck, Sparkles, Store, Users
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { states, stateFeeSamples } from '../data/states'
import { api, withLocalFallback } from '../lib/api'
import { useApp } from '../context/AppContext'
import { useBusiness } from '../context/BusinessContext'
import { useOrders } from '../context/OrdersContext'
import { plans } from '../components/PricingCards'
import SEO from '../components/SEO'

const steps = [
  'Formation intent', 'Formation state', 'Business name', 'Residency', 'Business address',
  'Registered agent', 'Owners', 'Business details', 'EIN needs', 'Recommendation',
  'Package', 'Add-ons', 'Review', 'Payment', 'Confirmation'
]

const addOnCatalog = [
  { id: 'registered-agent', name: 'Registered agent (1 year)', price: 125 },
  { id: 'ein-assist', name: 'EIN application assistance', price: 75 },
  { id: 'operating-agreement', name: 'Operating agreement', price: 60 },
  { id: 'expedited', name: 'Expedited processing', price: 100 },
  { id: 'compliance', name: 'Annual compliance monitoring', price: 90 },
  { id: 'licenses', name: 'Licenses & permits research', price: 85 },
  { id: 'virtual-address', name: 'Virtual business address', price: 150 },
  { id: 'trademark', name: 'Trademark intake assistance', price: 199 },
  { id: 'branding', name: 'Branding starter package', price: 149 },
  { id: 'website', name: 'Website project intake', price: 99 }
]

function priceToNumber(price) {
  return Number(String(price).replace(/[^0-9.]/g, '')) || 0
}

export default function Onboarding(){
  const {selectedState,setSelectedState,user,notify}=useApp()
  const {addBusiness}=useBusiness()
  const {addToCart,cartTotals,checkout,clearCart}=useOrders()
  const navigate=useNavigate();const [step,setStep]=useState(0);const [loading,setLoading]=useState(false)
  const [confirmedOrder,setConfirmedOrder]=useState(null)
  const [form,setForm]=useState({
    intent:'llc', state:selectedState||'', operatingState:'', multiState:false, foreignQualification:false,
    businessName:'', altName:'', nameFinalized:true, dba:'', industry:'', description:'',
    residency:'us', country:'United States', mailingAddress:'', phone:'', commPref:'email',
    principalAddress:'', mailingSame:true, physicalAddress:'', addressPrivacy:false, virtualAddressInterest:false,
    registeredAgent:'abf',
    entityType:'LLC', owners:'1', management:'Member-managed', ownerDetails:[{name:'',percentage:100}],
    purpose:'', launchDate:'', employees:'none', hiring:false, salesTax:false, onlineOrPhysical:'online',
    regulated:false, bankingNeeds:true, trademarkNeeds:false, websiteNeeds:false,
    needsEIN:true, expectEmployees:false, needsBanking:true, responsibleParty:'', ssnItin:'has-ssn',
    plan:'Essential', addOns:[],
    email:user?.email||''
  })
  const set=(key,value)=>setForm(v=>({...v,[key]:value}))
  const setOwnerCount=(count)=>{
    const n = count==='4+' ? 4 : Number(count)
    const details = Array.from({length:n}, (_,i)=>form.ownerDetails[i] || {name:'',percentage: Math.round(100/n)})
    setForm(v=>({...v,owners:count,ownerDetails:details}))
  }
  const setOwnerField=(i,key,value)=>setForm(v=>({...v,ownerDetails:v.ownerDetails.map((o,idx)=>idx===i?{...o,[key]:value}:o)}))
  const toggleAddOn=id=>setForm(v=>({...v,addOns:v.addOns.includes(id)?v.addOns.filter(x=>x!==id):[...v.addOns,id]}))

  const ownerPercentTotal = useMemo(()=>form.ownerDetails.reduce((s,o)=>s+(Number(o.percentage)||0),0), [form.ownerDetails])
  const selectedPlan = useMemo(()=>plans.find(p=>p.name===form.plan)||plans[1], [form.plan])
  const stateFee = stateFeeSamples[form.state] || 0

  const canNext = useMemo(()=>{
    switch(step){
      case 0: return !!form.intent
      case 1: return !!form.state
      case 2: return !!form.businessName && !!form.industry
      case 3: return !!form.residency
      case 4: return !!form.principalAddress
      case 5: return !!form.registeredAgent
      case 6: return form.owners==='4+' || ownerPercentTotal===100
      case 7: return !!form.purpose
      case 8: return true
      case 9: return true
      case 10: return !!form.plan
      case 11: return true
      case 12: return true
      case 13: return true
      default: return true
    }
  }, [step, form, ownerPercentTotal])

  const goNext = () => {
    if (step === 9) {
      // entering payment prep: sync cart with current selections
      addToCart({ id: `plan-${selectedPlan.name}`, type: 'plan', name: `${selectedPlan.name} plan`, price: priceToNumber(selectedPlan.price) })
    }
    setStep(s=>Math.min(s+1, steps.length-1))
  }
  const goBack = () => step===0 ? navigate('/') : setStep(s=>s-1)

  const submitPayment = async () => {
    setLoading(true)
    addToCart({ id: `plan-${selectedPlan.name}`, type: 'plan', name: `${selectedPlan.name} plan`, price: priceToNumber(selectedPlan.price) })
    if (stateFee) addToCart({ id: `state-fee-${form.state}`, type: 'state-fee', name: `${form.state} state filing fee`, price: stateFee })
    form.addOns.forEach(id => {
      const item = addOnCatalog.find(a=>a.id===id)
      if (item) addToCart({ id: `addon-${item.id}`, type: 'add-on', name: item.name, price: item.price })
    })
    const business = addBusiness({
      name: form.businessName, entityType: form.entityType, state: form.state, industry: form.industry,
      description: form.description, owners: form.owners, management: form.management,
      services: [selectedPlan.name, ...form.addOns]
    })
    localStorage.setItem('abf-onboarding', JSON.stringify(form))
    await withLocalFallback(()=>api.submitOnboarding(form),()=>({ok:true}))
    setSelectedState(form.state)
    // small delay so the loading state is visible, then a mock order confirmation
    setTimeout(() => {
      const order = checkout(business.id)
      setConfirmedOrder(order)
      notify('Your business plan has been saved.')
      setLoading(false)
      setStep(14)
    }, 700)
  }

  return <><SEO title="Business Formation Details" description="Complete your business formation plan." path="/formation-details" noindex /><section className="onboarding-page"><div className="onboarding-shell"><aside><div className="onboarding-brand"><img src="/logo.webp" alt="American Business Formations" className="brand-mini-light"/></div><h2>Let&rsquo;s build your formation plan.</h2><p>Your answers save automatically in this demo after completion.</p><ol>{steps.map((label,i)=><li key={label} className={i===step?'active':i<step?'done':''}><span>{i<step?<Check/>:i+1}</span>{label}</li>)}</ol><small>General information only. This workflow is not legal or tax advice.</small></aside><main><div className="onboarding-progress"><span>Step {step+1} of {steps.length}</span><div><i style={{width:`${((step+1)/steps.length)*100}%`}}></i></div></div>

    {step===0&&<div key={step} className="step-panel"><Rocket className="step-icon"/><span>Formation intent</span><h1>What would you like to create?</h1><p>Choose the option that best matches where you are today. This is educational guidance, not legal advice.</p><div className="state-choice-grid">{[['llc','LLC','A flexible structure for most small businesses.'],['corporation','Corporation','Better suited for outside investment or issuing stock.'],['unsure','Unsure — help me decide','We will ask a few more questions to guide you.'],['existing','Existing business','I already have a business and need additional services.']].map(([id,label,desc])=><button key={id} className={form.intent===id?'selected':''} onClick={()=>set('intent',id)}><strong>{label}</strong><small>{desc}</small></button>)}</div></div>}

    {step===1&&<div key={step} className="step-panel"><MapPin className="step-icon"/><span>Formation state</span><h1>Where will you form the business?</h1><p>Most founders form in the state where they primarily operate.</p><div className="state-choice-grid">{['Wyoming','Delaware','Texas','Florida'].map(x=><button className={form.state===x?'selected':''} onClick={()=>set('state',x)} key={x}><strong>{x}</strong><small>Sample state fee: ${stateFeeSamples[x]||'varies'}</small></button>)}</div><label>Or choose another state<select value={form.state} onChange={e=>set('state',e.target.value)}><option value="">Select a state</option>{states.map(x=><option key={x}>{x}</option>)}</select></label><label>Entity type<select value={form.entityType} onChange={e=>set('entityType',e.target.value)}><option>LLC</option><option>C Corporation</option><option>S Corporation</option><option>Nonprofit Corporation</option></select></label><label className="check-control"><input type="checkbox" checked={form.multiState} onChange={e=>set('multiState',e.target.checked)}/> I operate in more than one state</label>{form.multiState&&<label>Additional operating state<select value={form.operatingState} onChange={e=>set('operatingState',e.target.value)}><option value="">Select a state</option>{states.map(x=><option key={x}>{x}</option>)}</select></label>}{form.multiState&&<label className="check-control"><input type="checkbox" checked={form.foreignQualification} onChange={e=>set('foreignQualification',e.target.checked)}/> I may need foreign qualification in that state</label>}</div>}

    {step===2&&<div key={step} className="step-panel"><Building2 className="step-icon"/><span>Business name</span><h1>Tell us about your new business</h1><p>Start with the name and a simple description. You can update these details later.</p><label>Preferred business name<input value={form.businessName} onChange={e=>set('businessName',e.target.value)} placeholder="Example: North Ridge Consulting"/></label><label>Alternate name (optional)<input value={form.altName} onChange={e=>set('altName',e.target.value)} placeholder="A backup option if your first choice is unavailable"/></label><label className="check-control"><input type="checkbox" checked={form.nameFinalized} onChange={e=>set('nameFinalized',e.target.checked)}/> This name is finalized</label><label>DBA / fictitious name (optional)<input value={form.dba} onChange={e=>set('dba',e.target.value)} placeholder="A trade name, if different from your legal name"/></label><label>Industry<select value={form.industry} onChange={e=>set('industry',e.target.value)}><option value="">Choose an industry</option><option>Professional Services</option><option>Ecommerce</option><option>Technology</option><option>Construction</option><option>Food & Hospitality</option><option>Health & Wellness</option><option>Creative Services</option><option>Other</option></select></label><label>What will the business do?<textarea value={form.description} onChange={e=>set('description',e.target.value)} rows="4" placeholder="Briefly describe the products or services..."></textarea></label><p className="onboarding-note"><ShieldCheck size={15}/> A name pre-check can be added here once a reliable state name-database source is connected. No name is guaranteed available or approved.</p></div>}

    {step===3&&<div key={step} className="step-panel"><Users className="step-icon"/><span>Residency</span><h1>Tell us about your residency status</h1><p>This helps us guide you to the right EIN and banking path.</p><div className="state-choice-grid">{[['us','U.S. resident','I live in the United States.'],['non-us','Non-U.S. resident','I live outside the United States.']].map(([id,label,desc])=><button key={id} className={form.residency===id?'selected':''} onClick={()=>set('residency',id)}><strong>{label}</strong><small>{desc}</small></button>)}</div><label>Country<input value={form.country} onChange={e=>set('country',e.target.value)}/></label><label>Mailing address<input value={form.mailingAddress} onChange={e=>set('mailingAddress',e.target.value)} placeholder="Street, city, region, postal code"/></label><label>Phone (with country code)<input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+1 555 555 5555"/></label><label>Preferred communication method<select value={form.commPref} onChange={e=>set('commPref',e.target.value)}><option value="email">Email</option><option value="phone">Phone</option><option value="sms">Text message</option></select></label></div>}

    {step===4&&<div key={step} className="step-panel"><MapPin className="step-icon"/><span>Business address</span><h1>Where is the business located?</h1><label>Principal office address<input value={form.principalAddress} onChange={e=>set('principalAddress',e.target.value)} placeholder="Street, city, state, ZIP"/></label><label className="check-control"><input type="checkbox" checked={form.mailingSame} onChange={e=>set('mailingSame',e.target.checked)}/> Mailing address is the same as the principal address</label>{!form.mailingSame&&<label>Mailing address<input value={form.mailingAddress} onChange={e=>set('mailingAddress',e.target.value)}/></label>}<label>Physical operating address (optional)<input value={form.physicalAddress} onChange={e=>set('physicalAddress',e.target.value)} placeholder="If different from your mailing address"/></label><label className="check-control"><input type="checkbox" checked={form.addressPrivacy} onChange={e=>set('addressPrivacy',e.target.checked)}/> I would like to keep my personal address private where possible</label><label className="check-control"><input type="checkbox" checked={form.virtualAddressInterest} onChange={e=>set('virtualAddressInterest',e.target.checked)}/> I am interested in a virtual business address service</label></div>}

    {step===5&&<div key={step} className="step-panel"><ShieldCheck className="step-icon"/><span>Registered agent</span><h1>Who will serve as your registered agent?</h1><p>Most states require a designated recipient for official notices.</p><div className="radio-cards">{[['self','Provide my own','I already have a registered agent.'],['abf','American Business Formations','Use our registered-agent service.'],['partner','Partner service','Use a partner registered-agent provider.']].map(([id,label,desc])=><button key={id} className={form.registeredAgent===id?'selected':''} onClick={()=>set('registeredAgent',id)}><strong>{label}</strong><span>{desc}</span></button>)}</div></div>}

    {step===6&&<div key={step} className="step-panel"><Users className="step-icon"/><span>Owners</span><h1>How will the business be owned?</h1><label>Number of owners or members<select value={form.owners} onChange={e=>setOwnerCount(e.target.value)}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4+">4+</option></select></label><div className="radio-cards"><button className={form.management==='Member-managed'?'selected':''} onClick={()=>set('management','Member-managed')}><strong>Member-managed</strong><span>Owners participate in day-to-day decisions.</span></button><button className={form.management==='Manager-managed'?'selected':''} onClick={()=>set('management','Manager-managed')}><strong>Manager-managed</strong><span>Selected managers handle operations.</span></button></div>{form.owners!=='4+'&&<div className="owner-rows"><div className="owner-rows-head"><span>Owner</span><span>Ownership %</span></div>{form.ownerDetails.map((o,i)=><div className="owner-row" key={i}><input value={o.name} onChange={e=>setOwnerField(i,'name',e.target.value)} placeholder={`Owner ${i+1} name`}/><input type="number" min="0" max="100" value={o.percentage} onChange={e=>setOwnerField(i,'percentage',e.target.value)}/></div>)}<div className={`owner-total ${ownerPercentTotal===100?'ok':'error'}`}>Total: {ownerPercentTotal}% {ownerPercentTotal!==100&&'(must equal 100%)'}</div></div>}{form.owners==='4+'&&<p className="onboarding-note"><Users size={15}/> Ownership percentages for 4 or more owners will be collected during document preparation.</p>}<label>Primary contact email<input value={form.email} type="email" onChange={e=>set('email',e.target.value)} placeholder="owner@example.com"/></label></div>}

    {step===7&&<div key={step} className="step-panel"><Store className="step-icon"/><span>Business details</span><h1>A few more details about your business</h1><label>Business purpose<input value={form.purpose} onChange={e=>set('purpose',e.target.value)} placeholder="Example: Provide marketing consulting services"/></label><label>Expected launch date<input type="date" value={form.launchDate} onChange={e=>set('launchDate',e.target.value)}/></label><label>Expected employees<select value={form.employees} onChange={e=>set('employees',e.target.value)}><option value="none">None right now</option><option value="1-4">1-4</option><option value="5-19">5-19</option><option value="20+">20+</option></select></label><label className="check-control"><input type="checkbox" checked={form.hiring} onChange={e=>set('hiring',e.target.checked)}/> I plan to hire employees within 12 months</label><label className="check-control"><input type="checkbox" checked={form.salesTax} onChange={e=>set('salesTax',e.target.checked)}/> I will collect sales tax</label><div className="radio-cards"><button className={form.onlineOrPhysical==='online'?'selected':''} onClick={()=>set('onlineOrPhysical','online')}><strong>Online</strong><span>Primarily an online business.</span></button><button className={form.onlineOrPhysical==='physical'?'selected':''} onClick={()=>set('onlineOrPhysical','physical')}><strong>Physical location</strong><span>Operates from a physical location.</span></button></div><label className="check-control"><input type="checkbox" checked={form.regulated} onChange={e=>set('regulated',e.target.checked)}/> My business involves a regulated activity (e.g. food, alcohol, healthcare, finance)</label><label className="check-control"><input type="checkbox" checked={form.bankingNeeds} onChange={e=>set('bankingNeeds',e.target.checked)}/> I will need a business bank account</label><label className="check-control"><input type="checkbox" checked={form.trademarkNeeds} onChange={e=>set('trademarkNeeds',e.target.checked)}/> I am interested in trademark protection</label><label className="check-control"><input type="checkbox" checked={form.websiteNeeds} onChange={e=>set('websiteNeeds',e.target.checked)}/> I need a website and branding</label></div>}

    {step===8&&<div key={step} className="step-panel"><IdCard className="step-icon"/><span>EIN needs</span><h1>Do you need a federal tax ID (EIN)?</h1><label className="check-control"><input type="checkbox" checked={form.needsEIN} onChange={e=>set('needsEIN',e.target.checked)}/> I need an EIN for this business</label><label className="check-control"><input type="checkbox" checked={form.expectEmployees} onChange={e=>set('expectEmployees',e.target.checked)}/> I expect to have employees</label><label className="check-control"><input type="checkbox" checked={form.needsBanking} onChange={e=>set('needsBanking',e.target.checked)}/> I need this for opening a business bank account</label><label>Responsible party full name<input value={form.responsibleParty} onChange={e=>set('responsibleParty',e.target.value)} placeholder="The individual responsible for the business"/></label><label>SSN / ITIN status<select value={form.ssnItin} onChange={e=>set('ssnItin',e.target.value)}><option value="has-ssn">I have a Social Security Number</option><option value="has-itin">I have an ITIN</option><option value="none">I do not have either yet</option></select></label><p className="onboarding-note"><ShieldCheck size={15}/> An EIN cannot be automatically or instantly issued by this demo. Requests are prepared here and handled through a secure staff workflow.</p></div>}

    {step===9&&<div key={step} className="step-panel review-panel"><Sparkles className="step-icon"/><span>Recommendation</span><h1>Here is a transparent summary of your plan</h1><p>Based on your answers, here is what applies to your business. Nothing is purchased yet.</p><div className="review-card"><div><small>Entity</small><strong>{form.entityType} in {form.state||'your selected state'}</strong></div><div><small>Owners</small><strong>{form.owners} owner(s), {form.management}</strong></div><div><small>Registered agent</small><strong>{form.registeredAgent==='abf'?'American Business Formations':form.registeredAgent==='self'?'Self-provided':'Partner service'}</strong></div><div><small>EIN</small><strong>{form.needsEIN?'Requested':'Not requested'}</strong></div><div className="full"><small>Suggested add-ons based on your answers</small><div className="tag-row">{[form.bankingNeeds&&'Business banking intro',form.trademarkNeeds&&'Trademark intake',form.websiteNeeds&&'Website project intake',form.regulated&&'Licenses & permits research',!form.multiState===false&&form.foreignQualification&&'Foreign qualification'].filter(Boolean).map(x=><span key={x}>{x}</span>)}</div></div></div><p className="onboarding-note"><ShieldCheck size={15}/> Required government filing fees, recommended services, and optional add-ons are always shown separately in the next steps.</p></div>}

    {step===10&&<div key={step} className="step-panel review-panel"><CreditCard className="step-icon"/><span>Package</span><h1>Choose the plan that fits your business</h1><div className="pricing-grid onboarding-pricing">{plans.map(p=><button key={p.name} className={`price-card price-${p.theme} ${form.plan===p.name?'selected-plan':''}`} onClick={()=>set('plan',p.name)}><div className="price-card-head">{p.popular&&<span className="popular-label">Most popular</span>}<h3>{p.name}</h3><div className="price"><strong>{p.price}</strong><span>{p.note}</span></div></div><div className="price-card-body"><p>{p.description}</p>{form.plan===p.name&&<span className="plan-selected-badge"><Check size={16}/> Selected</span>}</div></button>)}</div></div>}

    {step===11&&<div key={step} className="step-panel"><span>Recommended services</span><h1>Would you like to add any of these?</h1><p>Nothing is preselected. Add only what your business needs.</p><div className="addon-grid">{addOnCatalog.map(a=><button key={a.id} className={form.addOns.includes(a.id)?'selected':''} onClick={()=>toggleAddOn(a.id)}><span>{form.addOns.includes(a.id)?<Check/>:'+'}</span><strong>{a.name}</strong><em>${a.price}</em></button>)}</div></div>}

    {step===12&&<div key={step} className="step-panel review-panel"><FileText className="step-icon"/><span>Review your plan</span><h1>Confirm your business details</h1><div className="review-card"><div><small>Business name</small><strong>{form.businessName}</strong></div><div><small>Entity</small><strong>{form.entityType} in {form.state}</strong></div><div><small>Ownership</small><strong>{form.owners} owner(s), {form.management}</strong></div><div><small>Plan</small><strong>{selectedPlan.name} — {selectedPlan.price} {selectedPlan.note}</strong></div><div className="full"><small>Selected add-ons</small><div className="tag-row">{form.addOns.length?form.addOns.map(id=><span key={id}>{addOnCatalog.find(a=>a.id===id)?.name}</span>):<span>None selected</span>}</div></div></div><div className="order-breakdown"><div><span>Service plan ({selectedPlan.name})</span><strong>${priceToNumber(selectedPlan.price)}</strong></div><div><span>{form.state||'State'} filing fee (sample)</span><strong>{stateFee?`$${stateFee}`:'Varies'}</strong></div>{form.addOns.map(id=>{const a=addOnCatalog.find(x=>x.id===id);return a?<div key={id}><span>{a.name}</span><strong>${a.price}</strong></div>:null})}<div className="order-total"><span>Estimated total due today</span><strong>${priceToNumber(selectedPlan.price)+stateFee+form.addOns.reduce((s,id)=>s+(addOnCatalog.find(a=>a.id===id)?.price||0),0)}</strong></div></div><label className="check-control terms-check"><input required type="checkbox"/> I agree to the Terms of Service, recurring billing terms, and service disclaimer.</label></div>}

    {step===13&&<div key={step} className="step-panel review-panel"><CreditCard className="step-icon"/><span>Payment</span><h1>Secure checkout</h1><p>This is a demo checkout. No real payment provider is connected and no card data is stored or transmitted.</p><div className="mock-payment-form"><label>Name on card<input placeholder="Jordan Lee" disabled={loading}/></label><label>Card number<input placeholder="4242 4242 4242 4242" disabled={loading}/></label><div className="form-grid"><label>Expiration<input placeholder="MM/YY" disabled={loading}/></label><label>CVC<input placeholder="123" disabled={loading}/></label></div><p className="onboarding-note"><ShieldCheck size={15}/> A production build would use hosted Stripe fields here so card data never touches this app&rsquo;s servers.</p></div></div>}

    {step===14&&confirmedOrder&&<div key={step} className="step-panel review-panel confirmation-panel"><div className="confirmation-check"><CheckCircle2/></div><h1>You&rsquo;re all set.</h1><p>Order <strong>{confirmedOrder.id}</strong> has been recorded and your business now appears in your dashboard.</p><div className="review-card"><div><small>Order total</small><strong>${confirmedOrder.total}</strong></div><div><small>Status</small><strong>Paid (demo)</strong></div></div><div className="onboarding-actions confirmation-actions"><button className="btn btn-primary" onClick={()=>navigate(user?'/dashboard':'/signup')}>Go to my dashboard <ArrowRight/></button></div></div>}

    {step<14&&<div className="onboarding-actions">{step>0?<button className="btn btn-ghost" onClick={goBack}><ArrowLeft/> Back</button>:<span/>}{step<13?<button className="btn btn-primary" disabled={!canNext} onClick={goNext}>Continue <ArrowRight/></button>:<button className="btn btn-primary" disabled={loading} onClick={submitPayment}>{loading&&<Loader2 className="spin" size={18}/>}{loading?'Processing...':'Complete purchase'} <ArrowRight/></button>}</div>}
  </main></div></section></>
}
