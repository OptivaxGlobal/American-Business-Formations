import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useApp } from '../context/AppContext'
import { validatePassword, validatePasswordConfirmation } from '../validations/authValidation'
import { fieldAria } from '../lib/formErrors'
import SEO from '../components/SEO'

export default function ResetPassword(){
  const [show,setShow]=useState(false); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState('')
  const [errors,setErrors]=useState({}); const [formError,setFormError]=useState(''); const [loading,setLoading]=useState(false)
  const { notify } = useApp(); const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const submit = async e => {
    e.preventDefault()
    const passwordResult = validatePassword(password, { required: true })
    const confirmResult = validatePasswordConfirmation(password, confirm)
    const nextErrors = {
      password: passwordResult.valid ? '' : passwordResult.message,
      confirm: confirmResult.valid ? '' : confirmResult.message
    }
    setErrors(nextErrors)
    if (nextErrors.password || nextErrors.confirm) return
    setFormError('')
    setLoading(true)
    try {
      await api.resetPassword(token, password)
      notify('Password updated. Please log in.')
      navigate('/login')
    } catch (err) {
      setFormError(err.message || 'This reset link is invalid or has expired.')
    } finally {
      setLoading(false)
    }
  }
  return <><SEO title="Reset Password" description="Choose a new password for your account." path="/reset-password" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>Account recovery</span><h1>Choose a new password.</h1><p>Use at least 8 characters, including uppercase, lowercase, a number, and a special character.</p></div><img src="/illustrations/hero-business.svg" alt="Business illustration" width="720" height="560"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/login">← Back to log in</Link><form className="auth-form" onSubmit={submit} noValidate><span>Reset password</span><h2>Create a new password</h2>
    {formError && <p className="form-error-summary" role="alert">{formError}</p>}
    <label>New password<div className="input-icon"><LockKeyhole/><input required type={show?'text':'password'} autoComplete="new-password" value={password} onChange={e=>{setPassword(e.target.value); if(errors.password) setErrors(er=>({...er,password:''}))}} onBlur={()=>{const r=validatePassword(password,{required:true}); setErrors(er=>({...er,password:r.valid?'':r.message}))}} placeholder="At least 8 characters" {...fieldAria('reset-password-error', errors.password)}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff/>:<Eye/>}</button></div>
      {errors.password && <p id="reset-password-error" className="field-error">{errors.password}</p>}
    </label>
    <label>Confirm new password<div className="input-icon"><LockKeyhole/><input required type={show?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>{setConfirm(e.target.value); if(errors.confirm) setErrors(er=>({...er,confirm:''}))}} onBlur={()=>{const r=validatePasswordConfirmation(password,confirm); setErrors(er=>({...er,confirm:r.valid?'':r.message}))}} placeholder="Re-enter password" {...fieldAria('reset-confirm-error', errors.confirm)}/></div>
      {errors.confirm && <p id="reset-confirm-error" className="field-error">{errors.confirm}</p>}
    </label>
    <button className="btn btn-primary btn-block" disabled={loading} aria-busy={loading}><span aria-live="polite">{loading?'Updating...':'Update password'}</span> <ArrowRight size={18}/></button></form></div></div></section></>
}
