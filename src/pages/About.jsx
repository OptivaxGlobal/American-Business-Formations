import { ArrowRight, CheckCircle2, HeartHandshake, Lightbulb, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'

export default function About(){
  return <>
    <SEO
      title="About Us"
      description="We designed a modern experience that helps founders understand the next step, keep information organized, and access the services required to launch responsibly."
      path="/about"
    />
    <PageHero
      eyebrow="About American Business Formations"
      title="Business setup should feel clear, not intimidating."
      description="We designed a modern experience that helps founders understand the next step, keep information organized, and access the services required to launch responsibly."
      actions={<Link className="btn btn-primary" to="/formation-details">Start My LLC <ArrowRight size={18}/></Link>}
      visual={<img src="/illustrations/hero-business.svg" alt="Business founder illustration" width="720" height="560"/>}
    />
    <section className="section"><div className="container split-grid"><Reveal as="div" delay={0} className="image-panel"><img src="/illustrations/dashboard-preview.svg" alt="Client dashboard illustration" width="760" height="520" loading="lazy"/></Reveal><Reveal as="div" delay={1} className="content-panel"><div className="section-heading"><span>Our purpose</span><h2>Make complex steps easier to understand and manage</h2></div><p>Founders are often forced to jump between government pages, spreadsheets, email threads, and service providers. American Business Formations brings the intake, status, records, reminders, and recommended actions into one consistent interface.</p><ul className="check-list"><li><CheckCircle2/> Clear language and focused questions</li><li><CheckCircle2/> One account for records and status</li><li><CheckCircle2/> Flexible service architecture</li></ul></Reveal></div></section>
    <section className="section soft-section"><div className="container"><div className="section-heading centered"><span>What guides us</span><h2>Built around founder confidence</h2></div><div className="values-grid">
      <Reveal as="article" delay={0}><Lightbulb/><h3>Clarity</h3><p>We explain the purpose of each step and keep forms focused.</p></Reveal>
      <Reveal as="article" delay={1}><ShieldCheck/><h3>Responsibility</h3><p>We include honest disclaimers and avoid presenting general information as legal advice.</p></Reveal>
      <Reveal as="article" delay={2}><HeartHandshake/><h3>Support</h3><p>The user experience always provides a clear route to help.</p></Reveal>
      <Reveal as="article" delay={3}><Users/><h3>Accessibility</h3><p>Responsive layouts, readable typography, and logical navigation are included throughout.</p></Reveal>
    </div></div></section>
    <section className="section"><div className="container stats-grid"><div><strong>7</strong><span>guided formation & compliance services</span></div><div><strong>1</strong><span>state served, done right</span></div><div><strong>100%</strong><span>responsive on any device</span></div><div><strong>2</strong><span>fees always itemized separately</span></div></div></section>
    <section className="section soft-section"><div className="container narrow" style={{textAlign:'center'}}>
      <div className="section-heading centered"><span>Legal disclosure</span><h2>What we are and what we&rsquo;re not</h2></div>
      <p style={{color:'var(--muted)'}}>American Business Formations is a business filing and document-preparation service. We are not a law firm, an accounting firm, or a government agency, and nothing on this site is legal, tax, or financial advice. State filing fees are separate from our service fees and vary by state, government approval and processing times are outside our control, and any optional service like EIN assistance can always be completed directly with the relevant government agency at no cost.</p>
    </div></section>
  </>
}
