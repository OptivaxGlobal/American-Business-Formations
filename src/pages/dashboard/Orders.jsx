import { FileText } from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import { useBusiness } from '../../context/BusinessContext'

export default function Orders(){
  const { orders } = useOrders()
  const { businesses } = useBusiness()
  const businessName = id => businesses.find(b=>b.id===id)?.name || 'Business'

  return <div className="dash-card">
    <div className="dash-card-head"><div><span>Orders</span><h3>Order history</h3></div></div>
    {orders.length===0 && <p className="dash-empty">No orders yet. Orders appear here after you complete the formation checkout.</p>}
    <div className="document-list">
      {orders.slice().reverse().map(order => <div key={order.id}>
        <div className="doc-icon"><FileText/></div>
        <span><strong>{businessName(order.businessId)}</strong><small>Order {order.id} • {new Date(order.createdAt).toLocaleDateString()} • {order.status}</small></span>
        <strong>${order.total}</strong>
      </div>)}
    </div>
  </div>
}
