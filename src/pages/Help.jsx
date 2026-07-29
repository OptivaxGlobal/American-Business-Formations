import { BookOpen, FileText, LifeBuoy, Mail, MessageSquare, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { breadcrumbSchema, SUPPORT_EMAIL } from '../data/seo'

const topics = [
  { icon: FileText, title: 'Formation & filing', body: 'Questions about your Certificate of Formation, name review, and filing status.', to: '/llc-formation' },
  { icon: ShieldCheck, title: 'Compliance & renewals', body: 'Public Information Report, franchise tax, and registered agent renewal questions.', to: '/texas-compliance' },
  { icon: BookOpen, title: 'Account & billing', body: 'Managing your dashboard, orders, invoices, and payment methods.', to: '/dashboard/billing' },
  { icon: MessageSquare, title: 'Talk to a person', body: 'Reach our support team directly for anything not covered here.', to: '/contact' }
]

export default function Help() {
  return <>
    <SEO title="Help Center" description="Find answers about Texas LLC formation, compliance, billing, and your American Business Formations account." path="/help" jsonLd={breadcrumbSchema([{ name: 'Help Center' }])} />
    <PageHero
      crumbs={<Breadcrumbs items={[{ label: 'Help Center' }]} />}
      eyebrow="Help center"
      title="How can we help?"
      description="Browse a topic below, check our FAQ, or reach our support team directly."
    />
    <section className="section"><div className="container">
      <div className="steps-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
        {topics.map((t, i) => {
          const Icon = t.icon
          return <Reveal as={Link} to={t.to} delay={i%4} key={t.title} className="service-card" style={{textDecoration:'none'}}>
            <div className="service-icon"><Icon size={20}/></div><h3>{t.title}</h3><p>{t.body}</p>
          </Reveal>
        })}
      </div>
    </div></section>
    <section className="section soft-section"><div className="container narrow" style={{textAlign:'center'}}>
      <LifeBuoy size={32} style={{color:'var(--blue)', margin:'0 auto 16px'}}/>
      <h2 style={{fontFamily:'var(--font-heading)', color:'var(--navy)'}}>Still need help?</h2>
      <p style={{color:'var(--muted)', marginBottom:20}}>Our support team responds by email, or you can open a ticket from your dashboard once you&rsquo;re signed in.</p>
      <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
        <a className="btn btn-primary" href={`mailto:${SUPPORT_EMAIL}`}><Mail size={18}/> Email support</a>
        <Link className="btn btn-outline" to="/contact">Contact form</Link>
        <Link className="btn btn-outline" to="/faq">Browse FAQ</Link>
      </div>
    </div></section>
  </>
}
