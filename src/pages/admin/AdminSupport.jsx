import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { Table } from '../../components/ui'
import AsyncState from '../../components/dashboard/AsyncState'

const STATUS_OPTIONS = ['open', 'pending', 'closed']

function ThreadPanel({ threadId, onClose, onChanged }) {
  const { notify } = useApp()
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    api.adminGetSupportThread(threadId)
      .then(res => setThread(res.data))
      .catch(err => setError(err?.message || 'We could not load this thread. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [threadId]) // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      await api.adminReplyToThread(threadId, { message: reply })
      setReply('')
      notify('Reply sent.')
      load()
      onChanged()
    } catch (err) {
      notify(err.message || 'We could not send that reply. Please try again.', 'error')
    } finally {
      setSending(false)
    }
  }

  const changeStatus = async (status) => {
    try {
      await api.adminUpdateThreadStatus(threadId, status)
      setThread(t => ({ ...t, status }))
      onChanged()
    } catch (err) {
      notify(err.message || 'We could not update this thread. Please try again.', 'error')
    }
  }

  return <div className="dash-card">
    <div className="admin-toolbar">
      <h3>{thread?.subject || 'Thread'}</h3>
      <button className="btn btn-ghost" onClick={onClose}>Close</button>
    </div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading thread…">
      {thread && <>
        <p className="dash-empty" style={{padding:0}}>{thread.customer_name} • {thread.customer_email}</p>
        <label>Status<select value={thread.status} onChange={e=>changeStatus(e.target.value)}>{STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        <div className="document-list" style={{marginTop:16}}>
          {thread.messages.map(m => <div key={m.id}>
            <span><strong>{m.is_staff ? 'Support team' : 'Customer'}</strong><small>{new Date(m.created_at).toLocaleString()}</small><p style={{margin:'6px 0 0'}}>{m.body}</p></span>
          </div>)}
        </div>
        <div className="admin-plan-editor" style={{marginTop:16}}>
          <label>Reply<textarea rows="3" value={reply} onChange={e=>setReply(e.target.value)}/></label>
          <button className="btn btn-primary" disabled={sending} onClick={send}>{sending ? 'Sending…' : 'Send reply'}</button>
        </div>
      </>}
    </AsyncState>
  </div>
}

export default function AdminSupport(){
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openThreadId, setOpenThreadId] = useState(null)

  const load = () => {
    setLoading(true)
    setError('')
    api.adminListSupportThreads()
      .then(res => setThreads(res.data))
      .catch(err => setError(err?.message || 'We could not load support requests. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (openThreadId) return <ThreadPanel threadId={openThreadId} onClose={()=>setOpenThreadId(null)} onChanged={load}/>

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Support requests</h3></div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading support requests…">
      {threads.length===0 && <p className="dash-empty">No support requests yet.</p>}
      {threads.length > 0 && <Table>
        <thead><tr><th>Subject</th><th>Customer</th><th>Priority</th><th>Status</th><th>Created</th><th></th></tr></thead>
        <tbody>
          {threads.map(t => <tr key={t.id}>
            <td>{t.subject}</td><td>{t.customer_name}</td><td>{t.priority}</td>
            <td><span className={`admin-badge ${t.status==='closed'?'approved':'pending'}`}>{t.status}</span></td>
            <td>{new Date(t.created_at).toLocaleDateString()}</td>
            <td><button className="btn btn-outline" onClick={()=>setOpenThreadId(t.id)}>Open</button></td>
          </tr>)}
        </tbody>
      </Table>}
    </AsyncState>
  </div>
}
