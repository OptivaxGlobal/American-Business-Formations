import { useState } from 'react'
import {
  ArrowRight, CalendarClock, CheckCircle2, ChevronDown, FileCheck2,
  Lock, Mail, MessageCircle, ReceiptText, ShieldCheck, Sparkles, TrendingUp, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import BusinessNameStartForm from '../components/BusinessNameStartForm'
import PricingCards from '../components/PricingCards'
import PlatformPreview from '../components/PlatformPreview'
import FAQ from '../components/FAQ'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { faqSchema, SUPPORT_EMAIL } from '../data/seo'
import { serviceGroups } from '../data/services'
import { loadTestimonials } from '../data/testimonials'

const homeFaq = [
  ['What do I need to form an LLC?', 'Generally your preferred business name, a registered agent, a registered office address, management structure, and organizer information. Our guided questionnaire walks you through each requirement in plain language.'],
  ['Is the state filing fee included in your plan prices?', 'No. The Texas state filing fee is always shown separately from our service fee, both during onboarding and at checkout, so you know exactly what goes to the state.'],
  ['How do I know my business name is available?', 'We run a preliminary name review during onboarding, but final availability is determined only by the Texas Secretary of State when your Certificate of Formation is filed. We never guarantee a name is available.'],
  ['Which states do you support?', 'LLC formation is currently available in Texas only, with the architecture in place to support more states as we grow.'],
  ['Does the platform include a client dashboard?', 'Yes. Every account includes a dashboard with formation status, documents, compliance reminders, service management, and support messaging.']
]

const featureCards = [
  { icon: FileCheck2, title: 'Guided Formation', body: 'A clear, step-by-step questionnaire instead of a blank government form.' },
  { icon: ShieldCheck, title: 'Secure Document Access', body: 'Your formation records, agreements, and receipts in one protected place.' },
  { icon: Sparkles, title: 'Registered Agent Options', body: 'Use our registered agent service or appoint your own eligible agent.' },
  { icon: ReceiptText, title: 'Clear Fee Breakdown', body: 'Your service fee and the government filing fee, always itemized separately.' },
  { icon: TrendingUp, title: 'Progress Tracking', body: 'Follow your filing from submission through approval, in real time.' },
  { icon: CalendarClock, title: 'Compliance Reminders', body: 'Never miss a filing, renewal, or reporting deadline again.' }
]

function CategoryAccordion() {
  const [open, setOpen] = useState(0)
  return (
    <div className="category-accordion">
      {serviceGroups.map((group, index) => {
        const isOpen = open === index
        return (
          <Reveal as="article" delay={index} className={`category-row ${isOpen ? 'open' : ''}`} key={group.title}>
            <button onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen}>
              <span className="category-row-label">{group.title}</span>
              <ChevronDown />
            </button>
            <div className="category-row-body">
              <div className="category-tag-row">
                {group.items.map(([slug, label]) => <Link key={slug} to={`/${slug}`}>{label}</Link>)}
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

export default function Home() {
  const reviews = loadTestimonials().filter(r => !r.placeholder)

  return <>
    <SEO
      title="LLC Formation Made Simple"
      description="American Business Formations helps you form your LLC and manage compliance through one guided platform. Currently available for Texas LLC formations."
      path="/"
      jsonLd={faqSchema(homeFaq)}
    />

    {/* Hero */}
    <section className="hero home-hero home-hero-split">
      <div className="container hero-grid">
        <Reveal as="div" className="hero-copy hero-copy-left">
          <div className="eyebrow"><Sparkles size={16}/> Business formation made simple</div>
          <h1>Make Your Business <span>Official.</span></h1>
          <p>Form your LLC through a clear, guided process and manage your important formation documents from one secure platform.</p>
          <BusinessNameStartForm source="homepage_hero" buttonText="Start My LLC" />
          <div className="hero-secondary-row">
            <div className="state-lock-badge"><Lock size={14}/> Texas</div>
            <Link to="/how-it-works" className="text-link">See How It Works <ArrowRight size={16}/></Link>
          </div>
          <p className="hero-availability-note">Currently available for Texas LLC formations.</p>
          <div className="trust-row"><ShieldCheck size={16}/> <span>Secure checkout · Guided application · Status tracking · Real support</span></div>
        </Reveal>
        <Reveal as="div" delay={1} className="hero-visual">
          <PlatformPreview/>
        </Reveal>
      </div>
    </section>

    {/* Feature cards */}
    <section className="section soft-section">
      <div className="container">
        <div className="section-heading centered"><span>Why founders choose us</span><h2>A platform built around what matters</h2></div>
        <div className="values-grid values-grid-6">
          {featureCards.map(({ icon: Icon, title, body }, i) => (
            <Reveal as="article" delay={i % 6} key={title}><Icon/><h3>{title}</h3><p>{body}</p></Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Simple process */}
    <section className="section process-section-light">
      <div className="container">
        <div className="section-heading centered"><span>A simpler path</span><h2>Four steps to a filed LLC</h2></div>
        <div className="process-grid-light">
          <Reveal as="article" delay={0}><div className="step-number-light">01</div><h3>Tell us about your business</h3><p>Enter your proposed name and answer a focused set of questions.</p></Reveal>
          <Reveal as="article" delay={1}><div className="step-number-light">02</div><h3>Select your formation services</h3><p>Choose a package and any add-ons registered agent, EIN assistance, operating agreement, and more.</p></Reveal>
          <Reveal as="article" delay={2}><div className="step-number-light">03</div><h3>Review and submit your order</h3><p>See your service fee, the state filing fee, and any add-ons broken out clearly before you pay.</p></Reveal>
          <Reveal as="article" delay={3}><div className="step-number-light">04</div><h3>Track everything from your dashboard</h3><p>Follow your Certificate of Formation from submission through approval.</p></Reveal>
        </div>
        <div className="center-action"><Link className="btn btn-primary" to="/formation-details">Start My LLC <ArrowRight size={18}/></Link></div>
      </div>
    </section>

    {/* Service categories */}
    <section className="section">
      <div className="container">
        <div className="section-heading centered"><span>Formation & support</span><h2>Everything you need, organized in one place</h2><p>Start with formation, then stay on top of what comes next.</p></div>
        <CategoryAccordion />
        <div className="center-action"><Link className="btn btn-outline" to="/services">View all services <ArrowRight size={18}/></Link></div>
      </div>
    </section>

    {/* Comparison */}
    <section className="section compare-section">
      <div className="container">
        <div className="section-heading centered"><span>Why go guided</span><h2>Filing on your own is possible this makes it easier</h2></div>
        <div className="compare-grid">
          <Reveal as="div" delay={0} className="compare-card highlight">
            <h3>With American Business Formations</h3>
            <ul className="check-list">
              <li><CheckCircle2/> A guided questionnaire built for state requirements</li>
              <li><CheckCircle2/> Registered agent, EIN, and compliance reminders in one place</li>
              <li><CheckCircle2/> One dashboard for status, documents, and support</li>
              <li><CheckCircle2/> Transparent, itemized pricing</li>
            </ul>
            <Link className="btn btn-primary" to="/formation-details">Get started</Link>
          </Reveal>
          <Reveal as="div" delay={1} className="compare-card">
            <h3>Filing directly with the state</h3>
            <ul className="check-list muted-list">
              <li><X/> Navigate government forms and terminology yourself</li>
              <li><X/> Track renewal and tax deadlines manually</li>
              <li><X/> Coordinate registered agent, EIN, and banking separately</li>
              <li><X/> No guided dashboard for status or documents</li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>

    {/* Pricing preview */}
    <section className="section pricing-section">
      <div className="container"><div className="section-heading centered"><span>Flexible plans</span><h2>Choose the plan that fits your business</h2><p>Prices shown are our service fee. The state filing fee is always itemized separately.</p></div><PricingCards/></div>
    </section>

    {/* Testimonials */}
    <section className="section testimonials-section">
      <div className="container">
        <div className="section-heading centered"><span>Founder stories</span><h2>What our customers say</h2></div>
        {reviews.length > 0
          ? <Reveal as="div" className="testimonial-carousel"><article><p>&ldquo;{reviews[0].quote}&rdquo;</p><div className="person"><div>{reviews[0].name?.[0]}</div><span><strong>{reviews[0].name}</strong><small>{reviews[0].role}</small></span></div></article></Reveal>
          : <div className="alert-banner info" style={{ maxWidth: 640, margin: '0 auto' }}><MessageCircle size={20}/><p style={{ margin: 0 }}>We don&rsquo;t publish reviews until we can verify they&rsquo;re from real customers so this section is honestly empty for now. Read <Link to="/about">how we work</Link> instead.</p></div>}
      </div>
    </section>

    {/* Help / support */}
    <section className="section help-section">
      <div className="container help-grid">
        <Reveal as="div" delay={0} className="help-copy">
          <div className="section-heading"><span>We&rsquo;re here to help</span><h2>Questions about forming your LLC?</h2><p>Reach our support team by email, or use the chat button in the corner of your screen.</p></div>
          <Link className="btn btn-primary" to="/contact">Talk to our team <ArrowRight size={18}/></Link>
        </Reveal>
        <Reveal as="div" delay={1} className="help-visual">
          <div className="help-phone-card">
            <Mail size={20}/>
            <span>American Business Formations</span>
            <strong style={{fontSize:'1.1rem'}}>{SUPPORT_EMAIL}</strong>
            <small>We respond during business hours</small>
          </div>
        </Reveal>
      </div>
    </section>

    <div className="faq-cta-wrap">
      <FAQ items={homeFaq} searchable dark />
      <div className="closing-cta">
        <Reveal as="div" className="container closing-cta-inner">
          <div><span>Every plan includes support and status tracking</span><h2>Turn your business idea into a filed LLC.</h2></div>
          <BusinessNameStartForm source="homepage_closing_cta" compact buttonText="Start My LLC" />
        </Reveal>
      </div>
    </div>
  </>
}
