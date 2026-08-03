import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Generalizes the accordion pattern already hand-rolled in FAQ.jsx (and,
// separately, Home.jsx's CategoryAccordion) onto the same .faq-item/.faq-list
// /.faq-answer CSS (styles.css) so new accordions don't need new styling.
// items: array of [title, content] tuples, or { id, title, content } objects.
export default function Accordion({ items, allowMultiple = false, defaultOpenIndex = -1, className = '' }) {
  const [openIds, setOpenIds] = useState(() => new Set(defaultOpenIndex >= 0 ? [defaultOpenIndex] : []))

  const toggle = (id) => {
    setOpenIds(prev => {
      const next = allowMultiple ? new Set(prev) : new Set()
      if (prev.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={`faq-list ${className}`.trim()}>
      {items.map((item, index) => {
        const [title, content] = Array.isArray(item) ? item : [item.title, item.content]
        const id = Array.isArray(item) ? index : (item.id ?? index)
        const isOpen = openIds.has(id)
        return (
          <article className={`faq-item ${isOpen ? 'open' : ''}`} key={id}>
            <button
              onClick={() => toggle(id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${id}`}
              id={`accordion-question-${id}`}
            >
              <span>{title}</span><ChevronDown />
            </button>
            <div className="faq-answer" id={`accordion-panel-${id}`} role="region" aria-labelledby={`accordion-question-${id}`}>
              <p>{content}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
