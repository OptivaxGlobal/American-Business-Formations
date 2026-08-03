import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { readLeads, updateLeadStatus } from '../../lib/leads'
import { logAudit } from '../../lib/auditLog'
import { validateRequiredSelect } from '../../validations/commonValidation'
import { Table } from '../../components/ui'

const statusOptions = ['new', 'contacted', 'qualified', 'converted', 'lost']

export default function AdminLeads(){
  const { user, notify } = useApp()
  const [leads, setLeads] = useState(readLeads)

  const setStatus = (id, status) => {
    if (!validateRequiredSelect(status, statusOptions).valid) return
    setLeads(updateLeadStatus(id, status))
    logAudit(user?.email||'admin', 'Updated lead status', `${id} -> ${status}`)
    notify('Lead updated.')
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Leads</h3><span className="status-badge neutral">{leads.length} captured</span></div>
    {leads.length === 0
      ? <p className="dash-empty">No leads captured yet. Leads are recorded when a visitor submits the homepage business-name form or the contact form.</p>
      : <Table>
          <thead><tr><th>Source</th><th>Business / name</th><th>Email</th><th>Captured</th><th>Status</th></tr></thead>
          <tbody>
            {leads.map(l => <tr key={l.id}>
              <td>{l.source}</td>
              <td>{l.businessName || l.name || '—'}</td>
              <td>{l.email || '—'}</td>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
              <td><select value={l.status} onChange={e=>setStatus(l.id, e.target.value)}>{statusOptions.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
            </tr>)}
          </tbody>
        </Table>}
  </div>
}
