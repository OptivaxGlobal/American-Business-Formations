import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { statesConfig as defaultConfig } from '../../data/statesConfig'
import { useApp } from '../../context/AppContext'
import { logAudit } from '../../lib/auditLog'

function load(){
  try {
    const stored = JSON.parse(localStorage.getItem('abf-admin-states'))
    if (stored) return stored
  } catch { /* fall through */ }
  return defaultConfig
}

export default function AdminStates(){
  const { user, notify } = useApp()
  const [config, setConfig] = useState(load)

  const save = (name, patch) => {
    const next = { ...config, [name]: { ...config[name], ...patch } }
    setConfig(next)
    localStorage.setItem('abf-admin-states', JSON.stringify(next))
  }

  const markVerified = name => {
    save(name, { verified: true, lastVerifiedBy: user?.email || 'admin', lastVerifiedAt: new Date().toISOString() })
    logAudit(user?.email||'admin', 'Marked state data verified', name)
    notify(`${name} marked verified.`)
  }

  const rows = Object.values(config)
  const unverifiedCount = rows.filter(r=>!r.verified).length

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>State configuration</h3></div>
    {unverifiedCount>0 && <p className="onboarding-note admin-warning"><AlertTriangle size={15}/> {unverifiedCount} of {rows.length} states have unverified fee/processing data. This is sample/placeholder information only — confirm with each Secretary of State before relying on it for filings or customer-facing pricing.</p>}
    <div style={{overflowX:'auto'}}><table className="admin-table">
      <thead><tr><th>State</th><th>Sample fee</th><th>Sample processing time</th><th>Verified</th><th>Last verified</th></tr></thead>
      <tbody>
        {rows.map(s => <tr key={s.name}>
          <td>{s.name}</td>
          <td><input value={s.sampleFee ?? ''} placeholder="varies" onChange={e=>save(s.name,{sampleFee:e.target.value?Number(e.target.value):null})} style={{width:70}}/></td>
          <td><input value={s.sampleProcessingTime ?? ''} placeholder="varies" onChange={e=>save(s.name,{sampleProcessingTime:e.target.value})} style={{width:140}}/></td>
          <td>{s.verified ? <span className="admin-badge approved">Verified</span> : <button className="btn btn-outline" onClick={()=>markVerified(s.name)}>Mark verified</button>}</td>
          <td>{s.lastVerifiedAt ? new Date(s.lastVerifiedAt).toLocaleDateString() : '—'}</td>
        </tr>)}
      </tbody>
    </table></div>
  </div>
}
