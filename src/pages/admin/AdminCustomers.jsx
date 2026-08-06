import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Table } from '../../components/ui'
import AsyncState from '../../components/dashboard/AsyncState'

export default function AdminCustomers(){
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api.adminListCustomers()
      .then(res => setCustomers(res.data))
      .catch(err => setError(err?.message || 'We could not load customers. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Customers</h3><span className="admin-badge">{customers.length} total</span></div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading customers…">
      {customers.length === 0 && <p className="dash-empty">No customers yet.</p>}
      {customers.length > 0 && <Table>
        <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
        <tbody>
          {customers.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{new Date(c.created_at).toLocaleDateString()}</td></tr>)}
        </tbody>
      </Table>}
    </AsyncState>
  </div>
}
