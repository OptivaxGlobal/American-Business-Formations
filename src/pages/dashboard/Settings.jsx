import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function Settings(){
  const { user, login, notify } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  const save = e => {
    e.preventDefault()
    login({ ...user, name, email })
    notify('Settings saved.')
  }

  return <div className="dash-grid">
    <div className="dash-card">
      <div className="dash-card-head"><div><span>Account</span><h3>Profile settings</h3></div></div>
      <form className="contact-form" onSubmit={save}>
        <label>Full name<input value={name} onChange={e=>setName(e.target.value)}/></label>
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
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
