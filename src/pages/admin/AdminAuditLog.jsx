import { readAuditLog } from '../../lib/auditLog'

export default function AdminAuditLog(){
  const log = readAuditLog()
  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Audit log</h3><span className="admin-badge">{log.length} recorded actions in this browser</span></div>
    <div style={{overflowX:'auto'}}><table className="admin-table">
      <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Details</th></tr></thead>
      <tbody>
        {log.length===0 && <tr><td colSpan={4}>No admin actions recorded yet — actions taken elsewhere in this portal will appear here.</td></tr>}
        {log.map(entry => <tr key={entry.id}><td>{new Date(entry.at).toLocaleString()}</td><td>{entry.actor}</td><td>{entry.action}</td><td>{entry.details}</td></tr>)}
      </tbody>
    </table></div>
  </div>
}
