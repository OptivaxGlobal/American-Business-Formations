import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export default function FAQ({ items, title = 'Frequently asked questions', searchable = false, dark = false }) {
  const [open, setOpen] = useState(0)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return items
    const q = query.trim().toLowerCase()
    return items.filter(([question, answer]) => question.toLowerCase().includes(q) || answer.toLowerCase().includes(q))
  }, [items, query, searchable])

  return (
    <section className={`section faq-section ${dark ? 'faq-dark' : ''}`}>
      <div className="container narrow">
        <div className="section-heading centered"><span>Helpful answers</span><h2>{title}</h2></div>
        {searchable && (
          <div className="faq-search">
            <Search size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a question..." aria-label="Search FAQ" />
          </div>
        )}
        <div className="faq-list">
          {filtered.map(([question, answer], index) => (
            <article className={`faq-item ${open === index ? 'open' : ''}`} key={question}>
              <button
                onClick={() => setOpen(open === index ? -1 : index)}
                aria-expanded={open === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span>{question}</span><ChevronDown />
              </button>
              <div className="faq-answer" id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`}><p>{answer}</p></div>
            </article>
          ))}
          {filtered.length === 0 && <p className="faq-empty">No questions match "{query}".</p>}
        </div>
      </div>
    </section>
  )
}
