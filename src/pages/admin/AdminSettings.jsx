import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { SUPPORT_EMAIL } from '../../data/seo'
import AsyncState from '../../components/dashboard/AsyncState'
import { Table } from '../../components/ui'

export default function AdminSettings(){
  const [states, setStates] = useState([])
  const [paymentsEnabled, setPaymentsEnabled] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([api.getStates(), api.adminGetPaymentStatus()])
      .then(([statesRes, statusRes]) => {
        setStates(statesRes.data.states || [])
        setPaymentsEnabled(statusRes.data.payments_enabled)
      })
      .catch(err => setError(err?.message || 'We could not load settings. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>LLC formation states ({states.length})</h3></div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading settings…">
      {states.length > 0 && <>
        <Table>
          <thead><tr><th>State</th><th>Filing fee</th><th>Filing authority</th><th>Notes</th></tr></thead>
          <tbody>
            {states.map(s => (
              <tr key={s.code}>
                <td>{s.name} ({s.code})</td>
                <td>${(s.llcFormationFeeCents / 100).toFixed(2)}</td>
                <td>{s.filingAuthority}</td>
                <td>{s.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="dash-empty" style={{padding:0, marginTop:12}}>
          These figures are set in <code>server/app/services/states.py</code> (mirrored for display on the frontend at <code>src/data/states.js</code>) it deliberately isn't editable from a form, since these numbers feed directly into real order totals at checkout and should only change through a reviewed deploy, not a runtime click. Each state's fee was verified against that state's own filing authority; government fees can change without notice re-verify periodically.
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
