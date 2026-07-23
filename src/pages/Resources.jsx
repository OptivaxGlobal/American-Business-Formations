import { ArrowRight, BookOpen, FileText, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'

export const posts=[
  {slug:'how-to-start-an-llc',category:'LLC Basics',title:'How to prepare for starting an LLC',excerpt:'A practical checklist of the decisions and information founders commonly organize first.',read:'7 min read'},
  {slug:'registered-agent-basics',category:'Compliance',title:'What a registered agent does for a business',excerpt:'Understand the role, common requirements, privacy considerations, and document workflows.',read:'6 min read'},
  {slug:'ein-business-tax-id',category:'Taxes',title:'EIN basics for new business owners',excerpt:'A plain-language overview of the federal tax ID and the details often collected for an application.',read:'5 min read'},
  {slug:'business-bank-readiness',category:'Finance',title:'Business bank account readiness checklist',excerpt:'Prepare formation records, tax ID details, ownership information, and address documentation.',read:'4 min read'},
  {slug:'licenses-permits-checklist',category:'Compliance',title:'How to organize license and permit research',excerpt:'Build a location and activity profile before checking federal, state, county, and city requirements.',read:'8 min read'},
  {slug:'brand-launch-checklist',category:'Branding',title:'A simple brand launch checklist for new businesses',excerpt:'Name, domain, email, logo, website, and communication basics for a credible launch.',read:'6 min read'}
]

export default function Resources(){return <>
  <SEO title="Resource Center" description="Educational content, checklists, and planning tools for founders." path="/resources" />
  <PageHero
    className="dark"
    eyebrow="Resource center"
    title="Practical guidance for starting and running a business"
    description="Educational content, checklists, and planning tools for founders."
    actions={<div className="resource-search"><Search/><input placeholder="Search the resource library"/><button>Search</button></div>}
  />
  <section className="section"><div className="container"><div className="resource-layout"><aside><h3>Browse topics</h3>{['LLC Basics','Compliance','Taxes','Finance','Branding','Growth'].map(x=><a key={x} href={`#${x}`}>{x}</a>)}<div className="resource-download"><FileText/><h4>Founder launch checklist</h4><p>A sample downloadable lead magnet area.</p><button className="btn btn-primary btn-block">Get the checklist</button></div></aside><div><div className="section-heading"><span>Latest articles</span><h2>Start with a clear next step</h2></div><div className="post-grid">{posts.map((post,index)=><Reveal as={Link} to={`/resources/${post.slug}`} className="post-card" key={post.slug} delay={index%6}><div className={`post-thumb thumb-${index+1}`}><BookOpen/></div><div><span>{post.category} • {post.read}</span><h3>{post.title}</h3><p>{post.excerpt}</p><b>Read article <ArrowRight size={16}/></b></div></Reveal>)}</div></div></div></div></section>
</>}
