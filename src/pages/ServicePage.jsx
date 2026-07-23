import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { services } from '../data/services'
import StateSelector from '../components/StateSelector'
import FAQ from '../components/FAQ'
import ServiceGrid from '../components/ServiceGrid'
import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { serviceSchema, breadcrumbSchema, faqSchema } from '../data/seo'

export default function ServicePage({ forcedSlug }) {
  const params = useParams()
  const slug = forcedSlug || params.slug
  const service = services[slug]
  if (!service) return <Navigate to="/404" replace />
  const Icon = service.icon
  const path = `/${slug}`

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
        <div className="hero-actions"><Link className="btn btn-primary" to="/start">Get started <ArrowRight size={18}/></Link><Link className="btn btn-outline" to="/contact">Talk to our team</Link></div>
        <div className="mini-proof"><span><CheckCircle2/> Guided intake</span><span><CheckCircle2/> Secure dashboard</span><span><CheckCircle2/> Flask-ready workflow</span></div>
      </>}
      visual={<><img src={service.image} alt=""/><div className="service-visual-card"><Icon/><span><small>Selected service</small><strong>{service.title.split(' ').slice(0,5).join(' ')}</strong></span></div></>}
    />

    <section className="section"><div className="container split-grid"><Reveal as="div" delay={0} className="content-panel"><div className="section-heading"><span>What is included</span><h2>A practical workflow from intake to completion</h2></div><p>{service.short}</p><ul className="check-list">{service.features.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul></Reveal><Reveal as="div" delay={1} className="info-card"><h3>Start with your state</h3><p>Choose the state connected to your business request. This selection carries into the onboarding experience.</p><StateSelector compact/></Reveal></div></section>

    <section className="section soft-section"><div className="container"><div className="section-heading centered"><span>How it works</span><h2>Three clear steps</h2></div><div className="steps-grid">{service.steps.map(([title, body], index) => <Reveal as="article" delay={index} key={title}><div>{String(index + 1).padStart(2,'0')}</div><h3>{title}</h3><p>{body}</p></Reveal>)}</div></div></section>

    <section className="section"><div className="container"><div className="section-heading centered"><span>Explore more</span><h2>Business tools that work together</h2></div><ServiceGrid limit={6}/></div></section>
    <FAQ items={service.faq}/>
    <section className="cta-band"><div className="container"><div><span>Ready to continue?</span><h2>Start your {slug.replaceAll('-', ' ')} request today.</h2></div><Link className="btn btn-gold" to="/start">Begin guided setup <ArrowRight size={18}/></Link></div></section>
  </>
}
