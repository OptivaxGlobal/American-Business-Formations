import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { sampleTickets } from '../../data/adminDemoData'
import { logAudit } from '../../lib/auditLog'

function load(){ try { return JSON.parse(localStorage.getItem('abf-tickets'))||[] } catch { return [] } }

export default function AdminSupport(){
  const { user, notify } = useApp()
  const [tickets, setTickets] = useState(load)
  const [sampleStatus, setSampleStatus] = useState(() => Object.fromEntries(sampleTickets.map(t=>[t.id,t.status])))

  const resolveReal = id => {
    const next = tickets.map(t => t.id===id ? { ...t, status: 'resolved' } : t)
    setTickets(next)
    localStorage.setItem('abf-tickets', JSON.stringify(next))
    logAudit(user?.email||'admin', 'Resolved support ticket', id)
    notify('Ticket marked resolved.')
  }
  const resolveSample = id => { setSampleStatus(prev => ({...prev,[id]:'resolved'})); logAudit(user?.email||'admin','Resolved support ticket (sample)', id) }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Support tickets</h3></div>
    <div style={{overflowX:'auto'}}><table className="admin-table">
      <thead><tr><th>Subject</th><th>Priority</th><th>Status</th><th>Created</th><th></th></tr></thead>
      <tbody>
        {tickets.map(t => <tr key={t.id}><td>{t.subject}</td><td>{t.priority}</td><td><span className={`admin-badge ${t.status==='resolved'?'approved':'pending'}`}>{t.status}</span></td><td>{new Date(t.createdAt).toLocaleDateString()}</td><td>{t.status!=='resolved' && <button className="btn btn-outline" onClick={()=>resolveReal(t.id)}>Resolve</button>}</td></tr>)}
        {sampleTickets.map(t => <tr key={t.id}><td>{t.subject}</td><td>{t.priority}</td><td><span className={`admin-badge ${sampleStatus[t.id]==='resolved'?'approved':'pending'}`}>{sampleStatus[t.id]}</span></td><td>{new Date(t.createdAt).toLocaleDateString()}</td><td>{sampleStatus[t.id]!=='resolved' && <button className="btn btn-outline" onClick={()=>resolveSample(t.id)}>Resolve</button>}</td></tr>)}
        {tickets.length===0 && sampleTickets.length===0 && <tr><td colSpan={5}>No tickets.</td></tr>}
      </tbody>
    </table></div>
  </div>
}
