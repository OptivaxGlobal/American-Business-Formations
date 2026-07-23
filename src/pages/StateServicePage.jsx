import { ArrowRight, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { services } from '../data/services'
import { statesConfig } from '../data/statesConfig'
import { useApp } from '../context/AppContext'
import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { serviceSchema, breadcrumbSchema } from '../data/seo'

export default function StateServicePage(){
  const { state: stateSlug } = useParams()
  const { setSelectedState } = useApp()
  const service = services['llc-formation']
  const stateEntry = Object.values(statesConfig).find(s => s.name.toLowerCase().replace(/\s+/g,'-') === stateSlug)
  if (!stateEntry) return <Navigate to="/404" replace />
  const path = `/llc-formation/${stateSlug}`

  return <>
    <SEO
      title={`LLC Formation in ${stateEntry.name}`}
      description={`Start an LLC in ${stateEntry.name} with a guided intake, ${stateEntry.sampleFee ? `a sample state fee of $${stateEntry.sampleFee}` : 'state fee details confirmed during onboarding'}, and organized next steps.`}
      path={path}
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [
          serviceSchema({ name: `LLC Formation in ${stateEntry.name}`, description: service.short, path }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'LLC Formation', path: '/llc-formation' }, { name: stateEntry.name }])
        ].map(({ '@context': _drop, ...rest }) => rest)
      }}
    />
    <PageHero
      crumbs={<Breadcrumbs items={[{ label: 'LLC Formation', to: '/llc-formation' }, { label: stateEntry.name }]} />}
      eyebrow={<><MapPin size={17}/> LLC Formation in {stateEntry.name}</>}
      title={`Start your ${stateEntry.name} LLC with a clear, guided process`}
      description={`Prepare your ${stateEntry.name} formation details, organize filing information, and track the journey in one place.`}
      actions={<Link className="btn btn-primary" to="/start" onClick={()=>setSelectedState(stateEntry.name)}>Start my {stateEntry.name} LLC <ArrowRight size={18}/></Link>}
      visual={<img src={service.image} alt=""/>}
    />

    <section className="section"><div className="container">
      <div className="section-heading centered"><span>{stateEntry.name} filing snapshot</span><h2>What to expect</h2></div>
      <div className="stats-grid">
        <div><strong>{stateEntry.sampleFee ? `$${stateEntry.sampleFee}` : 'Varies'}</strong><span>Sample state filing fee</span></div>
        <div><strong>{stateEntry.sampleProcessingTime || 'Varies'}</strong><span>Sample processing time</span></div>
        <div><strong>{stateEntry.verified ? 'Verified' : 'Unverified'}</strong><span>Data verification status</span></div>
      </div>
      {!stateEntry.verified && <Reveal as="p" className="onboarding-note state-verify-note"><ShieldCheck size={15}/> This fee and processing information is a sample placeholder and has not been verified against {stateEntry.name}&rsquo;s Secretary of State. Confirm current requirements before filing.</Reveal>}
    </div></section>

    <section className="section soft-section"><div className="container"><div className="section-heading centered"><span>Included in every plan</span><h2>What your {stateEntry.name} LLC formation covers</h2></div><ul className="check-list state-feature-list">{service.features.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul></div></section>

    <section className="cta-band"><div className="container"><div><span>Ready to continue?</span><h2>Start your {stateEntry.name} LLC formation today.</h2></div><Link className="btn btn-gold" to="/start" onClick={()=>setSelectedState(stateEntry.name)}>Begin guided setup <ArrowRight size={18}/></Link></div></section>
  </>
}
