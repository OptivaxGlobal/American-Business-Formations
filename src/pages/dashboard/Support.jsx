import { MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

function load(){ try { return JSON.parse(localStorage.getItem('abf-tickets'))||[] } catch { return [] } }

export default function Support(){
  const { notify } = useApp()
  const [tickets, setTickets] = useState(load)
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState('normal')
  const [message, setMessage] = useState('')

  const submit = e => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    const ticket = { id: `tkt-${Date.now()}`, subject, priority, message, status: 'open', createdAt: new Date().toISOString() }
    const next = [ticket, ...tickets]
    setTickets(next)
    localStorage.setItem('abf-tickets', JSON.stringify(next))
    setSubject(''); setMessage('')
    notify('Support ticket created.')
  }

  return <div className="dash-grid">
    <div className="dash-card">
      <div className="dash-card-head"><div><span>Support</span><h3>Your tickets</h3></div></div>
      {tickets.length===0 && <p className="dash-empty">No support tickets yet.</p>}
      <div className="document-list">
        {tickets.map(t => <div key={t.id}><div className="doc-icon"><MessageSquare/></div><span><strong>{t.subject}</strong><small>{t.priority} priority • {t.status} • {new Date(t.createdAt).toLocaleDateString()}</small></span></div>)}
      </div>
    </div>
    <div className="dash-card">
      <div className="dash-card-head"><div><span>New ticket</span><h3>Contact support</h3></div></div>
      <form className="contact-form ticket-form" onSubmit={submit}>
        <label>Subject<input required value={subject} onChange={e=>setSubject(e.target.value)} placeholder="What do you need help with?"/></label>
        <label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)}><option value="low">Low</option><option value="normal">Normal</option><option value="urgent">Urgent</option></select></label>
        <label>Message<textarea required rows="5" value={message} onChange={e=>setMessage(e.target.value)}></textarea></label>
        <button className="btn btn-primary">Submit ticket <Send size={16}/></button>
      </form>
    </div>
  </div>
}
