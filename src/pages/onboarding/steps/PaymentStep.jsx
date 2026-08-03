import { CreditCard, ShieldCheck } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function PaymentStep({ wizard }) {
  const { payment, paymentErrors, handlePaymentChange, markPaymentTouched, loading, fieldRefs } = wizard

  return (
    <div className="step-panel review-panel">
      <CreditCard className="step-icon" /><span>Payment</span>
      <h1>Secure checkout</h1>
      <p>This is a demo checkout. No real payment provider is connected and no card data is stored or transmitted.</p>
      <div className="mock-payment-form">
        <label>Name on card
          <input value={payment.cardName} onChange={e => handlePaymentChange('cardName', e.target.value)} onBlur={() => markPaymentTouched('cardName')} placeholder="Jordan Lee" autoComplete="cc-name" disabled={loading} ref={el => fieldRefs.current.cardName = el} {...fieldAria('cardName-error', paymentErrors.cardName)} />
          {paymentErrors.cardName && <p id="cardName-error" className="field-error">{paymentErrors.cardName}</p>}
        </label>
        <label>Card number
          <input value={payment.cardNumber} onChange={e => handlePaymentChange('cardNumber', e.target.value)} onBlur={() => markPaymentTouched('cardNumber')} placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" disabled={loading} ref={el => fieldRefs.current.cardNumber = el} {...fieldAria('cardNumber-error', paymentErrors.cardNumber)} />
          {paymentErrors.cardNumber && <p id="cardNumber-error" className="field-error">{paymentErrors.cardNumber}</p>}
        </label>
        <div className="form-grid">
          <label>Expiration
            <input value={payment.cardExpiry} onChange={e => handlePaymentChange('cardExpiry', e.target.value)} onBlur={() => markPaymentTouched('cardExpiry')} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" disabled={loading} ref={el => fieldRefs.current.cardExpiry = el} {...fieldAria('cardExpiry-error', paymentErrors.cardExpiry)} />
            {paymentErrors.cardExpiry && <p id="cardExpiry-error" className="field-error">{paymentErrors.cardExpiry}</p>}
          </label>
          <label>CVC
            <input value={payment.cardCvc} onChange={e => handlePaymentChange('cardCvc', e.target.value)} onBlur={() => markPaymentTouched('cardCvc')} placeholder="123" inputMode="numeric" autoComplete="cc-csc" disabled={loading} ref={el => fieldRefs.current.cardCvc = el} {...fieldAria('cardCvc-error', paymentErrors.cardCvc)} />
            {paymentErrors.cardCvc && <p id="cardCvc-error" className="field-error">{paymentErrors.cardCvc}</p>}
          </label>
        </div>
        <p className="onboarding-note"><ShieldCheck size={15} /> A production build uses hosted Stripe fields here so card data never touches this app&rsquo;s servers, and your order is only marked paid after Stripe confirms the charge server-side.</p>
      </div>
    </div>
  )
}
