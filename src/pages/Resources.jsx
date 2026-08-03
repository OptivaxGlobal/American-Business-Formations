import { ArrowRight, BookOpen, FileText, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { useApp } from '../context/AppContext'
import { recordLead } from '../lib/leads'
import { validateEmail } from '../validations/contactValidation'
import { fieldAria } from '../lib/formErrors'

export const posts=[
  {slug:'how-to-start-an-llc',category:'LLC Basics',title:'How to prepare for starting an LLC',excerpt:'A practical checklist of the decisions and information founders commonly organize first.',read:'7 min read'},
  {slug:'registered-agent-basics',category:'Compliance',title:'What a registered agent does for a business',excerpt:'Understand the role, common requirements, privacy considerations, and document workflows.',read:'6 min read'},
  {slug:'ein-business-tax-id',category:'Taxes',title:'EIN basics for new business owners',excerpt:'A plain-language overview of the federal tax ID and the details often collected for an application.',read:'5 min read'},
  {slug:'business-bank-readiness',category:'Finance',title:'Business bank account readiness checklist',excerpt:'Prepare formation records, tax ID details, ownership information, and address documentation.',read:'4 min read'},
  {slug:'licenses-permits-checklist',category:'Compliance',title:'How to organize license and permit research',excerpt:'Build a location and activity profile before checking federal, state, county, and city requirements.',read:'8 min read'},
  {slug:'brand-launch-checklist',category:'Branding',title:'A simple brand launch checklist for new businesses',excerpt:'Name, domain, email, logo, website, and communication basics for a credible launch.',read:'6 min read'}
]

const TOPICS = ['LLC Basics','Compliance','Taxes','Finance','Branding']

export default function Resources(){
  const { notify } = useApp()
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState(null)
  const [checklistEmail, setChecklistEmail] = useState('')
  const [checklistError, setChecklistError] = useState('')
  const [checklistSent, setChecklistSent] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(post => {
      const matchesTopic = !topic || post.category === topic
      const matchesQuery = !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q) || post.category.toLowerCase().includes(q)
      return matchesTopic && matchesQuery
    })
  }, [query, topic])

  const submitChecklist = e => {
    e.preventDefault()
    const result = validateEmail(checklistEmail, { required: true })
    if (!result.valid) { setChecklistError(result.message); return }
    setChecklistError('')
    recordLead('resource_checklist', { email: result.normalized })
    setChecklistSent(true)
    notify('Request received — we’ve saved your email for the founder launch checklist.')
  }

  return <>
  <SEO title="Resource Center" description="Educational content, checklists, and planning tools for founders." path="/resources" />
  <PageHero
    className="dark"
    eyebrow="Resource center"
    title="Practical guidance for starting and running a business"
    description="Educational content, checklists, and planning tools for founders."
    actions={<form className="resource-search" role="search" onSubmit={e => e.preventDefault()}>
      <Search aria-hidden="true"/>
      <label className="sr-only" htmlFor="resource-search-input">Search the resource library</label>
      <input id="resource-search-input" placeholder="Search the resource library" value={query} onChange={e => setQuery(e.target.value)}/>
      <button type="submit">Search</button>
    </form>}
  />
  <section className="section"><div className="container"><div className="resource-layout">
    <aside>
      <h3 id="browse-topics-heading">Browse topics</h3>
      <div role="group" aria-labelledby="browse-topics-heading" className="resource-topic-list">
        <button type="button" className={!topic ? 'active' : ''} aria-pressed={!topic} onClick={() => setTopic(null)}>All topics</button>
        {TOPICS.map(x => <button type="button" key={x} className={topic === x ? 'active' : ''} aria-pressed={topic === x} onClick={() => setTopic(x)}>{x}</button>)}
      </div>
      <div className="resource-download">
        <FileText aria-hidden="true"/>
        <h4>Founder launch checklist</h4>
        <p>Enter your email and we&rsquo;ll save your request for the founder launch checklist.</p>
        {checklistSent
          ? <p role="status">Thanks — your request has been recorded.</p>
          : <form onSubmit={submitChecklist} noValidate>
              <label className="sr-only" htmlFor="checklist-email">Email address</label>
              <input id="checklist-email" type="email" placeholder="you@example.com" value={checklistEmail} onChange={e => { setChecklistEmail(e.target.value); if (checklistError) setChecklistError('') }} {...fieldAria('checklist-email-error', checklistError)}/>
              {checklistError && <p id="checklist-email-error" className="field-error">{checklistError}</p>}
              <button type="submit" className="btn btn-primary btn-block">Get the checklist</button>
            </form>}
      </div>
    </aside>
    <div>
      <div className="section-heading"><span>Latest articles</span><h2>Start with a clear next step</h2></div>
      {filtered.length === 0
        ? <p className="dash-empty">No articles match your search. <button type="button" className="text-link" onClick={() => { setQuery(''); setTopic(null) }}>Clear filters</button></p>
        : <div className="post-grid">{filtered.map((post,index)=><Reveal as={Link} to={`/resources/${post.slug}`} className="post-card" key={post.slug} delay={index%6}><div className={`post-thumb thumb-${index+1}`}><BookOpen/></div><div><span>{post.category} • {post.read}</span><h3>{post.title}</h3><p>{post.excerpt}</p><b>Read article <ArrowRight size={16}/></b></div></Reveal>)}</div>}
    </div>
  </div></div></section>
  </>
}
