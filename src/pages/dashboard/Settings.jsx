import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { validateFullName, validateEmail, validatePhone } from '../../validations/contactValidation'
import { validatePassword, validatePasswordConfirmation } from '../../validations/authValidation'
import { fieldAria, focusFirstInvalid } from '../../lib/formErrors'

export default function Settings(){
  const { user, login, notify } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [emailReminders, setEmailReminders] = useState(user?.email_reminders_enabled ?? true)
  const [smsReminders, setSmsReminders] = useState(user?.sms_reminders_enabled ?? false)
  const [marketingConsent, setMarketingConsent] = useState(user?.marketing_consent ?? false)
  const [errors, setErrors] = useState({})
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | failed
  const fieldRefs = useRef({})

  const [emailValue, setEmailValue] = useState(user?.email || '')
  const [emailError, setEmailError] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle') // idle | saving | pending | failed

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordStatus, setPasswordStatus] = useState('idle') // idle | saving | saved | failed
  const [passwordFormError, setPasswordFormError] = useState('')

  // `user` loads asynchronously (AppContext resolves /auth/me after mount),
  // so the fields above are empty on first render. Sync them in once the
  // real account data arrives keyed on user.id so a later re-render from
  // this page's own login(result.data) call doesn't clobber in-progress edits.
  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setPhone(user.phone || '')
    setEmailReminders(user.email_reminders_enabled ?? true)
    setSmsReminders(user.sms_reminders_enabled ?? false)
    setMarketingConsent(user.marketing_consent ?? false)
    setEmailValue(user.email || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const saveProfile = async e => {
    e.preventDefault()
    const nameResult = validateFullName(name, { required: true })
    const phoneResult = phone ? validatePhone(phone, { required: false }) : { valid: true }
    const nextErrors = {
      name: nameResult.valid ? '' : nameResult.message,
      phone: phoneResult.valid ? '' : phoneResult.message,
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.phone) {
      focusFirstInvalid(fieldRefs, nextErrors, ['name', 'phone'])
      return
    }
    setSaveStatus('saving')
    try {
      const result = await api.updateProfile({
        name: nameResult.normalized, phone: phone || null,
        email_reminders_enabled: emailReminders, sms_reminders_enabled: smsReminders, marketing_consent: marketingConsent,
      })
      login(result.data)
      setSaveStatus('saved')
      notify('Settings saved.')
    } catch (err) {
      setSaveStatus('failed')
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) setErrors(er => ({ ...er, ...err.fieldErrors }))
      notify(err.message || 'We could not save your changes. Please try again.', 'error')
    }
  }

  const saveEmail = async e => {
    e.preventDefault()
    const result = validateEmail(emailValue, { required: true })
    if (!result.valid) { setEmailError(result.message); return }
    setEmailError('')
    setEmailStatus('saving')
    try {
      const res = await api.updateEmail(result.normalized)
      login({ ...user, pending_email: res.data.pending_email })
      setEmailStatus('pending')
    } catch (err) {
      setEmailStatus('failed')
      setEmailError(err.fieldErrors?.email || err.message || 'We could not update your email. Please try again.')
    }
  }

  const savePassword = async e => {
    e.preventDefault()
    const newResult = validatePassword(newPassword, { required: true })
    const confirmResult = validatePasswordConfirmation(newPassword, confirmPassword)
    const nextErrors = {
      new_password: newResult.valid ? '' : newResult.message,
      confirm_password: confirmResult.valid ? '' : confirmResult.message,
    }
    setPasswordErrors(nextErrors)
    setPasswordFormError('')
    if (nextErrors.new_password || nextErrors.confirm_password) return
    setPasswordStatus('saving')
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordStatus('saved')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      notify('Password updated.')
    } catch (err) {
      setPasswordStatus('failed')
      setPasswordFormError(err.message || 'We could not update your password. Please try again.')
    }
  }

  return <div className="dash-grid">
    <div className="dash-card">
      <div className="dash-card-head"><div><span>Account</span><h3>Profile settings</h3></div></div>
      <form className="contact-form" onSubmit={saveProfile} noValidate>
        <label>Full name<input value={name} onChange={e=>{setName(e.target.value); if(errors.name) setErrors(er=>({...er,name:''}))}} autoComplete="name" ref={el=>fieldRefs.current.name=el} {...fieldAria('settings-name-error', errors.name)}/>
          {errors.name && <p id="settings-name-error" className="field-error">{errors.name}</p>}
        </label>
        <label>Phone (optional)<input type="tel" value={phone} onChange={e=>{setPhone(e.target.value); if(errors.phone) setErrors(er=>({...er,phone:''}))}} autoComplete="tel" ref={el=>fieldRefs.current.phone=el} {...fieldAria('settings-phone-error', errors.phone)}/>
          {errors.phone && <p id="settings-phone-error" className="field-error">{errors.phone}</p>}
        </label>
        <label className="check-control terms-check"><input type="checkbox" checked={emailReminders} onChange={e=>setEmailReminders(e.target.checked)}/> Email reminders for compliance deadlines</label>
        <label className="check-control terms-check"><input type="checkbox" checked={smsReminders} onChange={e=>setSmsReminders(e.target.checked)}/> SMS reminders (requires a phone number)</label>
        <label className="check-control terms-check"><input type="checkbox" checked={marketingConsent} onChange={e=>setMarketingConsent(e.target.checked)}/> Product and service updates</label>
        <button className="btn btn-primary" disabled={saveStatus==='saving'} aria-busy={saveStatus==='saving'}>
          <span aria-live="polite">{saveStatus==='saving' ? 'Saving…' : saveStatus==='saved' ? 'Saved' : 'Save changes'}</span>
        </button>
      </form>
    </div>

    <div className="dash-card">
      <div className="dash-card-head"><div><span>Email address</span><h3>{user?.email}</h3></div></div>
      {user?.pending_email && <p className="onboarding-note">Confirmation sent to <strong>{user.pending_email}</strong> check that inbox to finish changing your email.</p>}
      <form className="contact-form" onSubmit={saveEmail} noValidate>
        <label>New email address<input type="email" value={emailValue} onChange={e=>{setEmailValue(e.target.value); if(emailError) setEmailError('')}} {...fieldAria('settings-email-error', emailError)}/>
          {emailError && <p id="settings-email-error" className="field-error">{emailError}</p>}
        </label>
        <button className="btn btn-outline" disabled={emailStatus==='saving'} aria-busy={emailStatus==='saving'}>
          <span aria-live="polite">{emailStatus==='saving' ? 'Sending confirmation…' : 'Update email'}</span>
        </button>
        {emailStatus==='pending' && <p role="status">We&rsquo;ve sent a confirmation link to your new address. Your email won&rsquo;t change until you click it.</p>}
      </form>
    </div>

    <div className="dash-card">
      <div className="dash-card-head"><div><span>Security</span><h3>Change password</h3></div></div>
      <form className="contact-form" onSubmit={savePassword} noValidate>
        {passwordFormError && <p className="form-error-summary" role="alert">{passwordFormError}</p>}
        <label>Current password<input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} autoComplete="current-password"/></label>
        <label>New password<input type="password" value={newPassword} onChange={e=>{setNewPassword(e.target.value); if(passwordErrors.new_password) setPasswordErrors(er=>({...er,new_password:''}))}} autoComplete="new-password" {...fieldAria('settings-new-password-error', passwordErrors.new_password)}/>
          {passwordErrors.new_password && <p id="settings-new-password-error" className="field-error">{passwordErrors.new_password}</p>}
        </label>
        <label>Confirm new password<input type="password" value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value); if(passwordErrors.confirm_password) setPasswordErrors(er=>({...er,confirm_password:''}))}} autoComplete="new-password" {...fieldAria('settings-confirm-password-error', passwordErrors.confirm_password)}/>
          {passwordErrors.confirm_password && <p id="settings-confirm-password-error" className="field-error">{passwordErrors.confirm_password}</p>}
        </label>
        <button className="btn btn-outline" disabled={passwordStatus==='saving'} aria-busy={passwordStatus==='saving'}>
          <span aria-live="polite">{passwordStatus==='saving' ? 'Updating…' : 'Update password'}</span>
        </button>
      </form>
    </div>
  </div>
}
