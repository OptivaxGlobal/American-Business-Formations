import { ArrowRight, Mail, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, withLocalFallback } from '../lib/api'
import { validateEmail } from '../validations/contactValidation'
import { fieldAria } from '../lib/formErrors'
import SEO from '../components/SEO'

export default function ForgotPassword(){
  const [email,setEmail]=useState(''); const [sent,setSent]=useState(false)
  const [error,setError]=useState(''); const [formError,setFormError]=useState(''); const [loading,setLoading]=useState(false)

  const submit = async e => {
    e.preventDefault()
    const result = validateEmail(email, { required: true })
    if (!result.valid) { setError(result.message); return }
    setError(''); setFormError(''); setLoading(true)
    try {
      await withLocalFallback(() => api.forgotPassword(result.normalized), () => ({ ok: true }))
      setSent(true)
    } catch (err) {
      setFormError(err.message || 'We could not send a reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <><SEO title="Forgot Password" description="Reset your American Business Formations password." path="/forgot-password" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>Account recovery</span><h1>We&rsquo;ll help you back in.</h1><p>Enter the email on your account and we&rsquo;ll send a reset link.</p></div><img src="/illustrations/dashboard-preview.svg" alt="Dashboard preview"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/login">← Back to log in</Link>{!sent ? <form className="auth-form" onSubmit={submit} noValidate><span>Forgot password</span><h2>Reset your password</h2><p>We&rsquo;ll send a reset link to your email.</p>
    {formError && <p className="form-error-summary" role="alert">{formError}</p>}
    <label>Email address<div className="input-icon"><Mail/><input required type="email" autoComplete="email" value={email} onChange={e=>{setEmail(e.target.value); if(error) setError('')}} onBlur={()=>{const r=validateEmail(email,{required:true}); setError(r.valid?'':r.message)}} placeholder="you@example.com" {...fieldAria('forgot-email-error', error)}/></div>
      {error && <p id="forgot-email-error" className="field-error">{error}</p>}
    </label>
    <button className="btn btn-primary btn-block" disabled={loading}>{loading?'Sending...':'Send reset link'} <ArrowRight size={18}/></button><p className="auth-switch">Remembered it? <Link to="/login">Log in</Link></p></form> : <div className="auth-form"><span>Check your email</span><h2>Reset link sent</h2><div className="reset-sent-icon"><MailCheck/></div><p>If an account exists for <strong>{email}</strong>, a password reset link has been sent.</p><Link className="btn btn-primary btn-block" to="/login">Back to log in</Link></div>}</div></div></section></>
}
