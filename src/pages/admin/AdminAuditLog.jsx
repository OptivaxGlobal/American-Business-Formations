import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Table } from '../../components/ui'
import AsyncState from '../../components/dashboard/AsyncState'

export default function AdminAuditLog(){
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api.adminAuditLog()
      .then(res => setLog(res.data))
      .catch(err => setError(err?.message || 'We could not load the audit log. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Audit log</h3><span className="admin-badge">{log.length} recorded actions</span></div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading audit log…">
      <Table>
        <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Details</th></tr></thead>
        <tbody>
          {log.length===0 && <tr><td colSpan={4}>No admin actions recorded yet actions taken elsewhere in this portal will appear here.</td></tr>}
          {log.map(entry => <tr key={entry.id}><td>{new Date(entry.at).toLocaleString()}</td><td>{entry.actor || '—'}</td><td>{entry.action}</td><td>{entry.details}</td></tr>)}
        </tbody>
      </Table>
    </AsyncState>
  </div>
}
