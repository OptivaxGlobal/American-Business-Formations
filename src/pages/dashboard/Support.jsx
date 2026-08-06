import { MessageSquare, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { validateText } from '../../validations/commonValidation'
import { fieldAria, focusFirstInvalid } from '../../lib/formErrors'
import EmptyState from '../../components/ui/EmptyState'
import AsyncState from '../../components/dashboard/AsyncState'

export default function Support(){
  const { notify } = useApp()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState('normal')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const fieldRefs = useRef({})

  const load = () => {
    setLoading(true)
    setError('')
    api.listSupportThreads()
      .then(result => setThreads(result?.data || []))
      .catch(err => setError(err?.message || 'We could not load your support requests. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const validateSubject = (value) => validateText(value, { required: true, min: 3, max: 200, label: 'Subject' })
  const validateMessage = (value) => validateText(value, { required: true, min: 10, max: 2000, label: 'Message' })

  const submit = async e => {
    e.preventDefault()
    const subjectResult = validateSubject(subject)
    const messageResult = validateMessage(message)
    const nextErrors = {
      subject: subjectResult.valid ? '' : subjectResult.message,
      message: messageResult.valid ? '' : messageResult.message,
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) {
      focusFirstInvalid(fieldRefs, nextErrors, ['subject', 'priority', 'message'])
      return
    }
    setSubmitting(true)
    try {
      await api.createSupportThread({ subject, message, priority })
      setSubject(''); setMessage(''); setPriority('normal'); setErrors({})
      notify('Support request submitted.')
      load()
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) setErrors(er => ({ ...er, ...err.fieldErrors }))
      notify(err.message || 'We could not submit your request. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return <div className="dash-grid">
    <div className="dash-card">
      <div className="dash-card-head"><div><span>Support</span><h3>Your requests</h3></div></div>
      <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading your support requests…">
        {threads.length===0 && <EmptyState icon={MessageSquare}>No support requests yet. Use the form to submit one.</EmptyState>}
        <div className="document-list">
          {threads.map(t => <div key={t.id}><div className="doc-icon"><MessageSquare/></div><span><strong>{t.subject}</strong><small>{t.priority} priority • {t.status} • {new Date(t.created_at).toLocaleDateString()}</small></span></div>)}
        </div>
      </AsyncState>
    </div>
    <div className="dash-card">
      <div className="dash-card-head"><div><span>New request</span><h3>Contact support</h3></div></div>
      <form className="contact-form ticket-form" onSubmit={submit} noValidate>
        <label>Subject<input required value={subject} onChange={e=>{setSubject(e.target.value); if(errors.subject) setErrors(er=>({...er,subject:''}))}} onBlur={()=>setErrors(er=>({...er,subject: validateSubject(subject).valid?'':validateSubject(subject).message}))} placeholder="What do you need help with?" ref={el=>fieldRefs.current.subject=el} {...fieldAria('ticket-subject-error', errors.subject)}/>
          {errors.subject && <p id="ticket-subject-error" className="field-error">{errors.subject}</p>}
        </label>
        <label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)} ref={el=>fieldRefs.current.priority=el}><option value="low">Low</option><option value="normal">Normal</option><option value="urgent">Urgent</option></select></label>
        <label>Message<textarea required rows="5" value={message} onChange={e=>{setMessage(e.target.value); if(errors.message) setErrors(er=>({...er,message:''}))}} onBlur={()=>setErrors(er=>({...er,message: validateMessage(message).valid?'':validateMessage(message).message}))} ref={el=>fieldRefs.current.message=el} {...fieldAria('ticket-message-error', errors.message)}></textarea>
          {errors.message && <p id="ticket-message-error" className="field-error">{errors.message}</p>}
        </label>
        <button className="btn btn-primary" disabled={submitting} aria-busy={submitting}>{submitting ? 'Submitting…' : 'Submit request'} <Send size={16}/></button>
      </form>
    </div>
  </div>
}
