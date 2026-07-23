import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { logAudit } from '../../lib/auditLog'

function load(){ try { return JSON.parse(localStorage.getItem('abf-admin-announcement'))||'' } catch { return '' } }

export default function AdminContent(){
  const { user, notify } = useApp()
  const [announcement, setAnnouncement] = useState(load)

  const save = () => {
    localStorage.setItem('abf-admin-announcement', announcement)
    logAudit(user?.email||'admin', 'Updated announcement bar text', announcement)
    notify('Content saved.')
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Content</h3></div>
    <label>Announcement bar message<input value={announcement} onChange={e=>setAnnouncement(e.target.value)} placeholder="e.g. Guided business formation for founders across the United States"/></label>
    <button className="btn btn-primary" style={{marginTop:14}} onClick={save}>Save</button>
    <p className="onboarding-note" style={{marginTop:18}}><ShieldCheck size={15}/> FAQ, testimonial, and service-page copy live in <code>src/data/</code> in this demo. A production build would connect this screen to a real CMS or database so edits publish without a code deploy.</p>
  </div>
}
