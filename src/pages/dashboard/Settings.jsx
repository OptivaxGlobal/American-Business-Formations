import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { validateFullName, validateEmail } from '../../validations/contactValidation'
import { fieldAria, focusFirstInvalid } from '../../lib/formErrors'

export default function Settings(){
  const { user, login, notify } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [errors, setErrors] = useState({})
  const fieldRefs = useRef({})

  const validate = () => ({
    name: validateFullName(name, { required: true }),
    email: validateEmail(email, { required: true })
  })

  const handleBlur = (key, value) => {
    const result = key === 'name' ? validateFullName(value, { required: true }) : validateEmail(value, { required: true })
    setErrors(e => ({ ...e, [key]: result.valid ? '' : result.message }))
  }

  const save = e => {
    e.preventDefault()
    const results = validate()
    const nextErrors = { name: results.name.valid ? '' : results.name.message, email: results.email.valid ? '' : results.email.message }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email) {
      focusFirstInvalid(fieldRefs, nextErrors, ['name', 'email'])
      return
    }
    login({ ...user, name: results.name.normalized, email: results.email.normalized })
    notify('Settings saved.')
  }

  return <div className="dash-grid">
    <div className="dash-card">
      <div className="dash-card-head"><div><span>Account</span><h3>Profile settings</h3></div></div>
      <form className="contact-form" onSubmit={save} noValidate>
        <label>Full name<input value={name} onChange={e=>{setName(e.target.value); if(errors.name) setErrors(er=>({...er,name:''}))}} onBlur={()=>handleBlur('name', name)} autoComplete="name" ref={el=>fieldRefs.current.name=el} {...fieldAria('settings-name-error', errors.name)}/>
          {errors.name && <p id="settings-name-error" className="field-error">{errors.name}</p>}
        </label>
        <label>Email address<input type="email" value={email} onChange={e=>{setEmail(e.target.value); if(errors.email) setErrors(er=>({...er,email:''}))}} onBlur={()=>handleBlur('email', email)} autoComplete="email" ref={el=>fieldRefs.current.email=el} {...fieldAria('settings-email-error', errors.email)}/>
          {errors.email && <p id="settings-email-error" className="field-error">{errors.email}</p>}
        </label>
        <button className="btn btn-primary">Save changes</button>
      </form>
    </div>
    <div className="dash-card">
      <div className="dash-card-head"><div><span>Notifications</span><h3>Reminder preferences</h3></div></div>
      <label className="check-control terms-check"><input type="checkbox" defaultChecked/> Email reminders for compliance deadlines</label>
      <label className="check-control terms-check"><input type="checkbox"/> SMS reminders (requires a phone number)</label>
      <label className="check-control terms-check"><input type="checkbox" defaultChecked/> Product and service updates</label>
    </div>
  </div>
}
