import { ArrowRight, CheckCircle2, Info, ShieldAlert } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { services, getRelatedServices, serviceDisclaimer } from '../data/services'
import FAQ from '../components/FAQ'
import ServiceGrid from '../components/ServiceGrid'
import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import BusinessNameStartForm from '../components/BusinessNameStartForm'
import { serviceSchema, breadcrumbSchema, faqSchema } from '../data/seo'

export default function ServicePage({ forcedSlug }) {
  const params = useParams()
  const slug = forcedSlug || params.slug
  const service = services[slug]
  if (!service) return <Navigate to="/404" replace />
  const Icon = service.icon
  const path = `/${slug}`
  const related = getRelatedServices(slug)

  return <>
    <SEO
      title={service.title}
      description={service.short}
      path={path}
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
      visual={<><img src={service.image} alt=""/><div className="service-visual-card"><Icon/><span><small>Service</small><strong>{service.eyebrow}</strong></span></div></>}
    />

    <section className="section"><div className="container split-grid">
      <Reveal as="div" delay={0} className="content-panel">
        <div className="section-heading"><span>What is included</span><h2>A practical workflow from intake to completion</h2></div>
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
      <div className="section-heading centered"><span>Why it matters</span><h2>Benefits of getting this right</h2></div>
      <div className="values-grid">
        {service.benefits.map(item => <article key={item}><CheckCircle2/><p>{item}</p></article>)}
      </div>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-heading centered"><span>How it works</span><h2>Three clear steps</h2></div>
      <div className="steps-grid">{service.steps.map(([title, body], index) => <Reveal as="article" delay={index} key={title}><div>{String(index + 1).padStart(2,'0')}</div><h3>{title}</h3><p>{body}</p></Reveal>)}</div>
    </div></section>

    <section className="section soft-section"><div className="container split-grid">
      <Reveal as="div" delay={0}>
        <div className="section-heading"><span>What's included</span><h2>Covered in this service</h2></div>
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

    <FAQ items={service.faq}/>

    {related.length > 0 && <section className="section"><div className="container">
      <div className="section-heading centered"><span>Related services</span><h2>Often used together</h2></div>
      <div className="service-grid">
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
