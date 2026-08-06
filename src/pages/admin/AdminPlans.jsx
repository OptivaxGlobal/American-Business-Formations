import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { validateAdminText, validatePriceInput } from '../../validations/adminValidation'
import AsyncState from '../../components/dashboard/AsyncState'

function centsToDollarInput(cents) { return (cents / 100).toFixed(2) }
function dollarInputToCents(value) { return Math.round(Number(value) * 100) }

export default function AdminPlans(){
  const { notify } = useApp()
  const [packages, setPackages] = useState([])
  const [addOns, setAddOns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [packageErrors, setPackageErrors] = useState({})
  const [addOnErrors, setAddOnErrors] = useState({})
  const [savingId, setSavingId] = useState(null)

  const load = () => {
    setLoading(true)
    setError('')
    api.adminListPlans()
      .then(res => {
        setPackages(res.data.packages.map(p => ({ ...p, priceInput: centsToDollarInput(p.price_cents) })))
        setAddOns(res.data.add_ons.map(a => ({ ...a, priceInput: centsToDollarInput(a.price_cents) })))
      })
      .catch(err => setError(err?.message || 'We could not load pricing. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updatePackageField = (id, patch) => setPackages(list => list.map(p => p.id === id ? { ...p, ...patch } : p))
  const updateAddOnField = (id, patch) => setAddOns(list => list.map(a => a.id === id ? { ...a, ...patch } : a))

  const savePackage = async (pkg) => {
    const nameResult = validateAdminText(pkg.name, { required: true, min: 2, max: 80 })
    const priceResult = validatePriceInput(pkg.priceInput, { required: true, min: 0, max: 50000 })
    const errs = {}
    if (!nameResult.valid) errs.name = nameResult.message
    if (!priceResult.valid) errs.price = priceResult.message
    setPackageErrors(e => ({ ...e, [pkg.id]: errs }))
    if (Object.keys(errs).length) { notify('Fix the highlighted fields before saving.', 'error'); return }

    setSavingId(pkg.id)
    try {
      const res = await api.adminUpdatePackage(pkg.id, {
        name: nameResult.normalized, price_cents: dollarInputToCents(pkg.priceInput),
        billing_note: pkg.billing_note, description: pkg.description, features: pkg.features, is_popular: pkg.is_popular,
      })
      updatePackageField(pkg.id, { ...res.data, priceInput: centsToDollarInput(res.data.price_cents) })
      notify('Package saved.')
    } catch (err) {
      notify(err.message || 'We could not save that package. Please try again.', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const saveAddOn = async (addOn) => {
    const nameResult = validateAdminText(addOn.name, { required: true, min: 2, max: 160 })
    const priceResult = validatePriceInput(addOn.priceInput, { required: true, min: 0, max: 50000 })
    const errs = {}
    if (!nameResult.valid) errs.name = nameResult.message
    if (!priceResult.valid) errs.price = priceResult.message
    setAddOnErrors(e => ({ ...e, [addOn.id]: errs }))
    if (Object.keys(errs).length) { notify('Fix the highlighted fields before saving.', 'error'); return }

    setSavingId(addOn.id)
    try {
      const res = await api.adminUpdateAddOn(addOn.id, {
        name: nameResult.normalized, price_cents: dollarInputToCents(addOn.priceInput),
        recurring: addOn.recurring, active: addOn.active,
      })
      updateAddOnField(addOn.id, { ...res.data, priceInput: centsToDollarInput(res.data.price_cents) })
      notify('Add-on saved.')
    } catch (err) {
      notify(err.message || 'We could not save that add-on. Please try again.', 'error')
    } finally {
      setSavingId(null)
    }
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Products & plans</h3><Link to="/pricing" className="btn btn-outline" target="_blank" rel="noopener noreferrer">View live pricing page</Link></div>
    <p className="onboarding-note">This screen edits the real catalog checkout charges against every order already placed keeps the price it was charged at the time of purchase, unaffected by edits here. The public marketing pricing pages (Home, Pricing) show their own separately-maintained copy for a fast, always-available page load keep the numbers in sync by hand until a future pass connects them live.</p>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading pricing…">
      <h4 style={{marginTop:8}}>Formation packages</h4>
      {packages.map(plan => <div className="admin-plan-editor" key={plan.id}>
        <div className="admin-toolbar"><strong>{plan.name}</strong><label className="check-control terms-check" style={{margin:0}}><input type="checkbox" checked={!!plan.is_popular} onChange={e=>updatePackageField(plan.id,{is_popular:e.target.checked})}/> Most popular</label></div>
        <label>Plan name<input value={plan.name} onChange={e=>updatePackageField(plan.id,{name:e.target.value})} aria-invalid={packageErrors[plan.id]?.name?'true':'false'}/></label>
        {packageErrors[plan.id]?.name && <p className="field-error">{packageErrors[plan.id].name}</p>}
        <label>Price (USD)<input value={plan.priceInput} onChange={e=>updatePackageField(plan.id,{priceInput:e.target.value})} aria-invalid={packageErrors[plan.id]?.price?'true':'false'}/></label>
        {packageErrors[plan.id]?.price && <p className="field-error">{packageErrors[plan.id].price}</p>}
        <label>Billing note<input value={plan.billing_note||''} onChange={e=>updatePackageField(plan.id,{billing_note:e.target.value})}/></label>
        <label>Description<textarea rows="2" value={plan.description||''} onChange={e=>updatePackageField(plan.id,{description:e.target.value})}/></label>
        <label>Features (one per line)<textarea rows="4" value={(plan.features||[]).join('\n')} onChange={e=>updatePackageField(plan.id,{features:e.target.value.split('\n').filter(Boolean)})}/></label>
        <button className="btn btn-primary" disabled={savingId===plan.id} onClick={()=>savePackage(plan)}>{savingId===plan.id?'Saving…':'Save package'}</button>
      </div>)}

      <h4 style={{marginTop:32}}>Add-on services</h4>
      {addOns.map(addOn => <div className="admin-plan-editor" key={addOn.id}>
        <div className="admin-toolbar">
          <strong>{addOn.slug}</strong>
          <div style={{display:'flex',gap:16}}>
            <label className="check-control terms-check" style={{margin:0}}><input type="checkbox" checked={!!addOn.recurring} onChange={e=>updateAddOnField(addOn.id,{recurring:e.target.checked})}/> Recurring</label>
            <label className="check-control terms-check" style={{margin:0}}><input type="checkbox" checked={addOn.active!==false} onChange={e=>updateAddOnField(addOn.id,{active:e.target.checked})}/> Active</label>
          </div>
        </div>
        <label>Name<input value={addOn.name} onChange={e=>updateAddOnField(addOn.id,{name:e.target.value})} aria-invalid={addOnErrors[addOn.id]?.name?'true':'false'}/></label>
        {addOnErrors[addOn.id]?.name && <p className="field-error">{addOnErrors[addOn.id].name}</p>}
        <label>Price (USD)<input value={addOn.priceInput} onChange={e=>updateAddOnField(addOn.id,{priceInput:e.target.value})} aria-invalid={addOnErrors[addOn.id]?.price?'true':'false'}/></label>
        {addOnErrors[addOn.id]?.price && <p className="field-error">{addOnErrors[addOn.id].price}</p>}
        <button className="btn btn-primary" disabled={savingId===addOn.id} onClick={()=>saveAddOn(addOn)}>{savingId===addOn.id?'Saving…':'Save add-on'}</button>
      </div>)}
    </AsyncState>
  </div>
}
