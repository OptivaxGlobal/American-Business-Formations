import { ClipboardList, Landmark, MessageSquare, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../../context/BusinessContext'
import { useOrders } from '../../context/OrdersContext'
import { sampleApplications, sampleCustomers, sampleTickets } from '../../data/adminDemoData'

function loadTickets(){ try { return JSON.parse(localStorage.getItem('abf-tickets'))||[] } catch { return [] } }

export default function AdminOverview(){
  const { businesses } = useBusiness()
  const { orders } = useOrders()
  const tickets = [...loadTickets(), ...sampleTickets]
  const revenue = orders.reduce((s,o)=>s+o.total,0)
  const openApplications = businesses.filter(b=>b.status!=='approved').length + sampleApplications.filter(a=>a.status!=='approved').length

  return <>
    <div className="admin-kpi-grid">
      <div className="admin-kpi"><span>Applications</span><strong>{businesses.length + sampleApplications.length}</strong></div>
      <div className="admin-kpi"><span>Needing review</span><strong>{openApplications}</strong></div>
      <div className="admin-kpi"><span>Orders revenue (demo)</span><strong>${revenue}</strong></div>
      <div className="admin-kpi"><span>Open tickets</span><strong>{tickets.filter(t=>t.status==='open').length}</strong></div>
    </div>
    <div className="dash-grid">
      <div className="dash-card">
        <div className="dash-card-head"><div><span>Applications</span><h3>Recent activity</h3></div><Link to="/admin/applications">View all</Link></div>
        <div className="document-list">
          {[...businesses.map(b=>({id:b.id,name:b.name,status:b.status})), ...sampleApplications.map(a=>({id:a.id,name:a.businessName,status:a.status}))].slice(0,5).map(a=>
            <div key={a.id}><div className="doc-icon"><ClipboardList/></div><span><strong>{a.name}</strong></span><span className={`admin-badge ${a.status}`}>{a.status}</span></div>
          )}
        </div>
      </div>
      <div className="dash-card">
        <div className="dash-card-head"><div><span>Customers</span><h3>Sample directory</h3></div><Link to="/admin/customers">View all</Link></div>
        <div className="document-list">
          {sampleCustomers.slice(0,4).map(c=><div key={c.id}><div className="doc-icon"><Users/></div><span><strong>{c.name}</strong><small>{c.email}</small></span></div>)}
        </div>
      </div>
    </div>
    <div className="dash-grid">
      <div className="dash-card">
        <div className="dash-card-head"><div><span>Orders</span><h3>Recent orders</h3></div><Link to="/admin/orders">View all</Link></div>
        <div className="document-list">
          {orders.length===0 && <p className="dash-empty">No orders recorded in this browser session yet.</p>}
          {orders.slice(-4).reverse().map(o=><div key={o.id}><div className="doc-icon"><Landmark/></div><span><strong>{o.id}</strong><small>{new Date(o.createdAt).toLocaleDateString()}</small></span><strong>${o.total}</strong></div>)}
        </div>
      </div>
      <div className="dash-card">
        <div className="dash-card-head"><div><span>Support</span><h3>Open tickets</h3></div><Link to="/admin/support">View all</Link></div>
        <div className="document-list">
          {tickets.filter(t=>t.status==='open').slice(0,4).map(t=><div key={t.id}><div className="doc-icon"><MessageSquare/></div><span><strong>{t.subject}</strong></span></div>)}
        </div>
      </div>
    </div>
  </>
}
