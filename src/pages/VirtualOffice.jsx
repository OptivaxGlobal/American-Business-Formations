import { ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import FAQ from '../components/FAQ'
import AddressServiceComparison from '../components/AddressServiceComparison'
import SupportedStatesList from '../components/SupportedStatesList'
import { SectionHeading } from '../components/ui'
import { services, serviceDisclaimer } from '../data/services'
import { getAddOn } from '../data/pricing'
import { breadcrumbSchema, faqSchema, serviceSchema } from '../data/seo'
import { virtualOfficeStateList } from '../data/states'

const HOW_IT_WORKS = [
  ['Choose your state', 'Available across all 21 states we support for LLC formation.'],
  ['Complete your order', 'Sign up for Virtual Office at $49 per month, per entity.'],
  ['Receive your suite number', 'Typically assigned within 1–2 business days not a guaranteed timeframe.'],
  ['Receive digitized mail', 'Every piece is scanned and uploaded for secure online viewing.'],
  ['Request original documents when needed', 'Physical shipment is available on request; separate shipping and handling charges apply.']
]

export default function VirtualOffice() {
  const service = services['virtual-office']
  const addOn = getAddOn('virtual-office')
  const path = '/virtual-office'

  return <>
    <SEO
      title="Virtual Office Address with Lease Agreement"
      description="A professional virtual office address with a unique suite number, a signed lease agreement, and unlimited digital mail access for $49 per month, across 21 states."
      path={path}
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [
          serviceSchema({ name: 'Virtual Office', description: service.short, path }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: 'Virtual Office' }]),
          faqSchema(service.faq)
        ].map(({ '@context': _drop, ...rest }) => rest)
      }}
    />

    {/* 1. Hero */}
    <PageHero
      crumbs={<Breadcrumbs items={[{ label: 'Services', to: '/services' }, { label: 'Virtual Office' }]} />}
      eyebrow="Business address services"
      title="Professional virtual office address for your business"
      description="A unique suite number, a signed lease agreement, and unlimited digital mail access, available in 21 states."
      actions={<>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/formation-details">Get Virtual Office ${addOn.price}/month <ArrowRight size={18}/></Link>
          <Link className="btn btn-outline" to="/mail-forwarding">Compare address services</Link>
        </div>
        <div className="mini-proof">
          <span><CheckCircle2/> Lease agreement included</span>
          <span><CheckCircle2/> Unlimited mail scanning</span>
          <span><CheckCircle2/> Available in 21 states</span>
        </div>
      </>}
      visual={<img src={service.image} alt="" width={620} height={500}/>}
    />

    {/* 2. What's included */}
    <section className="section"><div className="container narrow">
      <SectionHeading centered eyebrow="What's included" title={`Everything in your $${addOn.price}/month Virtual Office`} />
      <ul className="check-list">{service.features.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul>
    </div></section>

    {/* 3. How it works */}
    <section className="section soft-section"><div className="container">
      <SectionHeading centered eyebrow="How it works" title="Five simple steps" />
      <div className="steps-grid">{HOW_IT_WORKS.map(([title, body], index) => (
        <Reveal as="article" delay={index} key={title}>
          <div>{String(index + 1).padStart(2, '0')}</div><h3>{title}</h3><p>{body}</p>
        </Reveal>
      ))}</div>
    </div></section>

    {/* 4. Available in 21 states */}
    <section className="section"><div className="container narrow">
      <SectionHeading centered eyebrow="Coverage" title="Available in 21 supported states" description="Virtual Office is offered in these 21 states. LLC Formation and Registered Agent are available more broadly, across all 50 states, Washington, D.C. & Puerto Rico." />
      <SupportedStatesList list={virtualOfficeStateList}/>
    </div></section>

    {/* 5. Virtual Office vs Mail Forwarding */}
    <section className="section soft-section"><div className="container">
      <SectionHeading centered eyebrow="Compare" title="Virtual Office vs. Mail Forwarding" description="Need a lease agreement with your business address? That's the difference." />
      <AddressServiceComparison current="virtual-office"/>
    </div></section>

    {/* 6. FAQ */}
    <FAQ items={service.faq}/>

    <section className="section"><div className="container narrow">
      <div className="alert-banner info"><Info size={20}/><p style={{ margin: 0 }}>{serviceDisclaimer} Shipping and handling charges for physically forwarded original documents are separate from the monthly subscription price; international shipments outside the United States may incur additional charges.</p></div>
    </div></section>

    {/* 7. Final CTA */}
    <div className="closing-cta">
      <div className="container closing-cta-inner">
        <div><span>Ready to get started?</span><h2>Establish your professional business presence.</h2></div>
        <Link className="btn btn-primary" to="/formation-details">Get Virtual Office ${addOn.price}/month <ArrowRight size={18}/></Link>
      </div>
    </div>
  </>
}
