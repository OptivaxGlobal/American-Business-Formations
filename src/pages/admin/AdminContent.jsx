import { useState } from 'react'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { logAudit } from '../../lib/auditLog'
import { loadAnnouncement, saveAnnouncement } from '../../data/announcement'
import { loadTestimonials, saveTestimonials } from '../../data/testimonials'
import { validateAdminText } from '../../validations/adminValidation'
import { validateFullName } from '../../validations/contactValidation'

export default function AdminContent(){
  const { user, notify } = useApp()
  const [announcement, setAnnouncement] = useState(loadAnnouncement)
  const [testimonials, setTestimonials] = useState(loadTestimonials)
  const [announcementError, setAnnouncementError] = useState('')
  const [testimonialErrors, setTestimonialErrors] = useState({})

  const saveAnnouncementBar = () => {
    if (announcement.enabled) {
      const result = validateAdminText(announcement.message, { required: true, min: 5, max: 160 })
      if (!result.valid) { setAnnouncementError(result.message); return }
    }
    setAnnouncementError('')
    saveAnnouncement(announcement)
    logAudit(user?.email||'admin', 'Updated announcement bar', announcement.message)
    notify('Announcement bar saved.')
  }

  const updateTestimonial = (id, patch) => setTestimonials(list => list.map(t => t.id === id ? { ...t, ...patch } : t))
  const removeTestimonial = (id) => {
    const next = testimonials.filter(t => t.id !== id)
    setTestimonials(next)
    saveTestimonials(next)
    setTestimonialErrors(e => { const n = { ...e }; delete n[id]; return n })
  }
  const addTestimonial = () => setTestimonials(list => [...list, { id: `t-${Date.now()}`, name: '', role: '', quote: '', placeholder: false }])

  const validateTestimonial = (t) => {
    const errors = {}
    if (!t.placeholder) {
      const nameResult = validateFullName(t.name, { required: true })
      if (!nameResult.valid) errors.name = nameResult.message
      const quoteResult = validateAdminText(t.quote, { required: true, min: 10, max: 600 })
      if (!quoteResult.valid) errors.quote = quoteResult.message
    }
    return errors
  }

  const saveAllTestimonials = () => {
    const nextErrors = {}
    testimonials.forEach(t => {
      const errs = validateTestimonial(t)
      if (Object.keys(errs).length) nextErrors[t.id] = errs
    })
    setTestimonialErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      notify('Fix the highlighted testimonials before saving.')
      return
    }
    saveTestimonials(testimonials)
    logAudit(user?.email||'admin', 'Updated testimonials', `${testimonials.length} entries`)
    notify('Testimonials saved.')
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Header announcement bar</h3></div>
    <p className="onboarding-note"><ShieldCheck size={15}/> The site shows a single slim bar in the header keep this to one short, factual line.</p>
    <div className="admin-plan-editor">
      <label className="check-control"><input type="checkbox" checked={announcement.enabled} onChange={e=>setAnnouncement(a=>({...a, enabled: e.target.checked}))}/> Show announcement bar</label>
      <label>Message</label>
      <input value={announcement.message} onChange={e=>{setAnnouncement(a=>({...a, message: e.target.value})); if(announcementError) setAnnouncementError('')}} placeholder="e.g. LLC formation currently available in Texas." aria-invalid={announcementError?'true':'false'}/>
      {announcementError && <p className="field-error">{announcementError}</p>}
    </div>
    <button className="btn btn-primary" onClick={saveAnnouncementBar}>Save announcement</button>

    <div className="admin-toolbar" style={{marginTop:32}}><h3>Testimonials</h3><button className="btn btn-outline" onClick={addTestimonial}><Plus size={16}/> Add testimonial</button></div>
    <p className="onboarding-note"><ShieldCheck size={15}/> Only publish reviews from verified, real customers. Placeholder entries are hidden on the public site automatically.</p>
    <div style={{display:'grid', gap:12}}>
      {testimonials.map(t => (
        <div className="admin-plan-editor" key={t.id}>
          <label className="check-control"><input type="checkbox" checked={!!t.placeholder} onChange={e=>updateTestimonial(t.id, { placeholder: e.target.checked })}/> Placeholder (hidden from public site)</label>
          <label>Customer name</label>
          <input value={t.name} onChange={e=>updateTestimonial(t.id, { name: e.target.value })} aria-invalid={testimonialErrors[t.id]?.name?'true':'false'}/>
          {testimonialErrors[t.id]?.name && <p className="field-error">{testimonialErrors[t.id].name}</p>}
          <label>Role / company</label>
          <input value={t.role} onChange={e=>updateTestimonial(t.id, { role: e.target.value })}/>
          <label>Quote</label>
          <textarea rows="3" value={t.quote} onChange={e=>updateTestimonial(t.id, { quote: e.target.value })} aria-invalid={testimonialErrors[t.id]?.quote?'true':'false'}/>
          {testimonialErrors[t.id]?.quote && <p className="field-error">{testimonialErrors[t.id].quote}</p>}
          <button className="btn btn-outline" style={{marginTop:10}} onClick={()=>removeTestimonial(t.id)}><Trash2 size={15}/> Remove</button>
        </div>
      ))}
    </div>
    <button className="btn btn-primary" style={{marginTop:14}} onClick={saveAllTestimonials}>Save testimonials</button>

    <p className="onboarding-note" style={{marginTop:24}}><ShieldCheck size={15}/> FAQ and service-page copy live in <code>src/data/</code>. A production build would connect this screen to a real CMS or database so edits publish without a code deploy.</p>
  </div>
}
