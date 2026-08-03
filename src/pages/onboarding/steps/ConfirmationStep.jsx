import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ConfirmationStep({ wizard }) {
  const { user, navigate, confirmedOrder } = wizard
  if (!confirmedOrder) return null

  return (
    <div className="step-panel review-panel confirmation-panel">
      <div className="confirmation-check"><CheckCircle2 /></div>
      <h1>You&rsquo;re all set.</h1>
      <p>Order <strong>{confirmedOrder.id}</strong> has been recorded. Your LLC formation now appears in your dashboard for tracking it has not yet been filed with or approved by the state.</p>
      <div className="review-card">
        <div><small>Order total</small><strong>${confirmedOrder.total}</strong></div>
        <div><small>Status</small><strong>Paid information under review</strong></div>
      </div>
      <div className="onboarding-actions confirmation-actions">
        <button className="btn btn-primary" onClick={() => navigate(user ? '/dashboard' : '/signup')}>Go to my dashboard <ArrowRight /></button>
      </div>
    </div>
  )
}
