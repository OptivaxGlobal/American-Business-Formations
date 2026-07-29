import { useId, useRef, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { normalizeBusinessName, validateBusinessName } from '../lib/businessName'
import { recordLead } from '../lib/leads'

// Reused across the homepage hero and other homepage-level "start" CTAs.
// Renders with the project's existing .state-selector / .state-row classes
// so it inherits the site's card, spacing, and responsive behavior for free.
export default function BusinessNameStartForm({
  initialValue,
  onSubmit,
  buttonText = 'Get started',
  source = 'homepage_hero',
  compact = false,
  className = ''
}) {
  const navigate = useNavigate()
  const { businessName, setBusinessName } = useApp()
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef(null)
  const submittingRef = useRef(false)

  const [value, setValue] = useState(() => initialValue ?? businessName ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const next = e.target.value
    setValue(next)
    if (error && validateBusinessName(next).valid) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submittingRef.current) return

    const normalized = normalizeBusinessName(value)
    const validation = validateBusinessName(normalized)
    if (!validation.valid) {
      setError(validation.message)
      inputRef.current?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setError('')

    try {
      setBusinessName(normalized)
      recordLead('business_name_form', { businessName: normalized, source })
      onSubmit?.(normalized)
      navigate(`/formation-details?businessName=${encodeURIComponent(normalized)}&source=${encodeURIComponent(source)}`)
    } catch {
      submittingRef.current = false
      setSubmitting(false)
      setError("We couldn't start your application. Please try again.")
    }
  }

  return (
    <form className={`state-selector business-name-form ${compact ? 'compact' : ''} ${className}`} onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId}>Enter your business name</label>
      <div className="state-row">
        <input
          ref={inputRef}
          id={inputId}
          name="businessName"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter your business name"
          autoComplete="organization"
          maxLength={80}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          disabled={submitting}
        />
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? <><Loader2 className="spin" size={18} /> Starting...</> : <>{buttonText} <ArrowRight size={18} /></>}
        </button>
      </div>
      <div aria-live="polite">
        {error
          ? <p id={errorId} className="field-error">{error}</p>
          : !compact && <small>We&rsquo;ll help you review your preferred business name during formation.</small>}
      </div>
    </form>
  )
}
