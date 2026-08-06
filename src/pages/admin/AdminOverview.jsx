import { ClipboardList, Landmark, MessageSquare, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import AsyncState from '../../components/dashboard/AsyncState'

export default function AdminOverview(){
  const [overview, setOverview] = useState(null)
  const [applications, setApplications] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([
      api.adminOverview(), api.adminListApplications(), api.adminListCustomers(),
      api.adminListOrders(), api.adminListSupportThreads(),
    ])
      .then(([overviewRes, appsRes, customersRes, ordersRes, threadsRes]) => {
        setOverview(overviewRes.data)
        setApplications(appsRes.data)
        setCustomers(customersRes.data)
        setOrders(ordersRes.data)
        setThreads(threadsRes.data)
      })
      .catch(err => setError(err?.message || 'We could not load the admin overview. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading overview…">
    {overview && <>
      <div className="admin-kpi-grid">
        <div className="admin-kpi"><span>Applications</span><strong>{overview.applications}</strong></div>
        <div className="admin-kpi"><span>Needing review</span><strong>{overview.applications_needing_review}</strong></div>
        <div className="admin-kpi"><span>Revenue (paid orders)</span><strong>${(overview.revenue_cents / 100).toFixed(2)}</strong></div>
        <div className="admin-kpi"><span>Open support requests</span><strong>{overview.open_support_threads}</strong></div>
      </div>
      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-head"><div><span>Applications</span><h3>Recent activity</h3></div><Link to="/admin/applications">View all</Link></div>
          <div className="document-list">
            {applications.length === 0 && <p className="dash-empty">No applications yet.</p>}
            {applications.slice(0,5).map(a=>
              <div key={a.id}><div className="doc-icon"><ClipboardList/></div><span><strong>{a.name}</strong></span><span className={`admin-badge ${a.status}`}>{a.status}</span></div>
            )}
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-head"><div><span>Customers</span><h3>Directory</h3></div><Link to="/admin/customers">View all</Link></div>
          <div className="document-list">
            {customers.length === 0 && <p className="dash-empty">No customers yet.</p>}
            {customers.slice(0,4).map(c=><div key={c.id}><div className="doc-icon"><Users/></div><span><strong>{c.name}</strong><small>{c.email}</small></span></div>)}
          </div>
        </div>
      </div>
      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-head"><div><span>Orders</span><h3>Recent orders</h3></div><Link to="/admin/orders">View all</Link></div>
          <div className="document-list">
            {orders.length===0 && <p className="dash-empty">No orders recorded yet.</p>}
            {orders.slice(0,4).map(o=><div key={o.id}><div className="doc-icon"><Landmark/></div><span><strong>{o.order_number}</strong><small>{new Date(o.created_at).toLocaleDateString()}</small></span><strong>${(o.total_cents/100).toFixed(2)}</strong></div>)}
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-head"><div><span>Support</span><h3>Open requests</h3></div><Link to="/admin/support">View all</Link></div>
          <div className="document-list">
            {threads.filter(t=>t.status==='open').length === 0 && <p className="dash-empty">No open support requests.</p>}
            {threads.filter(t=>t.status==='open').slice(0,4).map(t=><div key={t.id}><div className="doc-icon"><MessageSquare/></div><span><strong>{t.subject}</strong><small>{t.customer_name}</small></span></div>)}
          </div>
        </div>
      </div>
    </>}
  </AsyncState>
}
