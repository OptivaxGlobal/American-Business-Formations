import { useApp } from '../../context/AppContext'
import { useBusiness } from '../../context/BusinessContext'
import { sampleCustomers } from '../../data/adminDemoData'

export default function AdminCustomers(){
  const { user } = useApp()
  const { businesses } = useBusiness()

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Customers</h3></div>
    <div style={{overflowX:'auto'}}><table className="admin-table">
      <thead><tr><th>Name</th><th>Email</th><th>Businesses</th><th>Joined</th></tr></thead>
      <tbody>
        {user && <tr><td>{user.name} <span className="admin-badge">You (current session)</span></td><td>{user.email}</td><td>{businesses.length}</td><td>—</td></tr>}
        {sampleCustomers.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.businesses}</td><td>{new Date(c.joinedAt).toLocaleDateString()}</td></tr>)}
      </tbody>
    </table></div>
  </div>
}
