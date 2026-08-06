import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import AsyncState from '../../components/dashboard/AsyncState'

export default function Notifications(){
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api.listNotifications()
      .then(result => setNotifications(result?.data || []))
      .catch(err => setError(err?.message || 'We could not load your notifications. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    const previous = notifications
    setNotifications(list => list.map(n => n.id === id ? { ...n, read: true } : n))
    try {
      await api.markNotificationRead(id)
    } catch {
      setNotifications(previous) // roll back the server didn't confirm the read
    }
  }

  return <div className="dash-card">
    <div className="dash-card-head"><div><span>Notifications</span><h3>Recent activity</h3></div></div>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading your notifications…">
      {notifications.length===0 && <p className="dash-empty">You&rsquo;re all caught up.</p>}
      <div className="document-list">
        {notifications.map(item => (
          <div key={item.id} style={{ opacity: item.read ? 0.6 : 1 }}>
            <div className="doc-icon"><Bell/></div>
            <span><strong>{item.title}</strong><small>{item.body}</small></span>
            {!item.read && <button className="btn btn-outline" onClick={() => markRead(item.id)}>Mark read</button>}
            {item.link && <Link to={item.link} className="btn btn-primary">View</Link>}
          </div>
        ))}
      </div>
    </AsyncState>
  </div>
}
