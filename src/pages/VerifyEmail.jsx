import { ArrowRight, Loader2, MailCheck, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useApp } from '../context/AppContext'
import SEO from '../components/SEO'

export default function VerifyEmail(){
  const { user, notify } = useApp(); const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState(token ? 'verifying' : 'awaiting')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    api.verifyEmail(token)
      .then(() => { if (!cancelled) setStatus('verified') })
      .catch(err => { if (!cancelled) { setStatus('error'); setError(err.message || 'This verification link is invalid or has expired.') } })
    return () => { cancelled = true }
  }, [token])

  const confirm = () => { notify('Email verified.'); navigate(user ? '/dashboard' : '/login') }

  return <><SEO title="Verify Email" description="Verify your email address." path="/verify-email" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>One more step</span><h1>Verify your email address.</h1><p>Confirming your email helps keep your account and business documents secure.</p></div><img src="/illustrations/dashboard-preview.svg" alt="Dashboard preview" width="760" height="520"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/">← Back to website</Link><div className="auth-form">
    {status === 'verifying' && <><span>Verify email</span><h2>Checking your link...</h2><div className="reset-sent-icon"><Loader2 className="spin"/></div><p>Please wait while we confirm your email address.</p></>}
    {status === 'verified' && <><span>Verify email</span><h2>Email verified</h2><div className="reset-sent-icon"><MailCheck/></div><p>Your email address has been confirmed.</p><button className="btn btn-primary btn-block" onClick={confirm}>Continue <ArrowRight size={18}/></button></>}
    {status === 'error' && <><span>Verify email</span><h2>Verification failed</h2><div className="reset-sent-icon"><XCircle/></div><p className="form-error-summary" role="alert">{error}</p><Link className="btn btn-primary btn-block" to="/login">Back to log in</Link></>}
    {status === 'awaiting' && <><span>Verify email</span><h2>Check your inbox</h2><div className="reset-sent-icon"><MailCheck/></div><p>We sent a verification link to <strong>{user?.email||'your email address'}</strong>. Click the link in that email to verify your account.</p><p className="auth-switch">Didn&rsquo;t get it? <button type="button" className="link-button" onClick={()=>notify('If your account needs verification, check your inbox for the link we sent.')}>Resend email</button></p></>}
  </div></div></div></section></>
}
