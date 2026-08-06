import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { validateRequiredSelect } from '../../validations/commonValidation'
import { Table } from '../../components/ui'
import AsyncState from '../../components/dashboard/AsyncState'

const applicationStatuses = ['draft', 'submitted', 'under_review', 'info_requested', 'ready_to_file', 'submitted_to_state', 'approved', 'rejected']

export default function AdminApplications(){
  const { notify } = useApp()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api.adminListApplications()
      .then(res => setBusinesses(res.data))
      .catch(err => setError(err?.message || 'We could not load applications. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const changeStatus = async (id, status) => {
    if (!validateRequiredSelect(status, applicationStatuses).valid) return
    const previous = businesses
    setBusinesses(list => list.map(b => b.id === id ? { ...b, status } : b))
    try {
      await api.adminUpdateApplicationStatus(id, status)
      notify('Application status updated.')
    } catch (err) {
      setBusinesses(previous)
      notify(err.message || 'We could not update that status. Please try again.', 'error')
    }
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>All applications</h3><span className="admin-badge">{businesses.length} total</span></div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading applications…">
      {businesses.length === 0 && <p className="dash-empty">No applications yet.</p>}
      {businesses.length > 0 && <Table>
        <thead><tr><th>Business</th><th>State</th><th>Entity type</th><th>Created</th><th>Status</th></tr></thead>
        <tbody>
          {businesses.map(b => <tr key={b.id}>
            <td>{b.name}</td><td>{b.state}</td><td>{b.entity_type}</td><td>{new Date(b.created_at).toLocaleDateString()}</td>
            <td><select value={b.status} onChange={e=>changeStatus(b.id, e.target.value)}>{applicationStatuses.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
          </tr>)}
        </tbody>
      </Table>}
    </AsyncState>
  </div>
}
