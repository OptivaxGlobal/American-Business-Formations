import { useEffect, useState } from 'react'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { api } from '../../lib/api'
import { validateAdminText } from '../../validations/adminValidation'
import { validateFullName } from '../../validations/contactValidation'
import AsyncState from '../../components/dashboard/AsyncState'

export default function AdminContent(){
  const { notify } = useApp()
  const [announcement, setAnnouncement] = useState({ enabled: false, message: '' })
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [announcementError, setAnnouncementError] = useState('')
  const [testimonialErrors, setTestimonialErrors] = useState({})
  const [savingTestimonialId, setSavingTestimonialId] = useState(null)

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([api.adminGetSiteSettings(), api.adminListTestimonials()])
      .then(([settingsRes, testimonialsRes]) => {
        setAnnouncement(settingsRes.data.announcement || { enabled: false, message: '' })
        setTestimonials(testimonialsRes.data)
      })
      .catch(err => setError(err?.message || 'We could not load content settings. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const saveAnnouncementBar = async () => {
    if (announcement.enabled) {
      const result = validateAdminText(announcement.message, { required: true, min: 5, max: 160 })
      if (!result.valid) { setAnnouncementError(result.message); return }
    }
    setAnnouncementError('')
    try {
      await api.adminSetSiteSetting('announcement', announcement)
      notify('Announcement bar saved.')
    } catch (err) {
      notify(err.message || 'We could not save the announcement bar. Please try again.', 'error')
    }
  }

  const updateTestimonialField = (id, patch) => setTestimonials(list => list.map(t => t.id === id ? { ...t, ...patch } : t))

  const removeTestimonial = async (id) => {
    const previous = testimonials
    setTestimonials(list => list.filter(t => t.id !== id))
    try {
      await api.adminDeleteTestimonial(id)
      notify('Testimonial removed.')
    } catch (err) {
      setTestimonials(previous)
      notify(err.message || 'We could not remove that testimonial. Please try again.', 'error')
    }
  }

  const addTestimonial = async () => {
    try {
      const res = await api.adminCreateTestimonial({ customer_name: 'New customer', quote: 'Add the verified customer quote here.', verified: false, published: false })
      setTestimonials(list => [...list, { id: res.data.id, customer_name: 'New customer', customer_role: '', quote: 'Add the verified customer quote here.', verified: false, published: false }])
    } catch (err) {
      notify(err.message || 'We could not add a new testimonial. Please try again.', 'error')
    }
  }

  const saveTestimonial = async (t) => {
    const nameResult = validateFullName(t.customer_name, { required: true })
    const quoteResult = validateAdminText(t.quote, { required: true, min: 10, max: 600 })
    const errs = {}
    if (!nameResult.valid) errs.customer_name = nameResult.message
    if (!quoteResult.valid) errs.quote = quoteResult.message
    setTestimonialErrors(e => ({ ...e, [t.id]: errs }))
    if (Object.keys(errs).length) { notify('Fix the highlighted testimonial fields before saving.', 'error'); return }

    setSavingTestimonialId(t.id)
    try {
      const res = await api.adminUpdateTestimonial(t.id, {
        customer_name: nameResult.normalized, customer_role: t.customer_role, quote: quoteResult.normalized,
        verified: t.verified, published: t.published,
      })
      updateTestimonialField(t.id, res.data)
      notify('Testimonial saved.')
    } catch (err) {
      notify(err.message || 'We could not save that testimonial. Please try again.', 'error')
    } finally {
      setSavingTestimonialId(null)
    }
  }

  return <div className="dash-card">
    <div className="admin-toolbar"><h3>Header announcement bar</h3></div>
    <p className="onboarding-note"><ShieldCheck size={15}/> The site shows a single slim bar in the header keep this to one short, factual line.</p>
    <AsyncState loading={loading} error={error} onRetry={load} loadingLabel="Loading content settings…">
      <div className="admin-plan-editor">
        <label className="check-control"><input type="checkbox" checked={announcement.enabled} onChange={e=>setAnnouncement(a=>({...a, enabled: e.target.checked}))}/> Show announcement bar</label>
        <label>Message</label>
        <input value={announcement.message} onChange={e=>{setAnnouncement(a=>({...a, message: e.target.value})); if(announcementError) setAnnouncementError('')}} placeholder="e.g. LLC formation now available nationwide." aria-invalid={announcementError?'true':'false'}/>
        {announcementError && <p className="field-error">{announcementError}</p>}
      </div>
      <button className="btn btn-primary" onClick={saveAnnouncementBar}>Save announcement</button>

      <div className="admin-toolbar" style={{marginTop:32}}><h3>Testimonials</h3><button className="btn btn-outline" onClick={addTestimonial}><Plus size={16}/> Add testimonial</button></div>
      <p className="onboarding-note"><ShieldCheck size={15}/> Only publish reviews from verified, real customers a testimonial can never go live without the Verified checkbox checked, even if Published is also checked.</p>
      <div style={{display:'grid', gap:12}}>
        {testimonials.map(t => (
          <div className="admin-plan-editor" key={t.id}>
            <div style={{display:'flex',gap:16}}>
              <label className="check-control"><input type="checkbox" checked={!!t.verified} onChange={e=>updateTestimonialField(t.id, { verified: e.target.checked })}/> Verified</label>
              <label className="check-control"><input type="checkbox" checked={!!t.published} onChange={e=>updateTestimonialField(t.id, { published: e.target.checked })}/> Published</label>
            </div>
            <label>Customer name</label>
            <input value={t.customer_name} onChange={e=>updateTestimonialField(t.id, { customer_name: e.target.value })} aria-invalid={testimonialErrors[t.id]?.customer_name?'true':'false'}/>
            {testimonialErrors[t.id]?.customer_name && <p className="field-error">{testimonialErrors[t.id].customer_name}</p>}
            <label>Role / company</label>
            <input value={t.customer_role||''} onChange={e=>updateTestimonialField(t.id, { customer_role: e.target.value })}/>
            <label>Quote</label>
            <textarea rows="3" value={t.quote} onChange={e=>updateTestimonialField(t.id, { quote: e.target.value })} aria-invalid={testimonialErrors[t.id]?.quote?'true':'false'}/>
            {testimonialErrors[t.id]?.quote && <p className="field-error">{testimonialErrors[t.id].quote}</p>}
            <div className="admin-toolbar" style={{marginTop:10}}>
              <button className="btn btn-primary" disabled={savingTestimonialId===t.id} onClick={()=>saveTestimonial(t)}>{savingTestimonialId===t.id?'Saving…':'Save'}</button>
              <button className="btn btn-outline" onClick={()=>removeTestimonial(t.id)}><Trash2 size={15}/> Remove</button>
            </div>
          </div>
        ))}
      </div>

      <p className="onboarding-note" style={{marginTop:24}}><ShieldCheck size={15}/> FAQ and service-page copy live in <code>src/data/</code>. Connecting this screen to a real CMS/database so those edit without a code deploy is tracked for a future pass.</p>
    </AsyncState>
  </div>
}
