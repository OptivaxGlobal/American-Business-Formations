import { ArrowRight, Mail, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function ForgotPassword(){
  const [email,setEmail]=useState(''); const [sent,setSent]=useState(false)
  const submit = e => { e.preventDefault(); setSent(true) }
  return <><SEO title="Forgot Password" description="Reset your American Business Formations password." path="/forgot-password" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>Account recovery</span><h1>We&rsquo;ll help you back in.</h1><p>Enter the email on your account and we&rsquo;ll send a reset link.</p></div><img src="/illustrations/dashboard-preview.svg" alt="Dashboard preview"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/login">← Back to log in</Link>{!sent ? <form className="auth-form" onSubmit={submit}><span>Forgot password</span><h2>Reset your password</h2><p>We&rsquo;ll send a reset link to your email. In this demo, no email is actually sent.</p><label>Email address<div className="input-icon"><Mail/><input required type="email" name="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div></label><button className="btn btn-primary btn-block">Send reset link <ArrowRight size={18}/></button><p className="auth-switch">Remembered it? <Link to="/login">Log in</Link></p></form> : <div className="auth-form"><span>Check your email</span><h2>Reset link sent</h2><div className="reset-sent-icon"><MailCheck/></div><p>If an account exists for <strong>{email}</strong>, a password reset link has been sent (demo only — nothing was actually emailed).</p><Link className="btn btn-primary btn-block" to="/reset-password">Continue to reset password</Link></div>}</div></div></section></>
}
