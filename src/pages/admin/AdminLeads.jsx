import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { validateRequiredSelect } from '../../validations/commonValidation'
import { Table } from '../../components/ui'
import AsyncState from '../../components/dashboard/AsyncState'

const statusOptions = ['new', 'contacted', 'qualified', 'converted', 'lost']

export default function AdminLeads(){
  const { notify } = useApp()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api.adminListLeads()
      .then(res => setLeads(res.data))
      .catch(err => setError(err?.message || 'We could not load leads. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id, status) => {
    if (!validateRequiredSelect(status, statusOptions).valid) return
    const previous = leads
    setLeads(list => list.map(l => l.id === id ? { ...l, status } : l))
    try {
      await api.adminUpdateLead(id, { status })
      notify('Lead updated.')
    } catch (err) {
      setLeads(previous) // roll back the server rejected the change
      notify(err.message || 'We could not update that lead. Please try again.', 'error')
    }
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Leads</h3><span className="status-badge neutral">{leads.length} captured</span></div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading leads…">
      {leads.length === 0
        ? <p className="dash-empty">No leads captured yet. Leads are recorded when a visitor submits the homepage business-name form, the resource checklist, or the contact form.</p>
        : <Table>
            <thead><tr><th>Source</th><th>Business / name</th><th>Email</th><th>Captured</th><th>Status</th></tr></thead>
            <tbody>
              {leads.map(l => <tr key={l.id}>
                <td>{l.source}</td>
                <td>{l.business_name || l.name || '—'}</td>
                <td>{l.email || '—'}</td>
                <td>{new Date(l.created_at).toLocaleString()}</td>
                <td><select value={l.status} onChange={e=>setStatus(l.id, e.target.value)}>{statusOptions.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
              </tr>)}
            </tbody>
          </Table>}
    </AsyncState>
  </div>
}
