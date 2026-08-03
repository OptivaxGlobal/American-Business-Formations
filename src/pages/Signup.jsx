import { Eye, EyeOff, LockKeyhole, Loader2, Mail, User } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, withLocalFallback } from '../lib/api'
import { useApp } from '../context/AppContext'
import { validateFullName, validateEmail } from '../validations/contactValidation'
import { validatePassword } from '../validations/authValidation'
import { validateRequiredCheckbox } from '../validations/commonValidation'
import { fieldAria, focusFirstInvalid } from '../lib/formErrors'
import SEO from '../components/SEO'

const FIELD_ORDER = ['name', 'email', 'password', 'terms']

export default function Signup(){
  const [show,setShow]=useState(false);const [loading,setLoading]=useState(false);const {login,notify}=useApp();const navigate=useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const fieldRefs = useRef({})

  const validateField = (name, value) => {
    if (name === 'name') return validateFullName(value, { required: true })
    if (name === 'email') return validateEmail(value, { required: true })
    if (name === 'password') return validatePassword(value, { required: true })
    if (name === 'terms') return validateRequiredCheckbox(value)
    return { valid: true, message: '' }
  }

  const handleChange = (name) => (e) => {
    const next = e.target.value
    setValues(v => ({ ...v, [name]: next }))
    if (errors[name]) {
      const result = validateField(name, next)
      setErrors(er => ({ ...er, [name]: result.valid ? '' : result.message }))
    }
  }

  const handleBlur = (name) => () => {
    const result = validateField(name, values[name])
    setErrors(er => ({ ...er, [name]: result.valid ? '' : result.message }))
  }

  const submit=async e=>{
    e.preventDefault()
    const nextErrors = {}
    FIELD_ORDER.forEach(name => {
      const value = name === 'terms' ? terms : values[name]
      const result = validateField(name, value)
      if (!result.valid) nextErrors[name] = result.message
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      focusFirstInvalid(fieldRefs, nextErrors, FIELD_ORDER)
      return
    }
    setFormError('')
    setLoading(true)
    const isAdmin = new FormData(e.currentTarget).get('is_admin') === 'on'
    const role = isAdmin ? 'admin' : 'customer'
    const emailResult = validateEmail(values.email, { required: true })
    const payload = { name: values.name.trim(), email: emailResult.normalized, password: values.password, marketing_consent: false }
    try {
      // api.signup() resolves to the backend's real envelope { ok, data: {...user} }
      // (the real endpoint always creates role: "customer" — there is no public
      // way to self-signup as admin). The fallback below matches that shape so
      // both paths hand `login()` the same thing.
      const result = await withLocalFallback(
        () => api.signup(payload),
        () => ({ data: { name: payload.name, email: payload.email, role } })
      )
      const loggedInUser = result?.data
      if (!loggedInUser) throw new Error('We could not create your account. Please try again.')
      login(loggedInUser)
      notify('Account created successfully.')
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/start')
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) setErrors(er => ({ ...er, ...err.fieldErrors }))
      // Never surface a raw technical error message only a real backend
      // message (ApiError) or the generic fallback below.
      setFormError(err.status ? err.message : 'We could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return <><SEO title="Create Account" description="Create your American Business Formations account." path="/signup" noindex /><section className="auth-page"><div className="auth-shell"><div className="auth-side signup-side"><div><span>Build with confidence</span><h1>Create one account for every business step.</h1><p>Save onboarding progress, store service requests, and return to your dashboard at any time.</p></div><img src="/illustrations/hero-business.svg" alt="Business formation illustration" width="720" height="560"/></div><div className="auth-form-wrap"><Link className="auth-back" to="/">← Back to website</Link><form className="auth-form" onSubmit={submit} noValidate><span>Get started</span><h2>Create your account</h2><p>This demo stores your session locally when Flask is not running.</p>
    {formError && <p className="form-error-summary" role="alert">{formError}</p>}
    <label>Full name<div className="input-icon"><User/><input required name="name" autoComplete="name" placeholder="Your full name" value={values.name} onChange={handleChange('name')} onBlur={handleBlur('name')} ref={el=>fieldRefs.current.name=el} {...fieldAria('signup-name-error', errors.name)}/></div>
      {errors.name && <p id="signup-name-error" className="field-error">{errors.name}</p>}
    </label>
    <label>Email address<div className="input-icon"><Mail/><input required type="email" name="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={handleChange('email')} onBlur={handleBlur('email')} ref={el=>fieldRefs.current.email=el} {...fieldAria('signup-email-error', errors.email)}/></div>
      {errors.email && <p id="signup-email-error" className="field-error">{errors.email}</p>}
    </label>
    <label>Password<div className="input-icon"><LockKeyhole/><input required type={show?'text':'password'} name="password" autoComplete="new-password" placeholder="At least 8 characters" value={values.password} onChange={handleChange('password')} onBlur={handleBlur('password')} ref={el=>fieldRefs.current.password=el} {...fieldAria('signup-password-error', errors.password)}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff/>:<Eye/>}</button></div>
      {errors.password ? <p id="signup-password-error" className="field-error">{errors.password}</p> : <small>Use at least 8 characters, including uppercase, lowercase, a number, and a special character.</small>}
    </label>
    <label className="check-control terms-check"><input required type="checkbox" checked={terms} onChange={e=>{setTerms(e.target.checked); if(errors.terms) setErrors(er=>({...er,terms:''}))}} ref={el=>fieldRefs.current.terms=el} {...fieldAria('signup-terms-error', errors.terms)}/> I agree to the Terms, Privacy Policy, and service disclaimer.</label>
    {errors.terms && <p id="signup-terms-error" className="field-error">{errors.terms}</p>}
    <label className="check-control terms-check"><input type="checkbox" name="is_admin"/> This is a demo admin account (for testing the admin portal only)</label><button className="btn btn-primary btn-block" disabled={loading} aria-busy={loading}>{loading&&<Loader2 className="spin" size={18}/>}<span aria-live="polite">{loading?'Creating account...':'Create account'}</span></button><p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p></form></div></div></section></>
}
