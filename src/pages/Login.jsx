import { Eye, EyeOff, LockKeyhole, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, withLocalFallback } from '../lib/api'
import { useApp } from '../context/AppContext'

export default function Login(){
  const [show,setShow]=useState(false); const [loading,setLoading]=useState(false)
  const {login,notify}=useApp(); const navigate=useNavigate(); const location=useLocation()
  const submit=async e=>{e.preventDefault();setLoading(true);const payload=Object.fromEntries(new FormData(e.currentTarget));const result=await withLocalFallback(()=>api.login(payload),()=>({user:{name:payload.email.split('@')[0],email:payload.email}}));login(result.user);notify('Welcome back.');setLoading(false);navigate(location.state?.from||'/studio')}
  return <section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>American Business Formations</span><h1>Your business journey, organized.</h1><p>Sign in to review progress, documents, deadlines, service requests, and recommendations.</p></div><img src="/illustrations/dashboard-preview.svg" alt="Dashboard preview"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/">← Back to website</Link><form className="auth-form" onSubmit={submit}><span>Welcome back</span><h2>Log in to your account</h2><p>Use any valid email and password in the demo.</p><label>Email address<div className="input-icon"><Mail/><input required type="email" name="email" placeholder="you@example.com"/></div></label><label>Password<div className="input-icon"><LockKeyhole/><input required type={show?'text':'password'} name="password" placeholder="••••••••"/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff/>:<Eye/>}</button></div></label><div className="form-between"><label className="check-control"><input type="checkbox"/> Remember me</label><a href="#">Forgot password?</a></div><button className="btn btn-primary btn-block" disabled={loading}>{loading&&<Loader2 className="spin" size={18}/>}{loading?'Signing in...':'Log in'}</button><p className="auth-switch">New to ABF? <Link to="/signup">Create an account</Link></p></form></div></div></section>
}
