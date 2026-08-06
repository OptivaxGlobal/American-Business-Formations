import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOrders } from '../../context/OrdersContext'
import { useBusiness } from '../../context/BusinessContext'
import EmptyState from '../../components/ui/EmptyState'
import AsyncState from '../../components/dashboard/AsyncState'

const STATUS_LABELS = {
  draft: 'Draft', pending: 'Processing', awaiting_payment: 'Awaiting payment',
  paid: 'Paid', failed: 'Failed', refunded: 'Refunded', cancelled: 'Cancelled',
}

export default function Orders(){
  const { orders, loading, error, refetch } = useOrders()
  const { businesses } = useBusiness()
  const businessName = id => businesses.find(b=>b.id===id)?.name || 'Business'

  return <div className="dash-card">
    <div className="dash-card-head"><div><span>Orders</span><h3>Order history</h3></div></div>
    <AsyncState loading={loading} error={error} onRetry={refetch} loadingLabel="Loading your orders…">
      {orders.length===0 && <EmptyState icon={FileText}>No orders yet. Orders appear here after you complete the formation checkout. <Link to="/start">Start a business</Link>.</EmptyState>}
      <div className="document-list">
        {orders.map(order => <div key={order.id}>
          <div className="doc-icon"><FileText/></div>
          <span><strong>{businessName(order.business_id)}</strong><small>Order {order.order_number} • {new Date(order.created_at).toLocaleDateString()} • {STATUS_LABELS[order.status] || order.status}</small></span>
          <strong>${(order.total_cents / 100).toFixed(2)}</strong>
        </div>)}
      </div>
    </AsyncState>
  </div>
}
