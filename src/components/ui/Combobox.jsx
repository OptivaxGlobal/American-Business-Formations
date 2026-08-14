import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Loader2, MapPin } from 'lucide-react'
import { fieldAria } from '../../lib/formErrors'

// Accessible, searchable autocomplete combobox (WAI-ARIA "editable combobox
// with list autocomplete" pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
//
// The field is always a plain, freely-editable text input underneath the
// dropdown is assistive only. A value the user typed that doesn't match any
// suggestion (or the "Other / Not Listed" row) is still accepted; nothing
// here ever blocks a legitimate customer whose city or county isn't in the
// dataset (see src/lib/geography.js).
//
// Props:
//   label, id, value, onChange(value), onBlur, error, hint, placeholder
//   options: string[] already loaded, unfiltered
//   loading: bool options for the current state are still being fetched
//   unavailable: bool the data source failed/has nothing for this state;
//     the field still works as free text, with a note explaining why
//   disabled, required, inputRef, otherLabel, noResultsLabel
export default function Combobox({
  label, id, value, onChange, onBlur, error, hint, placeholder,
  options = [], loading = false, unavailable = false, disabled = false,
  required = false, inputRef, otherLabel = 'Other / Not Listed',
  noResultsLabel = 'No matches. You can type your own or choose "Other / Not Listed" below.',
  autoComplete,
}) {
  const reactId = useId()
  const inputId = id || reactId
  const listboxId = `${inputId}-listbox`
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint && !error ? `${inputId}-hint` : undefined

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const [announce, setAnnounce] = useState('')

  const filtered = useMemo(() => {
    const q = (value || '').trim().toLowerCase()
    if (!q) return options.slice(0, 25)
    const starts = []
    const contains = []
    for (const opt of options) {
      const lower = opt.toLowerCase()
      if (lower.startsWith(q)) starts.push(opt)
      else if (lower.includes(q)) contains.push(opt)
      if (starts.length + contains.length >= 150) break
    }
    return [...starts, ...contains].slice(0, 50)
  }, [options, value])

  // Rows actually rendered: filtered matches + a trailing "Other / Not
  // Listed" row, always present so the fallback is always reachable.
  const rows = useMemo(() => [...filtered, otherLabel], [filtered, otherLabel])

  useEffect(() => {
    if (!open) setActiveIndex(-1)
  }, [open])

  // Once the typed value exactly matches a real option (whether the
  // customer clicked it, pressed Enter on it, or simply finished typing it
  // out by hand), the selection reads as "settled" keep the list from
  // lingering open with only tangential near-matches (e.g. "Houston" vs.
  // "South Houston") once there's nothing left to disambiguate.
  const exactMatch = useMemo(() => {
    const v = (value || '').trim().toLowerCase()
    return v ? options.some(opt => opt.toLowerCase() === v) : false
  }, [value, options])
  useEffect(() => {
    if (exactMatch) setOpen(false)
  }, [exactMatch])

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    if (open && loading) setAnnounce(`Loading ${label ? label.toLowerCase() : 'options'}…`)
    else if (open && !loading && filtered.length === 0 && (value || '').trim()) setAnnounce(noResultsLabel)
    else if (open && !loading) setAnnounce(`${filtered.length} suggestion${filtered.length === 1 ? '' : 's'} available.`)
  }, [open, loading, filtered.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectRow = (row) => {
    if (row !== otherLabel) onChange(row)
    // Selecting "Other / Not Listed" simply closes the list and leaves
    // whatever the customer already typed in place the field never
    // required a list match to begin with.
    setOpen(false)
    setActiveIndex(-1)
    inputRef?.current?.focus?.()
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      setActiveIndex(i => Math.min(i + 1, rows.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && rows[activeIndex] !== undefined) {
        e.preventDefault()
        selectRow(rows[activeIndex])
      }
    } else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); setOpen(false) }
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const activeId = activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined

  return (
    <label className="combobox-field" ref={rootRef}>
      {label}{required && <span aria-hidden="true"> *</span>}
      <div className={`combobox-control${disabled ? ' is-disabled' : ''}`}>
        <MapPin size={16} className="combobox-icon" aria-hidden="true" />
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeId}
          autoComplete={autoComplete || 'off'}
          disabled={disabled}
          value={value || ''}
          placeholder={placeholder}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => !disabled && setOpen(true)}
          onBlur={() => { setOpen(false); onBlur?.() }}
          onKeyDown={handleKeyDown}
          {...fieldAria([errorId, hintId].filter(Boolean).join(' ') || undefined, error)}
        />
        {loading
          ? <Loader2 size={16} className="combobox-spinner spin" aria-hidden="true" />
          : <ChevronDown size={16} className="combobox-chevron" aria-hidden="true" />}
      </div>

      {open && !disabled && (
        <ul className="combobox-listbox" id={listboxId} role="listbox" aria-label={label} ref={listRef}>
          {loading ? (
            <li className="combobox-status" role="presentation"><Loader2 size={14} className="spin" aria-hidden="true" /> Loading options…</li>
          ) : (
            <>
              {filtered.length === 0 && (value || '').trim() && (
                <li className="combobox-status" role="presentation">{noResultsLabel}</li>
              )}
              {filtered.map((opt, i) => (
                <li
                  key={opt}
                  id={`${listboxId}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`combobox-option${i === activeIndex ? ' is-active' : ''}`}
                  onMouseDown={e => e.preventDefault() /* keep focus in the input through the click */}
                  onClick={() => selectRow(opt)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {opt}
                </li>
              ))}
              <li
                id={`${listboxId}-opt-${filtered.length}`}
                data-index={filtered.length}
                role="option"
                aria-selected={filtered.length === activeIndex}
                className={`combobox-option combobox-option-other${filtered.length === activeIndex ? ' is-active' : ''}`}
                onMouseDown={e => e.preventDefault()}
                onClick={() => selectRow(otherLabel)}
                onMouseEnter={() => setActiveIndex(filtered.length)}
              >
                {otherLabel}
              </li>
            </>
          )}
        </ul>
      )}

      <span className="sr-only" role="status" aria-live="polite">{open ? announce : ''}</span>
      {error
        ? <p id={errorId} className="field-error">{error}</p>
        : (hint && <small id={hintId}>{hint}</small>)}
      {unavailable && !error && (
        <small className="combobox-fallback-note">We couldn&rsquo;t load the suggestion list right now you can still type it in manually.</small>
      )}
    </label>
  )
}
