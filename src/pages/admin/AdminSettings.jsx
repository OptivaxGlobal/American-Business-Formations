import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { SUPPORT_EMAIL } from '../../data/seo'
import AsyncState from '../../components/dashboard/AsyncState'

export default function AdminSettings(){
  const [config, setConfig] = useState(null)
  const [paymentsEnabled, setPaymentsEnabled] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([api.getTexasConfig(), api.adminGetPaymentStatus()])
      .then(([configRes, statusRes]) => {
        setConfig(configRes.data)
        setPaymentsEnabled(statusRes.data.payments_enabled)
      })
      .catch(err => setError(err?.message || 'We could not load settings. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Texas configuration</h3></div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading settings…">
      {config && <>
        {!config.filing_fee_verified && <p className="onboarding-note admin-warning"><AlertTriangle size={15}/> The filing fee below is an owner-configured placeholder pending confirmation against the Texas Secretary of State.</p>}
        <div className="admin-plan-editor">
          <div><small>Certificate of Formation filing fee</small><strong>${(config.filing_fee_cents/100).toFixed(2)}</strong></div>
          <div style={{marginTop:8}}><small>Verified against the Secretary of State</small><strong>{config.filing_fee_verified ? 'Yes' : 'No'}</strong></div>
        </div>
        <p className="dash-empty" style={{padding:0, marginTop:12}}>
          This is set on the server via the <code>TEXAS_FILING_FEE</code> / <code>TEXAS_FILING_FEE_VERIFIED</code> environment variables (see <code>server/.env.example</code>) it deliberately isn't editable from a form, since this number feeds directly into real order totals at checkout and should only change through a reviewed deploy, not a runtime click.
        </p>
      </>}

      <div className="admin-toolbar" style={{marginTop:32}}><h3>Payments</h3></div>
      <p className="dash-empty" style={{padding:0}}>
        Online payments are currently <strong>{paymentsEnabled ? 'enabled' : 'disabled'}</strong>{!paymentsEnabled && ' new orders are saved as "awaiting payment" and admins record payment manually from the Orders screen'}. Controlled by the <code>STRIPE_SECRET_KEY</code>/<code>STRIPE_WEBHOOK_SECRET</code> environment variables see <code>docs/stripe-activation.md</code>.
      </p>

      <div className="admin-toolbar" style={{marginTop:32}}><h3>Company contact</h3></div>
      <p className="dash-empty" style={{padding:0}}>Support email is centrally set to <strong>{SUPPORT_EMAIL}</strong> in <code>src/data/seo.js</code> (and should mirror the backend <code>SUPPORT_EMAIL</code> environment variable). No phone number or mailing address is published because none was found in the original project add real values there once confirmed by the business owner.</p>
    </AsyncState>
  </div>
}
