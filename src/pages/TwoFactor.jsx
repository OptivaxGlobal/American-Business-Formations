import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fieldAria } from '../lib/formErrors'
import SEO from '../components/SEO'

export default function TwoFactor(){
  const [code,setCode]=useState(''); const [error,setError]=useState(''); const { user, notify } = useApp(); const navigate = useNavigate()
  const submit = e => {
    e.preventDefault()
    if (code.length !== 6) { setError('Enter the 6-digit code from your authenticator app.'); return }
    setError('')
    notify('Two-factor verification successful.')
    navigate(user?.role==='admin' ? '/admin' : '/dashboard')
  }
  return <><SEO title="Two-Factor Verification" description="Confirm your identity with a verification code." path="/two-factor" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>Extra security</span><h1>Enter your verification code.</h1><p>Two-factor authentication adds an extra layer of protection to your account.</p></div><img src="/illustrations/hero-business.svg" alt="Security illustration" width="720" height="560"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/login">← Back to log in</Link><form className="auth-form" onSubmit={submit} noValidate><span>Two-factor authentication</span><h2>Enter your 6-digit code</h2><p>Enter the code from your authenticator app. Any 6-digit code works in this demo.</p><label>Verification code<div className="input-icon"><ShieldCheck/><input required maxLength={6} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,'')); if(error) setError('')}} placeholder="123456" {...fieldAria('twofactor-code-error', error)}/></div>
    {error && <p id="twofactor-code-error" className="field-error">{error}</p>}
  </label><button className="btn btn-primary btn-block" disabled={code.length!==6}>Verify <ArrowRight size={18}/></button><p className="auth-switch">Lost access to your device? <Link to="/contact">Contact support</Link></p></form></div></div></section></>
}
