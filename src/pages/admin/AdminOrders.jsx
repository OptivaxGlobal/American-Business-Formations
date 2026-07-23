import { useBusiness } from '../../context/BusinessContext'
import { useOrders } from '../../context/OrdersContext'

export default function AdminOrders(){
  const { orders } = useOrders()
  const { businesses } = useBusiness()
  const businessName = id => businesses.find(b=>b.id===id)?.name || 'Unknown'

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Orders & payments</h3><span className="admin-badge">Recorded locally — no real payment processor connected</span></div>
    <div style={{overflowX:'auto'}}><table className="admin-table">
      <thead><tr><th>Order</th><th>Business</th><th>Service fees</th><th>State fees</th><th>Add-ons</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        {orders.length===0 && <tr><td colSpan={8}>No orders yet.</td></tr>}
        {orders.slice().reverse().map(o => <tr key={o.id}>
          <td>{o.id}</td><td>{businessName(o.businessId)}</td><td>${o.serviceFees}</td><td>${o.stateFees}</td><td>${o.addOns}</td><td><strong>${o.total}</strong></td>
          <td><span className="admin-badge approved">{o.status}</span></td><td>{new Date(o.createdAt).toLocaleDateString()}</td>
        </tr>)}
      </tbody>
    </table></div>
  </div>
}
