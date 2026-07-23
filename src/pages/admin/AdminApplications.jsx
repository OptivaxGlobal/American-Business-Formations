import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useBusiness } from '../../context/BusinessContext'
import { sampleApplications, applicationStatuses } from '../../data/adminDemoData'
import { logAudit } from '../../lib/auditLog'

export default function AdminApplications(){
  const { user, notify } = useApp()
  const { businesses, updateBusiness } = useBusiness()
  const [sampleStatuses, setSampleStatuses] = useState(() => Object.fromEntries(sampleApplications.map(a=>[a.id,a.status])))

  const changeReal = (id, status) => {
    updateBusiness(id, { status })
    logAudit(user?.email||'admin', 'Updated application status', `${id} -> ${status}`)
    notify('Application status updated.')
  }
  const changeSample = (id, status) => {
    setSampleStatuses(prev => ({ ...prev, [id]: status }))
    logAudit(user?.email||'admin', 'Updated application status (sample)', `${id} -> ${status}`)
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>All applications</h3><span className="admin-badge">{businesses.length} real in this browser + {sampleApplications.length} sample</span></div>
    <div style={{overflowX:'auto'}}><table className="admin-table">
      <thead><tr><th>Business</th><th>State</th><th>Entity type</th><th>Created</th><th>Status</th></tr></thead>
      <tbody>
        {businesses.map(b => <tr key={b.id}>
          <td>{b.name}</td><td>{b.state}</td><td>{b.entityType}</td><td>{new Date(b.createdAt).toLocaleDateString()}</td>
          <td><select value={b.status} onChange={e=>changeReal(b.id, e.target.value)}>{applicationStatuses.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
        </tr>)}
        {sampleApplications.map(a => <tr key={a.id}>
          <td>{a.businessName}</td><td>{a.state}</td><td>{a.entityType}</td><td>{new Date(a.createdAt).toLocaleDateString()}</td>
          <td><select value={sampleStatuses[a.id]} onChange={e=>changeSample(a.id, e.target.value)}>{applicationStatuses.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
        </tr>)}
      </tbody>
    </table></div>
  </div>
}
