import { CreditCard, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOrders } from '../../context/OrdersContext'
import EmptyState from '../../components/ui/EmptyState'

export default function Billing(){
  const { orders } = useOrders()
  const plans = orders.filter(o => o.items.some(i => i.type === 'plan'))

  return <div className="dash-card">
    <div className="dash-card-head"><div><span>Billing</span><h3>Subscriptions & payment method</h3></div></div>
    {plans.length===0 && <EmptyState icon={CreditCard}>No active subscriptions yet. <Link to="/pricing">Compare plans</Link> to get started.</EmptyState>}
    <div className="document-list">
      {plans.map(order => {
        const plan = order.items.find(i=>i.type==='plan')
        return <div key={order.id}><div className="doc-icon"><CreditCard/></div><span><strong>{plan?.name}</strong><small>${order.total} • Started {new Date(order.createdAt).toLocaleDateString()}</small></span><button className="btn btn-outline">Manage</button></div>
      })}
    </div>
    <p className="onboarding-note"><ShieldCheck size={15}/> No real payment processor is connected. A production build would show your saved card and next billing date from Stripe here.</p>
  </div>
}
