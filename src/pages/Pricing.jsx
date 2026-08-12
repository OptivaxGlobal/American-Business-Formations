import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PricingCards from '../components/PricingCards'
import AddOnPricingCards from '../components/AddOnPricingCards'
import StateFeeCalculator from '../components/StateFeeCalculator'
import FAQ from '../components/FAQ'
import BusinessNameStartForm from '../components/BusinessNameStartForm'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/ui'
import { faqSchema } from '../data/seo'
import { getFilingFeeRange } from '../data/states'

export default function Pricing() {
  const filingFeeRange = getFilingFeeRange()
  const faqs = [
    ['Are state filing fees included in the plan price?', 'No. Your state’s filing fee is always shown separately from our service fee, both on this page and at checkout, so you always know exactly what goes to the state and what goes to us.'],
    ['Do state filing fees vary?', `Yes. LLC formation is available in 21 states, and each state sets its own filing fee currently ranging from $${filingFeeRange.min} to $${filingFeeRange.max}. Use the calculator below to see the fee for your state, or select your state during onboarding to see the exact amount.`],
    ['Can plan pricing change?', 'Plan prices are centrally configured and can be updated by an administrator without a code change. Prices shown are current as of your visit; always confirm the total at checkout before paying.'],
    ['How does checkout work?', 'Checkout uses a secure, server-verified payment flow. Card details are never stored on our servers, and your order is only marked paid after payment is confirmed by our payment provider.'],
    ['Can I add individual services instead of a full package?', 'Yes. Every service has its own page and can be added independently during onboarding or from your dashboard after your LLC is formed.']
  ]
  return <>
    <SEO title="Plans & Pricing" description="Transparent LLC formation pricing across 21 states service fees and state filing fees always shown separately." path="/pricing" jsonLd={faqSchema(faqs)} />
    <PageHero eyebrow="Plans & pricing" title="A clear plan for your LLC" description="Every price below is our service fee. Your state's filing fee is always shown separately, never bundled in a way that hides what goes to the state." actions={<BusinessNameStartForm compact buttonText="Start My LLC" source="pricing_hero"/>} />
    <section className="section"><div className="container"><PricingCards/><Reveal as="div" delay={3} className="pricing-note"><CheckCircle2/><span><strong>Transparent setup:</strong> plan prices reflect our current configured rates, and state fees are always shown separately.</span></Reveal></div></section>
    <section className="section soft-section">
      <div className="container">
        <SectionHeading centered eyebrow="See your total" title="Estimate your state filing fee" description="Available in 21 states each has its own government filing fee. Select a state and package to see an estimate the exact total is always confirmed again at checkout." />
        <StateFeeCalculator/>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <SectionHeading centered eyebrow="A la carte" title="Individual services, priced separately" description="Add exactly what your business needs, at the price shown below." />
        <AddOnPricingCards/>
      </div>
    </section>
    <section className="section"><div className="container split-grid"><Reveal as="div" delay={0}><div className="section-heading"><span>Need a custom combination?</span><h2>Build around the services your business needs</h2></div><p>Each service also has its own page registered agent, business formation filings, compliance filings, EIN &amp; S-Corp elections, S-Corp election alone, apostille services, Certificate of Good Standing, mail forwarding, virtual office, operating agreement, DBA filing, and formation documents.</p><Link className="btn btn-primary" to="/services">Browse all services <ArrowRight size={18}/></Link></Reveal><Reveal as="div" delay={1} className="image-panel"><img src="/illustrations/compliance.svg" alt="Compliance service illustration" width="640" height="500" loading="lazy"/></Reveal></div></section>
    <FAQ items={faqs}/>
  </>
}
