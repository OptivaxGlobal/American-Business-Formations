import ServiceGrid from '../components/ServiceGrid'
import PageHero from '../components/PageHero'
import SEO from '../components/SEO'
export default function Services(){return <>
  <SEO title="All Services" description="Formation, compliance, finance, operations, and brand-building workflows in one frontend project." path="/services" />
  <PageHero eyebrow="All services" title="Everything needed to start and support a business" description="Formation, compliance, finance, operations, and brand-building workflows in one frontend project." />
  <section className="section"><div className="container"><ServiceGrid/></div></section>
</>}
