import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PricingCards from '../components/PricingCards'
import FAQ from '../components/FAQ'
import StateSelector from '../components/StateSelector'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { faqSchema } from '../data/seo'

export default function Pricing() {
  const faqs = [
    ['Are state filing fees included?', 'No. State fees are charged separately and vary by state. The project includes state selection and sample fee placeholders ready for your backend rules.'],
    ['Can I change the plan pricing?', 'Yes. Plan data is centralized in src/components/PricingCards.jsx and can also be moved into Flask or a database later.'],
    ['Does this include payment processing?', 'The UI is prepared for checkout routing, but no live payment provider is connected. You can integrate Stripe or another provider through Flask.'],
    ['Can customers add individual services?', 'Yes. Each service has a dedicated page and the data structure supports add-on workflows.']
  ]
  return <>
    <SEO title="Plans & Pricing" description="Start with formation essentials or choose a broader toolkit for compliance and growth." path="/pricing" jsonLd={faqSchema(faqs)} />
    <PageHero eyebrow="Plans & pricing" title="A launch plan for every stage" description="Start with formation essentials or choose a broader toolkit for compliance and growth." actions={<StateSelector compact/>} />
    <section className="section"><div className="container"><PricingCards/><Reveal as="div" delay={3} className="pricing-note"><CheckCircle2/><span><strong>Transparent setup:</strong> plan prices are sample content and state fees are displayed separately.</span></Reveal></div></section>
    <section className="section soft-section"><div className="container split-grid"><Reveal as="div" delay={0}><div className="section-heading"><span>Need a custom combination?</span><h2>Build around the services your business needs</h2></div><p>The platform includes individual service pages for EIN, registered agent, permits, trademark, bookkeeping, banking, insurance, funding, websites, domains, email, and more.</p><Link className="btn btn-primary" to="/services">Browse all services <ArrowRight size={18}/></Link></Reveal><Reveal as="div" delay={1} className="image-panel"><img src="/illustrations/compliance.svg" alt="Compliance service illustration"/></Reveal></div></section>
    <FAQ items={faqs}/>
  </>
}
