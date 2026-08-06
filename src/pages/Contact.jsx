import { Clock, Mail, Send } from 'lucide-react'
import { useRef, useState } from 'react'
import { api } from '../lib/api'
import { useApp } from '../context/AppContext'
import { validateFullName, validateEmail, validatePhone } from '../validations/contactValidation'
import { validateText } from '../validations/commonValidation'
import { fieldAria, focusFirstInvalid } from '../lib/formErrors'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { SUPPORT_EMAIL } from '../data/seo'

const FIELD_ORDER = ['first_name', 'last_name', 'email', 'phone', 'message']

function validateField(name, value) {
  switch (name) {
    case 'first_name': return validateFullName(value, { required: true })
    case 'last_name': return validateFullName(value, { required: true })
    case 'email': return validateEmail(value, { required: true })
    case 'phone': return validatePhone(value, { required: false })
    case 'message': return validateText(value, { required: true, min: 10, max: 2000, label: 'Message' })
    default: return { valid: true, message: '' }
  }
}

export default function Contact(){
  const [loading,setLoading]=useState(false); const {notify}=useApp()
  const [values, setValues] = useState({ first_name: '', last_name: '', email: '', phone: '', service: 'LLC Formation', message: '' })
  const [honeypot, setHoneypot] = useState('') // real visitors never fill this in see the input's own comment below
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const fieldRefs = useRef({})

  const handleChange = (name) => (e) => {
    const next = e.target.value
    setValues(v => ({ ...v, [name]: next }))
    if (touched[name]) {
      const result = validateField(name, next)
      setErrors(er => ({ ...er, [name]: result.valid ? '' : result.message }))
    }
  }

  const handleBlur = (name) => () => {
    setTouched(t => ({ ...t, [name]: true }))
    const result = validateField(name, values[name])
    setErrors(er => ({ ...er, [name]: result.valid ? '' : result.message }))
  }

  const submit = async e => {
    e.preventDefault()
    // Spam-resistant honeypot: a field real visitors never see or fill in
    // (hidden off-screen, not display:none, so accessibility tooling that
    // ignores hidden elements doesn't inadvertently expose it as a real
    // field but a scripted bot filling every input still catches it). A
    // non-empty value here quietly no-ops instead of calling the API, no
    // CAPTCHA involved since none is actually configured.
    if (honeypot) return
    const nextErrors = {}
    FIELD_ORDER.forEach(name => {
      const result = validateField(name, values[name])
      if (!result.valid) nextErrors[name] = result.message
    })
    setErrors(nextErrors)
    setTouched(Object.fromEntries(FIELD_ORDER.map(n => [n, true])))

    if (Object.keys(nextErrors).length) {
      setFormError('Please fix the highlighted fields before sending your message.')
      focusFirstInvalid(fieldRefs, nextErrors, FIELD_ORDER)
      return
    }
    setFormError('')
    setLoading(true)
    const payload = { ...values, first_name: values.first_name.trim(), last_name: values.last_name.trim(), message: values.message.trim() }
    try {
      // A real 2xx here means the message is actually saved to the
      // database there is no local fallback, so a genuine failure
      // (network, validation, server error) always surfaces as a real
      // error instead of a false "message received."
      await api.submitContact(payload)
      setValues({ first_name: '', last_name: '', email: '', phone: '', service: 'LLC Formation', message: '' })
      setTouched({})
      notify('Your message has been received. We’ll reply by email.')
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) {
        setErrors(er => ({ ...er, ...err.fieldErrors }))
      }
      setFormError(err.message || 'We could not send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <>
    <SEO title="Contact Us" description="Reach American Business Formations for Texas LLC formation questions, service requests, or support." path="/contact" />
    <PageHero eyebrow="Contact our team" title="Tell us how we can help" description="Use the form for LLC formation questions, service requests, or general support." />
    <section className="section"><div className="container contact-grid">
      <Reveal as="div" delay={0} className="contact-details">
        <h2>Start a conversation</h2>
        <p>Every message reaches a real person, not an automated queue.</p>
        <div><Mail/><span><strong>Email</strong><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></span></div>
        <div><Clock/><span><strong>Response time</strong><p>We reply to every message, typically within one business day.</p></span></div>
      </Reveal>
      <Reveal as="form" delay={1} className="contact-form" onSubmit={submit} noValidate>
        {formError && <p className="form-error-summary" role="alert">{formError}</p>}
        {/* Honeypot: real visitors never see this (off-screen, not aria-hidden
            so it stays out of autofill/scripted-bot blind spots) a filled
            value means a bot, and submit() quietly no-ops instead of posting. */}
        <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="false">
          <label htmlFor="contact-website">Leave this field blank</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)}/>
        </div>
        <div className="form-grid">
          <label>First name<input required name="first_name" autoComplete="given-name" value={values.first_name} onChange={handleChange('first_name')} onBlur={handleBlur('first_name')} ref={el=>fieldRefs.current.first_name=el} {...fieldAria('contact-first_name-error', errors.first_name)}/>
            {errors.first_name && <p id="contact-first_name-error" className="field-error">{errors.first_name}</p>}
          </label>
          <label>Last name<input required name="last_name" autoComplete="family-name" value={values.last_name} onChange={handleChange('last_name')} onBlur={handleBlur('last_name')} ref={el=>fieldRefs.current.last_name=el} {...fieldAria('contact-last_name-error', errors.last_name)}/>
            {errors.last_name && <p id="contact-last_name-error" className="field-error">{errors.last_name}</p>}
          </label>
          <label>Email<input required type="email" name="email" autoComplete="email" value={values.email} onChange={handleChange('email')} onBlur={handleBlur('email')} ref={el=>fieldRefs.current.email=el} {...fieldAria('contact-email-error', errors.email)}/>
            {errors.email && <p id="contact-email-error" className="field-error">{errors.email}</p>}
          </label>
          <label>Phone (optional)<input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={handleChange('phone')} onBlur={handleBlur('phone')} ref={el=>fieldRefs.current.phone=el} {...fieldAria('contact-phone-error', errors.phone)}/>
            {errors.phone && <p id="contact-phone-error" className="field-error">{errors.phone}</p>}
          </label>
        </div>
        <label>What do you need help with?<select name="service" value={values.service} onChange={handleChange('service')}><option>LLC Formation</option><option>Registered Agent</option><option>EIN Assistance</option><option>Operating Agreement</option><option>DBA / Assumed Name</option><option>Compliance Support</option><option>Formation Documents</option><option>Other</option></select></label>
        <label>Message<textarea required rows="6" name="message" placeholder="Share the important details..." value={values.message} onChange={handleChange('message')} onBlur={handleBlur('message')} ref={el=>fieldRefs.current.message=el} {...fieldAria('contact-message-error', errors.message)}></textarea>
          {errors.message && <p id="contact-message-error" className="field-error">{errors.message}</p>}
        </label>
        <button className="btn btn-primary" disabled={loading} aria-busy={loading}><span aria-live="polite">{loading?'Sending...':'Send message'}</span> <Send size={18}/></button>
      </Reveal>
    </div></section>
  </>}
