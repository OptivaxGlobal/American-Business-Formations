import { ArrowRight, MailCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import SEO from '../components/SEO'

export default function VerifyEmail(){
  const { user, notify } = useApp(); const navigate = useNavigate()
  const confirm = () => { notify('Email verified.'); navigate(user ? '/dashboard' : '/login') }
  return <><SEO title="Verify Email" description="Verify your email address." path="/verify-email" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>One more step</span><h1>Verify your email address.</h1><p>Confirming your email helps keep your account and business documents secure.</p></div><img src="/illustrations/dashboard-preview.svg" alt="Dashboard preview"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/">← Back to website</Link><div className="auth-form"><span>Verify email</span><h2>Check your inbox</h2><div className="reset-sent-icon"><MailCheck/></div><p>We sent a verification link to <strong>{user?.email||'your email address'}</strong>. In this demo, click below to simulate verification — no email is actually sent.</p><button className="btn btn-primary btn-block" onClick={confirm}>I&rsquo;ve verified my email <ArrowRight size={18}/></button><p className="auth-switch">Didn&rsquo;t get it? <button type="button" className="link-button" onClick={()=>notify('Verification email resent (demo).')}>Resend email</button></p></div></div></div></section></>
}
