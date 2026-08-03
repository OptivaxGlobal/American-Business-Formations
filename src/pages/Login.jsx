import { Eye, EyeOff, LockKeyhole, Loader2, Mail } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, withLocalFallback } from '../lib/api'
import { useApp } from '../context/AppContext'
import { validateEmail } from '../validations/contactValidation'
import { validateLoginPassword } from '../validations/authValidation'
import { fieldAria, focusFirstInvalid } from '../lib/formErrors'
import SEO from '../components/SEO'

const FIELD_ORDER = ['email', 'password']

export default function Login(){
  const [show,setShow]=useState(false); const [loading,setLoading]=useState(false)
  const {login,notify}=useApp(); const navigate=useNavigate(); const location=useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const fieldRefs = useRef({})

  const handleChange = (name) => (e) => {
    const next = e.target.value
    setValues(v => ({ ...v, [name]: next }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  const handleBlur = (name) => () => {
    const result = name === 'email' ? validateEmail(values.email, { required: true }) : validateLoginPassword(values.password)
    setErrors(er => ({ ...er, [name]: result.valid ? '' : result.message }))
  }

  const submit=async e=>{
    e.preventDefault()
    const emailResult = validateEmail(values.email, { required: true })
    const passwordResult = validateLoginPassword(values.password)
    const nextErrors = {
      email: emailResult.valid ? '' : emailResult.message,
      password: passwordResult.valid ? '' : passwordResult.message
    }
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) {
      focusFirstInvalid(fieldRefs, nextErrors, FIELD_ORDER)
      return
    }
    setFormError('')
    setLoading(true)
    const isAdmin = new FormData(e.currentTarget).get('is_admin') === 'on'
    const payload = { email: emailResult.normalized, password: values.password }
    try {
      // api.login() resolves to the backend's real envelope { ok, data: {...user} }.
      // The fallback below is shaped to match so both paths hand `login()`
      // the same thing regardless of whether the real backend responded.
      const result = await withLocalFallback(
        () => api.login(payload),
        () => ({ data: { name: payload.email.split('@')[0], email: payload.email, role: isAdmin ? 'admin' : 'customer' } })
      )
      const loggedInUser = result?.data
      if (!loggedInUser) throw new Error('We could not log you in. Please try again.')
      login(loggedInUser)
      notify('Welcome back.')
      navigate(loggedInUser.role === 'admin' ? '/admin' : (location.state?.from || '/dashboard'))
    } catch (err) {
      // Never reveal whether the email or password was the specific problem,
      // and never surface a raw technical error message.
      setFormError(err.status === 401 ? 'The email or password is incorrect.' : (err.status ? err.message : 'We could not log you in. Please try again.'))
    } finally {
      setLoading(false)
    }
  }
  return <><SEO title="Log In" description="Log in to your American Business Formations account." path="/login" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side"><div><span>American Business Formations</span><h1>Your business journey, organized.</h1><p>Sign in to review progress, documents, deadlines, service requests, and recommendations.</p></div><img src="/illustrations/dashboard-preview.svg" alt="Dashboard preview" width="760" height="520"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/">← Back to website</Link><form className="auth-form" onSubmit={submit} noValidate><span>Welcome back</span><h2>Log in to your account</h2><p>Use any valid email and password in the demo.</p>
    {formError && <p className="form-error-summary" role="alert">{formError}</p>}
    <label>Email address<div className="input-icon"><Mail/><input required type="email" name="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={handleChange('email')} onBlur={handleBlur('email')} ref={el=>fieldRefs.current.email=el} {...fieldAria('login-email-error', errors.email)}/></div>
      {errors.email && <p id="login-email-error" className="field-error">{errors.email}</p>}
    </label>
    <label>Password<div className="input-icon"><LockKeyhole/><input required type={show?'text':'password'} name="password" autoComplete="current-password" placeholder="••••••••" value={values.password} onChange={handleChange('password')} onBlur={handleBlur('password')} ref={el=>fieldRefs.current.password=el} {...fieldAria('login-password-error', errors.password)}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff/>:<Eye/>}</button></div>
      {errors.password && <p id="login-password-error" className="field-error">{errors.password}</p>}
    </label>
    <label className="check-control terms-check"><input type="checkbox" name="is_admin"/> Sign in as demo admin (for testing the admin portal only)</label><div className="form-between"><label className="check-control"><input type="checkbox"/> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div><button className="btn btn-primary btn-block" disabled={loading} aria-busy={loading}>{loading&&<Loader2 className="spin" size={18}/>}<span aria-live="polite">{loading?'Signing in...':'Log in'}</span></button><p className="auth-switch">New to ABF? <Link to="/signup">Create an account</Link></p></form></div></div></section></>
}
