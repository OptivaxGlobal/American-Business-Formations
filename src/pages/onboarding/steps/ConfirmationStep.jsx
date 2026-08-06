import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'

const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Processing',
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
  cancelled: 'Cancelled'
}

function centsToDollars(cents) {
  return ((cents || 0) / 100).toFixed(2)
}

export default function ConfirmationStep({ wizard }) {
  const { user, navigate, confirmedOrder, confirmationError } = wizard

  if (confirmationError) {
    return (
      <div className="step-panel review-panel confirmation-panel">
        <div className="confirmation-check error"><XCircle /></div>
        <h1>We couldn&rsquo;t load your order.</h1>
        <p>{confirmationError}</p>
        <div className="onboarding-actions confirmation-actions">
          <button className="btn btn-primary" onClick={() => navigate(user ? '/dashboard' : '/contact')}>{user ? 'Go to my dashboard' : 'Contact support'} <ArrowRight /></button>
        </div>
      </div>
    )
  }

  if (!confirmedOrder) return null

  const statusLabel = STATUS_LABELS[confirmedOrder.status] || confirmedOrder.status

  return (
    <div className="step-panel review-panel confirmation-panel">
      <div className="confirmation-check"><CheckCircle2 /></div>
      <h1>Your formation order has been received.</h1>
      <p>Online payment is temporarily unavailable. Our team will contact you with the secure payment and next-step details.</p>
      <div className="review-card">
        <div><small>Order number</small><strong>{confirmedOrder.order_number}</strong></div>
        <div><small>Status</small><strong>{statusLabel}</strong></div>
      </div>
      <div className="order-breakdown">
        {(confirmedOrder.items || []).map((item, i) => <div key={`${item.type}-${i}`}><span>{item.name}</span><strong>${centsToDollars(item.price_cents)}</strong></div>)}
        <div className="order-total"><span>Order total</span><strong>${centsToDollars(confirmedOrder.total_cents)}</strong></div>
      </div>
      <p className="onboarding-note">No payment has been collected, and your Certificate of Formation has not yet been filed with the state. This page reflects the current status directly from our system it will update as your order progresses.</p>
      <div className="onboarding-actions confirmation-actions">
        <button className="btn btn-primary" onClick={() => navigate(user ? '/dashboard' : '/signup')}>Go to my dashboard <ArrowRight /></button>
      </div>
    </div>
  )
}
