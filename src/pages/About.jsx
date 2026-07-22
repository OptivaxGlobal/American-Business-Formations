import { ArrowRight, CheckCircle2, HeartHandshake, Lightbulb, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'

export default function About(){
  return <>
    <PageHero
      eyebrow="About American Business Formations"
      title="Business setup should feel clear, not intimidating."
      description="We designed a modern experience that helps founders understand the next step, keep information organized, and access the services required to launch responsibly."
      actions={<Link className="btn btn-primary" to="/start">Start your business <ArrowRight size={18}/></Link>}
      visual={<img src="/illustrations/hero-business.svg" alt="Business founder illustration"/>}
    />
    <section className="section"><div className="container split-grid"><Reveal as="div" delay={0} className="image-panel"><img src="/illustrations/dashboard-preview.svg" alt="Client dashboard illustration"/></Reveal><Reveal as="div" delay={1} className="content-panel"><div className="section-heading"><span>Our purpose</span><h2>Make complex steps easier to understand and manage</h2></div><p>Founders are often forced to jump between government pages, spreadsheets, email threads, and service providers. American Business Formations brings the intake, status, records, reminders, and recommended actions into one consistent interface.</p><ul className="check-list"><li><CheckCircle2/> Clear language and focused questions</li><li><CheckCircle2/> One account for records and status</li><li><CheckCircle2/> Flexible service architecture</li></ul></Reveal></div></section>
    <section className="section soft-section"><div className="container"><div className="section-heading centered"><span>What guides us</span><h2>Built around founder confidence</h2></div><div className="values-grid">
      <Reveal as="article" delay={0}><Lightbulb/><h3>Clarity</h3><p>We explain the purpose of each step and keep forms focused.</p></Reveal>
      <Reveal as="article" delay={1}><ShieldCheck/><h3>Responsibility</h3><p>We include honest disclaimers and avoid presenting general information as legal advice.</p></Reveal>
      <Reveal as="article" delay={2}><HeartHandshake/><h3>Support</h3><p>The user experience always provides a clear route to help.</p></Reveal>
      <Reveal as="article" delay={3}><Users/><h3>Accessibility</h3><p>Responsive layouts, readable typography, and logical navigation are included throughout.</p></Reveal>
    </div></div></section>
    <section className="section"><div className="container stats-grid"><div><strong>20+</strong><span>service workflows</span></div><div><strong>50</strong><span>state options</span></div><div><strong>100%</strong><span>responsive frontend</span></div><div><strong>Flask</strong><span>API-ready structure</span></div></div></section>
  </>
}
