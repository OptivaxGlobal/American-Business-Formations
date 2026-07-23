import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import SEO from '../components/SEO'

export default function ResetPassword(){
  const [show,setShow]=useState(false); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState('')
  const { notify } = useApp(); const navigate = useNavigate()
  const mismatch = confirm.length>0 && password!==confirm
  const submit = e => { e.preventDefault(); if (mismatch || password.length<6) return; notify('Password updated. Please log in.'); navigate('/login') }
  return <><SEO title="Reset Password" description="Choose a new password for your account." path="/reset-password" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>Account recovery</span><h1>Choose a new password.</h1><p>Use at least 6 characters. This demo does not store or validate against a real account.</p></div><img src="/illustrations/hero-business.svg" alt="Business illustration"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/login">← Back to log in</Link><form className="auth-form" onSubmit={submit}><span>Reset password</span><h2>Create a new password</h2><label>New password<div className="input-icon"><LockKeyhole/><input required minLength="6" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff/>:<Eye/>}</button></div></label><label>Confirm new password<div className="input-icon"><LockKeyhole/><input required type={show?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password"/></div></label>{mismatch && <p className="field-error">Passwords do not match.</p>}<button className="btn btn-primary btn-block">Update password <ArrowRight size={18}/></button></form></div></div></section></>
}
