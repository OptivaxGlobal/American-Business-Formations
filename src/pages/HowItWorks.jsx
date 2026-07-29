import { ArrowRight, CheckCircle2, FileText, MessageSquare, ShieldCheck, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Breadcrumbs from '../components/Breadcrumbs'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import FAQ from '../components/FAQ'
import BusinessNameStartForm from '../components/BusinessNameStartForm'
import { breadcrumbSchema } from '../data/seo'

const stages = [
  { icon: FileText, title: '1. Tell us about your business', body: 'Enter your proposed name and answer a guided questionnaire covering your business purpose, address, ownership, and registered agent.' },
  { icon: CheckCircle2, title: '2. Choose your package', body: 'Compare formation packages and optional add-ons like registered agent service, EIN assistance, and an operating agreement. Your service fee and the state filing fee are always shown separately.' },
  { icon: ShieldCheck, title: '3. We prepare your filing', body: 'Your Certificate of Formation is prepared from your answers and reviewed internally before it’s submitted to the Texas Secretary of State.' },
  { icon: Timer, title: '4. Track state processing', body: 'Follow real status updates from submission through state review we never mark a filing as approved until the state confirms it.' },
  { icon: MessageSquare, title: '5. Manage your business going forward', body: 'Your dashboard keeps documents, compliance reminders, and support in one place as your LLC operates and grows.' }
]

const faqs = [
  ['How long does LLC formation take?', 'It depends on the Texas Secretary of State’s current processing volume and whether you choose standard or expedited processing. Your dashboard always shows the current estimate and real status once filed.'],
  ['What happens after I submit my information?', 'We review your answers for completeness and accuracy, prepare your Certificate of Formation, and submit it to the Texas Secretary of State. You can track each stage from your dashboard.'],
  ['Can I make changes after I submit?', 'Yes, as long as your filing hasn’t already been submitted to the state. Contact support if you need to update information after submission.'],
  ['Is my information secure?', 'We use secure, server-verified authentication and never store sensitive identifiers like Social Security Numbers through this website’s standard forms.']
]

export default function HowItWorks() {
  return <>
    <SEO title="How It Works" description="See exactly how American Business Formations takes your Texas LLC from a business name to a filed Certificate of Formation." path="/how-it-works" jsonLd={breadcrumbSchema([{ name: 'How It Works' }])} />
    <PageHero
      crumbs={<Breadcrumbs items={[{ label: 'How It Works' }]} />}
      eyebrow="How it works"
      title="From business name to filed LLC"
      description="A guided, transparent process no confusing government forms, no hidden fees, and no false promises about how fast the state will move."
      actions={<Link className="btn btn-primary" to="/formation-details">Start My LLC <ArrowRight size={18}/></Link>}
    />
    <section className="section"><div className="container">
      <div className="steps-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}>
        {stages.map((s, i) => {
          const Icon = s.icon
          return <Reveal as="article" delay={i%4} key={s.title}><div><Icon size={20}/></div><h3>{s.title}</h3><p>{s.body}</p></Reveal>
        })}
      </div>
    </div></section>
    <section className="section soft-section"><div className="container narrow" style={{textAlign:'center'}}>
      <div className="section-heading centered"><span>Ready when you are</span><h2>See your business name become an official LLC</h2></div>
      <BusinessNameStartForm source="how_it_works" />
    </div></section>
    <FAQ items={faqs}/>
  </>
}
