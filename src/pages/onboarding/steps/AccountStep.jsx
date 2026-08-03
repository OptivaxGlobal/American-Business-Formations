import { Sparkles } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function AccountStep({ wizard }) {
  const { user, form, set, errors, handleFieldChange, markTouched, fieldRefs } = wizard

  return (
    <div className="step-panel review-panel">
      <Sparkles className="step-icon" /><span>Account</span>
      <h1>{user ? 'You’re signed in' : 'Create your account'}</h1>
      {user ? <p>Continuing as {user.email}. Your formation will be saved to your dashboard.</p> : <>
        <p>Create an account to save your progress, track filing status, and access your documents.</p>
        <label>Email
          <input type="email" value={form.accountEmail} onChange={e => handleFieldChange('accountEmail', e.target.value)} onBlur={() => markTouched('accountEmail')} placeholder="you@example.com" autoComplete="email" ref={el => fieldRefs.current.accountEmail = el} {...fieldAria('accountEmail-error', errors.accountEmail)} />
          {errors.accountEmail && <p id="accountEmail-error" className="field-error">{errors.accountEmail}</p>}
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={e => handleFieldChange('password', e.target.value)} onBlur={() => markTouched('password')} placeholder="At least 8 characters" autoComplete="new-password" ref={el => fieldRefs.current.password = el} {...fieldAria('onboarding-password-error', errors.password)} />
          {errors.password ? <p id="onboarding-password-error" className="field-error">{errors.password}</p> : <small>Use at least 8 characters, including uppercase, lowercase, a number, and a special character.</small>}
        </label>
        <label>Confirm password
          <input type="password" value={form.confirmPassword} onChange={e => handleFieldChange('confirmPassword', e.target.value)} onBlur={() => markTouched('confirmPassword')} placeholder="Re-enter your password" autoComplete="new-password" ref={el => fieldRefs.current.confirmPassword = el} {...fieldAria('confirmPassword-error', errors.confirmPassword)} />
          {errors.confirmPassword && <p id="confirmPassword-error" className="field-error">{errors.confirmPassword}</p>}
        </label>
        <label className="check-control terms-check">
          <input type="checkbox" checked={form.termsAccepted} onChange={e => handleFieldChange('termsAccepted', e.target.checked)} ref={el => fieldRefs.current.termsAccepted = el} {...fieldAria('termsAccepted-error', errors.termsAccepted)} /> I agree to the Terms of Service and Privacy Policy
        </label>
        {errors.termsAccepted && <p id="termsAccepted-error" className="field-error">{errors.termsAccepted}</p>}
        <label className="check-control"><input type="checkbox" checked={form.marketingConsent} onChange={e => set('marketingConsent', e.target.checked)} /> Send me occasional product and compliance tips (optional)</label>
      </>}
    </div>
  )
}
