import { CreditCard, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOrders } from '../../context/OrdersContext'
import EmptyState from '../../components/ui/EmptyState'
import AsyncState from '../../components/dashboard/AsyncState'

export default function Billing(){
  const { orders, loading, error, refetch } = useOrders()
  const plans = orders.filter(o => (o.items || []).some(i => i.type === 'plan'))

  return <div className="dash-card">
    <div className="dash-card-head"><div><span>Billing</span><h3>Subscriptions & payment method</h3></div></div>
    <AsyncState loading={loading} error={error} onRetry={refetch} loadingLabel="Loading your billing history…">
      {plans.length===0 && <EmptyState icon={CreditCard}>No active subscriptions yet. <Link to="/pricing">Compare plans</Link> to get started.</EmptyState>}
      <div className="document-list">
        {plans.map(order => {
          const plan = order.items.find(i=>i.type==='plan')
          return <div key={order.id}>
            <div className="doc-icon"><CreditCard/></div>
            <span><strong>{plan?.name}</strong><small>${(order.total_cents / 100).toFixed(2)} • {order.status === 'paid' ? 'Paid' : 'Awaiting payment'} • Started {new Date(order.created_at).toLocaleDateString()}</small></span>
          </div>
        })}
      </div>
    </AsyncState>
    <p className="onboarding-note"><ShieldCheck size={15}/> Online payment is temporarily unavailable. Our team will contact you directly to arrange secure payment for any order awaiting payment above.</p>
  </div>
}
