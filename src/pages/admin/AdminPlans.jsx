import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadPlans } from '../../components/PricingCards'
import { useApp } from '../../context/AppContext'
import { logAudit } from '../../lib/auditLog'
import { validateAdminText, validatePriceInput } from '../../validations/adminValidation'

export default function AdminPlans(){
  const { user, notify } = useApp()
  const [plans, setPlans] = useState(loadPlans)
  const [errors, setErrors] = useState({})

  const updatePlan = (i, patch) => {
    const next = plans.map((p, idx) => idx === i ? { ...p, ...patch } : p)
    setPlans(next)
  }

  const validatePlan = (plan) => {
    const errs = {}
    const nameResult = validateAdminText(plan.name, { required: true, min: 2, max: 80 })
    if (!nameResult.valid) errs.name = nameResult.message
    const priceResult = validatePriceInput(plan.price, { required: true, min: 0, max: 50000 })
    if (!priceResult.valid) errs.price = priceResult.message
    return errs
  }

  const save = () => {
    const nextErrors = {}
    plans.forEach((plan, i) => {
      const errs = validatePlan(plan)
      if (Object.keys(errs).length) nextErrors[i] = errs
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      notify('Fix the highlighted plan fields before saving.')
      return
    }
    localStorage.setItem('abf-admin-plans', JSON.stringify(plans))
    logAudit(user?.email||'admin', 'Updated pricing plans', plans.map(p=>p.name).join(', '))
    notify('Plans saved changes are now live on the pricing page.')
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Products & plans</h3><Link to="/pricing" className="btn btn-outline" target="_blank" rel="noopener noreferrer">View live pricing page</Link></div>
    {plans.map((plan, i) => <div className="admin-plan-editor" key={plan.name}>
      <div className="admin-toolbar"><strong>{plan.name}</strong><label className="check-control terms-check" style={{margin:0}}><input type="checkbox" checked={!!plan.popular} onChange={e=>updatePlan(i,{popular:e.target.checked})}/> Most popular</label></div>
      <label>Plan name<input value={plan.name} onChange={e=>updatePlan(i,{name:e.target.value})} aria-invalid={errors[i]?.name?'true':'false'}/></label>
      {errors[i]?.name && <p className="field-error">{errors[i].name}</p>}
      <label>Price<input value={plan.price} onChange={e=>updatePlan(i,{price:e.target.value})} aria-invalid={errors[i]?.price?'true':'false'}/></label>
      {errors[i]?.price && <p className="field-error">{errors[i].price}</p>}
      <label>Billing note<input value={plan.note} onChange={e=>updatePlan(i,{note:e.target.value})}/></label>
      <label>Description<textarea rows="2" value={plan.description} onChange={e=>updatePlan(i,{description:e.target.value})}/></label>
      <label>Features (one per line)<textarea rows="4" value={plan.features.join('\n')} onChange={e=>updatePlan(i,{features:e.target.value.split('\n').filter(Boolean)})}/></label>
    </div>)}
    <button className="btn btn-primary" onClick={save}>Save plans</button>
  </div>
}
