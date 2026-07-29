import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getTexasConfig, saveTexasConfigOverrides } from '../../config/texas'
import { useApp } from '../../context/AppContext'
import { logAudit } from '../../lib/auditLog'
import { SUPPORT_EMAIL } from '../../data/seo'
import { validateAdminText, validatePriceInput } from '../../validations/adminValidation'

export default function AdminSettings(){
  const { user, notify } = useApp()
  const [config, setConfig] = useState(getTexasConfig)
  const [errors, setErrors] = useState({})

  const validateConfig = (c) => {
    const errs = {}
    const normalized = {}
    const feeResult = validatePriceInput(c.filingFee, { required: true, min: 0, max: 5000 })
    if (!feeResult.valid) errs.filingFee = feeResult.message
    else normalized.filingFee = feeResult.normalized
    const standardResult = validateAdminText(c.processingTimeStandard, { required: true, min: 3, max: 200 })
    if (!standardResult.valid) errs.processingTimeStandard = standardResult.message
    else normalized.processingTimeStandard = standardResult.normalized
    const expeditedTimeResult = validateAdminText(c.processingTimeExpedited, { required: true, min: 3, max: 200 })
    if (!expeditedTimeResult.valid) errs.processingTimeExpedited = expeditedTimeResult.message
    else normalized.processingTimeExpedited = expeditedTimeResult.normalized
    const expeditedFeeResult = validatePriceInput(c.expeditedFee, { required: true, min: 0, max: 5000 })
    if (!expeditedFeeResult.valid) errs.expeditedFee = expeditedFeeResult.message
    else normalized.expeditedFee = expeditedFeeResult.normalized
    return { errs, normalized }
  }

  const save = () => {
    const { errs: nextErrors, normalized } = validateConfig(config)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      notify('Fix the highlighted fields before saving.')
      return
    }
    const next = saveTexasConfigOverrides({ ...config, ...normalized })
    setConfig(next)
    logAudit(user?.email||'admin', 'Updated Texas configuration', JSON.stringify({ filingFee: next.filingFee, filingFeeVerified: next.filingFeeVerified }))
    notify('Texas configuration saved.')
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Texas configuration</h3></div>
    {!config.filingFeeVerified && <p className="onboarding-note admin-warning"><AlertTriangle size={15}/> The filing fee and processing times below are owner-configured placeholders. Confirm current amounts on the Texas Secretary of State website, then mark them verified.</p>}
    <div className="admin-plan-editor">
      <label>Texas Certificate of Formation filing fee (USD)</label>
      <input type="number" min="0" step="0.01" value={config.filingFee} onChange={e=>setConfig(c=>({...c, filingFee: e.target.value}))} aria-invalid={errors.filingFee?'true':'false'}/>
      {errors.filingFee && <p className="field-error">{errors.filingFee}</p>}
      <label className="check-control" style={{marginTop:12}}><input type="checkbox" checked={config.filingFeeVerified} onChange={e=>setConfig(c=>({...c, filingFeeVerified: e.target.checked}))}/> I have verified this fee against the Texas Secretary of State</label>
      <label>Standard processing time estimate</label>
      <input value={config.processingTimeStandard} onChange={e=>setConfig(c=>({...c, processingTimeStandard: e.target.value}))} aria-invalid={errors.processingTimeStandard?'true':'false'}/>
      {errors.processingTimeStandard && <p className="field-error">{errors.processingTimeStandard}</p>}
      <label>Expedited processing time estimate</label>
      <input value={config.processingTimeExpedited} onChange={e=>setConfig(c=>({...c, processingTimeExpedited: e.target.value}))} aria-invalid={errors.processingTimeExpedited?'true':'false'}/>
      {errors.processingTimeExpedited && <p className="field-error">{errors.processingTimeExpedited}</p>}
      <label>Expedited processing fee (USD)</label>
      <input type="number" min="0" step="0.01" value={config.expeditedFee} onChange={e=>setConfig(c=>({...c, expeditedFee: e.target.value}))} aria-invalid={errors.expeditedFee?'true':'false'}/>
      {errors.expeditedFee && <p className="field-error">{errors.expeditedFee}</p>}
    </div>
    <button className="btn btn-primary" onClick={save}>Save configuration</button>

    <div className="admin-toolbar" style={{marginTop:32}}><h3>Company contact</h3></div>
    <p className="dash-empty" style={{padding:0}}>Support email is centrally set to <strong>{SUPPORT_EMAIL}</strong> in <code>src/data/seo.js</code> (and should mirror the backend <code>SUPPORT_EMAIL</code> environment variable). No phone number or mailing address is published because none was found in the original project add real values there once confirmed by the business owner.</p>
  </div>
}
