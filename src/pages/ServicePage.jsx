import { ArrowRight, CheckCircle2, Info, ShieldAlert } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { services, getRelatedServices, serviceDisclaimer } from '../data/services'
import { getServicePricing } from '../data/pricing'
import FAQ from '../components/FAQ'
import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import BusinessNameStartForm from '../components/BusinessNameStartForm'
import PricingCards from '../components/PricingCards'
import AddressServiceComparison from '../components/AddressServiceComparison'
import { Card, SectionHeading } from '../components/ui'
import { serviceSchema, breadcrumbSchema, faqSchema } from '../data/seo'

// Intrinsic SVG canvas sizes (from each file's viewBox) so the <img> can
// declare width/height and avoid a layout shift while it loads.
const ILLUSTRATION_DIMENSIONS = {
  '/illustrations/hero-business.svg': [720, 560],
  '/illustrations/dashboard-preview.svg': [760, 520],
  '/illustrations/compliance.svg': [640, 500],
  '/illustrations/registered-agent.svg': [620, 500],
  '/illustrations/banking.svg': [640, 500]
}

export default function ServicePage({ forcedSlug }) {
  const params = useParams()
  const slug = forcedSlug || params.slug
  const service = services[slug]
  if (!service) return <Navigate to="/404" replace />
  const Icon = service.icon
  const path = `/${slug}`
  const related = getRelatedServices(slug)
  const pricing = getServicePricing(slug)
  const hasPricingFacts = Boolean(pricing.addOn) || pricing.governmentFee !== null || Boolean(pricing.governmentFeeRange)

  return <>
    <SEO
      title={service.title}
      description={service.short}
      path={path}
      // Inactive services (services.js `isActive: false`) are real,
      // reachable routes kept out of nav/footer/sitemap per that file's
      // own comment but they describe intake tools that aren't launched
      // yet. Keep them out of search results until launched, same reasoning
      // as unpublished resource articles.
      noindex={!service.isActive}
      follow
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [
          serviceSchema({ name: service.title, description: service.short, path }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, { name: service.title }]),
          faqSchema(service.faq)
        ].map(({ '@context': _drop, ...rest }) => rest)
      }}
    />
    <PageHero
      crumbs={<Breadcrumbs items={[{ label: 'Services', to: '/services' }, { label: service.title }]} />}
      eyebrow={<><Icon size={17}/>{service.eyebrow}</>}
      title={service.title}
      description={service.intro}
      actions={<>
        <div className="hero-actions">
          <Link className="btn btn-primary" to={slug === 'llc-formation' ? '/formation-details' : '/start'}>Get started <ArrowRight size={18}/></Link>
          <Link className="btn btn-outline" to="/contact">Talk to our team</Link>
        </div>
        <div className="mini-proof">
          <span><CheckCircle2/> Guided intake</span>
          <span><CheckCircle2/> Secure dashboard</span>
          <span><CheckCircle2/> {service.automated ? 'Guided workflow' : 'Human-reviewed request'}</span>
        </div>
      </>}
      visual={<><img src={service.image} alt="" width={ILLUSTRATION_DIMENSIONS[service.image]?.[0]} height={ILLUSTRATION_DIMENSIONS[service.image]?.[1]}/><div className="service-visual-card"><Icon/><span><small>Service</small><strong>{service.eyebrow}</strong></span></div></>}
    />

    {/* Price, government fee, and recurring-cost breakdown always sourced
        from src/data/pricing.js so this can never drift from the numbers
        shown during onboarding checkout. */}
    <section className="section"><div className="container narrow">
      <Card>
        <div className="service-pricing-head"><span>Pricing</span><h3>What this service costs</h3></div>
        {hasPricingFacts ? (
          <div className="order-breakdown">
            <div>
              <span>Service price</span>
              {pricing.addOn
                ? <strong>${pricing.addOn.price}{pricing.addOn.recurring ? ` (${pricing.addOn.recurring})` : ''}</strong>
                : <strong>Included in your formation package <Link to="/pricing">See plans</Link></strong>}
            </div>
            {pricing.secondaryAddOn && (
              <div>
                <span>{pricing.secondaryAddOnLabel || pricing.secondaryAddOn.name}</span>
                <strong>${pricing.secondaryAddOn.price}{pricing.secondaryAddOn.recurring ? ` (${pricing.secondaryAddOn.recurring})` : ''}</strong>
              </div>
            )}
            {pricing.governmentFee !== null && (
              <div>
                <span>Government filing fee</span>
                <strong>{pricing.governmentFee === 0 ? 'No cost (paid directly to the IRS)' : `$${pricing.governmentFee}`}</strong>
              </div>
            )}
            {pricing.governmentFeeRange && (
              <div>
                <span>State filing fee</span>
                <strong>${pricing.governmentFeeRange.min}&ndash;${pricing.governmentFeeRange.max}<small> (varies by state)</small></strong>
              </div>
            )}
          </div>
        ) : (
          <p>Priced as part of your formation package. <Link to="/pricing">See plan pricing</Link> your state's filing fee is always itemized separately at checkout, based on the state you select.</p>
        )}
        {pricing.governmentFeeNote && <p className="onboarding-note"><Info size={15}/> {pricing.governmentFeeNote}</p>}
      </Card>
    </div></section>

    <section className="section"><div className="container split-grid">
      <Reveal as="div" delay={0} className="content-panel">
        <SectionHeading eyebrow="What is included" title="A practical workflow from intake to completion" />
        <p>{service.short}</p>
        <ul className="check-list">{service.features.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul>
      </Reveal>
      <Reveal as="div" delay={1} className="info-card">
        <h3>Who typically needs this</h3>
        <p>{service.whoNeeds}</p>
        <BusinessNameStartForm compact buttonText="Start My LLC" source={`service_${slug}`} />
      </Reveal>
    </div></section>

    <section className="section soft-section"><div className="container">
      <SectionHeading centered eyebrow="Why it matters" title="Benefits of getting this right" />
      <div className={`values-grid${service.benefits.length <= 3 ? ' values-grid-3' : ''}`}>
        {service.benefits.map(item => <article key={item}><CheckCircle2/><p>{item}</p></article>)}
      </div>
    </div></section>

    <section className="section"><div className="container">
      <SectionHeading centered eyebrow="How it works" title="Three clear steps" />
      <div className="steps-grid">{service.steps.map(([title, body], index) => <Reveal as="article" delay={index} key={title}><div>{String(index + 1).padStart(2,'0')}</div><h3>{title}</h3><p>{body}</p></Reveal>)}</div>
    </div></section>

    <section className="section soft-section"><div className="container split-grid">
      <Reveal as="div" delay={0}>
        <SectionHeading eyebrow="What's included" title="Covered in this service" />
        <ul className="check-list">{service.included.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul>
      </Reveal>
      <Reveal as="div" delay={1} className="alert-banner warning" style={{ alignSelf: 'start' }}>
        <ShieldAlert size={20}/>
        <div>
          <strong>Important limitations</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {service.limitations.map(item => <li key={item} style={{ marginBottom: 6 }}>{item}</li>)}
          </ul>
        </div>
      </Reveal>
    </div></section>

    {slug === 'business-formation-filings' && <section className="section soft-section"><div className="container">
      <SectionHeading centered eyebrow="Formation packages" title="Prefer a complete package instead?" description="These packages bundle formation with the registered agent, compliance, and EIN services most new businesses need in year one." />
      <PricingCards/>
    </div></section>}

    {slug === 'mail-forwarding' && <section className="section soft-section"><div className="container">
      <SectionHeading centered eyebrow="Compare" title="Virtual Office vs. Mail Forwarding" description="Need a lease agreement with your business address? Choose Virtual Office instead." />
      <AddressServiceComparison current="mail-forwarding"/>
    </div></section>}

    <FAQ items={service.faq}/>

    {related.length > 0 && <section className="section"><div className="container">
      <SectionHeading centered eyebrow="Related services" title="Often used together" />
      <div className={`service-grid service-grid--${related.length}`}>
        {related.map(item => {
          const RelIcon = item.icon
          return <Link key={item.slug} to={`/${item.slug}`} className="service-card">
            <div className="service-icon"><RelIcon/></div>
            <h3>{item.eyebrow}</h3><p>{item.short}</p><span>Explore service <ArrowRight size={16}/></span>
          </Link>
        })}
      </div>
    </div></section>}

    <section className="section"><div className="container narrow">
      <div className="alert-banner info"><Info size={20}/><p style={{ margin: 0 }}>{serviceDisclaimer}</p></div>
    </div></section>

    <div className="closing-cta">
      <div className="container closing-cta-inner">
        <div><span>Ready to continue?</span><h2>Start your {service.eyebrow} request today.</h2></div>
        <BusinessNameStartForm compact buttonText="Start My LLC" source={`service_${slug}_closing`} />
      </div>
    </div>
  </>
}
