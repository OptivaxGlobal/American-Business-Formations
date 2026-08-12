import {
  ArrowRight, CalendarClock, CheckCircle2, FileCheck2,
  Lock, Mail, MessageCircle, ReceiptText, ShieldCheck, Sparkles, TrendingUp, X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BusinessNameStartForm from '../components/BusinessNameStartForm'
import PricingCards from '../components/PricingCards'
import AddOnPricingCards from '../components/AddOnPricingCards'
import PlatformPreview from '../components/PlatformPreview'
import ServiceGrid from '../components/ServiceGrid'
import FAQ from '../components/FAQ'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/ui'
import { faqSchema, SUPPORT_EMAIL } from '../data/seo'
import { getTexasConfig } from '../config/texas'
import { getFilingFeeRange } from '../data/states'
import SupportedStatesList from '../components/SupportedStatesList'
import { api } from '../lib/api'

const texas = getTexasConfig()
const filingFeeRange = getFilingFeeRange()

const homeFaq = [
  ['What do I need to form an LLC?', 'Generally your preferred business name, a registered agent, a registered office address, management structure, and organizer information. Our guided questionnaire walks you through each requirement in plain language.'],
  ['Is the state filing fee included in your plan prices?', 'No. The government filing fee for your selected state is always shown separately from our service fee, both during onboarding and at checkout, so you know exactly what goes to the state.'],
  ['How do I know my business name is available?', 'We run a preliminary name review during onboarding, but final availability is determined only by your state’s Secretary of State (or equivalent filing authority) when your formation document is filed. We never guarantee a name is available.'],
  ['Which states do you support?', `LLC formation is currently available in 21 states. Choose your state during onboarding the state filing fee (currently $${filingFeeRange.min}–$${filingFeeRange.max} depending on the state) updates automatically. Business Formation Filings, our Registered Agent, and compliance services can extend to other states on request.`],
  ['Does the platform include a client dashboard?', 'Yes. Every account includes a dashboard with formation status, documents, compliance reminders, service management, and support messaging.'],
  ['Do I need a registered agent, and how much does it cost?', 'Yes state law requires every LLC and corporation to maintain one. Our registered agent service is $80 per year, per entity, and includes a monitored registered office address and same-day scanning of official notices.'],
  ['Can you help with EIN applications for foreign founders?', 'Yes. We prepare and file EIN applications for $35 for U.S. applicants and $130 for foreign applicants, who face a longer, non-online IRS process. We also handle S-Corp elections (IRS Form 2553) for eligible businesses.'],
  ['What is Business Formation Filings, and how is it different from LLC Formation?', 'LLC Formation is our fully automated formation path, available across 21 states. Business Formation Filings covers that same path plus corporations, nonprofits, and foreign qualification filings for $95 plus the applicable state filing fee.'],
  ['What are Compliance Filings?', 'A filing service for annual reports, business amendments, Certificates of Good Standing, and registered agent changes prepared and submitted for $95 plus any state fee. Our separate Compliance Support service tracks the deadlines; Compliance Filings handles the paperwork itself.'],
  ['Do you offer a business mailing address?', 'Yes, two options. Mail Forwarding gives your business a professional address with a unique suite number and digital mail access for $20 per month. Virtual Office adds a signed lease agreement to that same service for $29 per month. Both are available across all 21 states we support.'],
  ['What formation packages do you offer?', 'Foundation ($150), Accelerated ($200), and Complete ($250), each a one-time service fee plus the state filing fee. Accelerated and Complete bundle in services like registered agent, compliance reminders, and EIN filing at a lower combined cost than buying them separately.'],
  ['Can I elect S-Corp status for a business I already formed elsewhere?', 'Yes. Our S-Corp Election service files IRS Form 2553 for an existing, eligible LLC or corporation for $130, whether or not we prepared your original EIN.'],
  ['Do you offer apostille services or Certificates of Good Standing?', 'Yes. We prepare Certificates of Good Standing and certified copies for $70 plus any state fee, and apostille documents for international use for $450 plus any underlying government fee.']
]

const trustCards = [
  { icon: FileCheck2, title: 'Guided Formation', body: 'A clear, step-by-step questionnaire instead of a blank government form.' },
  { icon: ShieldCheck, title: 'Secure Document Access', body: 'Your formation records, agreements, and receipts in one protected place.' },
  { icon: Sparkles, title: 'EIN Assistance', body: 'Get organized help preparing your federal tax ID (EIN) request.' },
  { icon: ReceiptText, title: 'Clear Fee Breakdown', body: 'Your service fee and the government filing fee, always itemized separately never bundled or hidden.' },
  { icon: TrendingUp, title: 'Progress Tracking', body: 'Follow your filing from submission through approval, in real time.' },
  { icon: CalendarClock, title: 'Compliance Reminders', body: 'Never miss a filing, renewal, or reporting deadline again.' }
]

// A condensed, stage-grouped view of the real 15-step formation wizard
// (see the `steps` list in Onboarding.jsx) distinct from the simpler
// 4-step "How it works" overview above it on purpose: this section is
// meant to show the depth of the guided process, not repeat the summary.
const journeyStages = [
  { title: 'Tell us about your business', body: 'Business name, industry, contact information, and address covered in a focused questionnaire, not a blank form.' },
  { title: 'Set up ownership & compliance', body: 'Ownership, management structure, registered agent, organizer, and effective date all captured with state requirements built in.' },
  { title: 'Choose your plan', body: 'Add optional services like EIN assistance, then select the formation package that fits your business and create your account.' },
  { title: 'Review, pay & track', body: 'Confirm every detail, complete secure checkout, and follow your Certificate of Formation from submission to approval.' }
]

const llcVsCorp = [
  { label: 'Liability protection', llc: 'Yes personal assets are generally separate from business debts.', corp: 'Yes personal assets are generally separate from business debts.' },
  { label: 'Taxation', llc: 'Pass-through by default profits are reported on the owners’ personal returns, avoiding entity-level tax.', corp: 'Standard C-corporations face corporate-level tax, plus tax again on shareholder dividends (an S-corp election can avoid this for eligible corporations).' },
  { label: 'Ongoing formalities', llc: 'Minimal typically an annual report, no required board meetings or formal minutes.', corp: 'More formal generally requires a board of directors, bylaws, and documented shareholder/board meetings.' },
  { label: 'Ownership structure', llc: 'Flexible member-managed or manager-managed, with ownership set by agreement.', corp: 'Structured shares, a board of directors, and corporate officers.' }
]

const complianceSpotlight = texas.complianceTasks.slice(0, 3)

function TrustBadge() {
  return <div className="state-lock-badge"><Lock size={14}/> 21 states</div>
}

export default function Home() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    let cancelled = false
    api.getTestimonials().then(res => { if (!cancelled) setReviews(res.data || []) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  return <>
    <SEO
      title="LLC Formation Made Simple"
      description="American Business Formations helps you form your LLC and manage compliance through one guided platform. LLC formation is available in 21 states."
      path="/"
      jsonLd={faqSchema(homeFaq)}
    />

    {/* 1. Hero */}
    <section className="hero home-hero home-hero-split">
      <div className="container hero-grid">
        <Reveal as="div" className="hero-copy hero-copy-left">
          <div className="eyebrow"><Sparkles size={16}/> Business formation made simple</div>
          <h1>Make Your Business <span>Official.</span></h1>
          <p>Form your LLC through a clear, guided process and manage your important formation documents from one secure platform.</p>
          <BusinessNameStartForm source="homepage_hero" buttonText="Start My LLC" />
          <div className="hero-secondary-row">
            <TrustBadge/>
            <Link to="/how-it-works" className="text-link">See How It Works <ArrowRight size={16}/></Link>
          </div>
          <p className="hero-availability-note">LLC formation is available in 21 states. State filing fees and optional add-on services are shown separately before you pay.</p>
          <div className="trust-row"><ShieldCheck size={16}/> <span>Secure checkout · Guided application · Status tracking · Real support</span></div>
        </Reveal>
        <Reveal as="div" delay={1} className="hero-visual">
          <PlatformPreview/>
        </Reveal>
      </div>
    </section>

    {/* 1b. Available in 21 states */}
    <section className="section soft-section">
      <div className="container">
        <SectionHeading centered eyebrow="Coverage" title="LLC formation available across 21 states" description="Choose your state during onboarding your state filing fee updates automatically, itemized separately from our service fee." />
        <SupportedStatesList compact/>
      </div>
    </section>

    {/* 2. Trust & transparency */}
    <section className="section soft-section">
      <div className="container">
        <SectionHeading centered eyebrow="Why founders choose us" title="Built for trust and transparency" description="Every fee, every step, and every document is visible from your dashboard nothing hidden, nothing bundled in without telling you." />
        <div className="values-grid values-grid-6">
          {trustCards.map(({ icon: Icon, title, body }, i) => (
            <Reveal as="article" delay={i % 6} key={title}><Icon/><h3>{title}</h3><p>{body}</p></Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* 3. How it works */}
    <section className="section process-section-light">
      <div className="container">
        <SectionHeading centered eyebrow="A simpler path" title="Four steps to a filed LLC" />
        <div className="process-grid-light">
          <Reveal as="article" delay={0}><div className="step-number-light">01</div><h3>Tell us about your business</h3><p>Enter your proposed name and answer a focused set of questions.</p></Reveal>
          <Reveal as="article" delay={1}><div className="step-number-light">02</div><h3>Select your formation services</h3><p>Choose a package and any add-ons EIN assistance, operating agreement, and more.</p></Reveal>
          <Reveal as="article" delay={2}><div className="step-number-light">03</div><h3>Review and submit your order</h3><p>See your service fee, the state filing fee, and any add-ons broken out clearly before you pay.</p></Reveal>
          <Reveal as="article" delay={3}><div className="step-number-light">04</div><h3>Track everything from your dashboard</h3><p>Follow your Certificate of Formation from submission through approval.</p></Reveal>
        </div>
        <div className="center-action"><Link className="btn btn-primary" to="/formation-details">Start My LLC <ArrowRight size={18}/></Link></div>
      </div>
    </section>

    {/* 4. Main formation services */}
    <section className="section">
      <div className="container">
        <SectionHeading centered eyebrow="Formation services" title="Everything you need to form your LLC" description="Guided, itemized, and available as add-ons alongside your formation package." />
        <ServiceGrid group="Start your business" />
        <div className="center-action"><Link className="btn btn-outline" to="/services">View all services <ArrowRight size={18}/></Link></div>
      </div>
    </section>

    {/* 5. LLC vs Corporation comparison (educational only) */}
    <section className="section soft-section">
      <div className="container">
        <SectionHeading centered eyebrow="Choosing a structure" title="Why founders often choose an LLC" description="A general comparison to help you understand the basics. This is educational information, not legal or tax advice." />
        <div className="compare-grid llc-vs-corp-grid">
          <Reveal as="div" delay={0} className="compare-card highlight">
            <h3>LLC (Limited Liability Company)</h3>
            <ul className="check-list">
              {llcVsCorp.map(row => <li key={row.label}><CheckCircle2/><span><strong>{row.label}:</strong> {row.llc}</span></li>)}
            </ul>
          </Reveal>
          <Reveal as="div" delay={1} className="compare-card">
            <h3>Corporation</h3>
            <ul className="check-list muted-list">
              {llcVsCorp.map(row => <li key={row.label}><CheckCircle2/><span><strong>{row.label}:</strong> {row.corp}</span></li>)}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>

    {/* 6. Guided founder journey (depth preview of the real 15-step wizard) */}
    <section className="section">
      <div className="container">
        <SectionHeading centered eyebrow="Your guided journey" title="A wizard built around how founders actually decide" description="Fifteen focused steps, grouped into four stages so nothing feels overwhelming." />
        <div className="steps-grid steps-grid-4">
          {journeyStages.map((stage, index) => (
            <Reveal as="article" delay={index} key={stage.title}>
              <div>{String(index + 1).padStart(2, '0')}</div>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* 7. Compliance services spotlight */}
    <section className="section soft-section">
      <div className="container">
        <SectionHeading centered eyebrow="Stay in good standing" title="Compliance services that keep you on track" description="Every state has ongoing requirements after formation. Shown below: a few of the Texas-specific requirements we help you track your dashboard reflects the actual requirements for your formation state." />
        <div className="values-grid values-grid-3">
          {complianceSpotlight.map(task => (
            <article key={task.id}><CalendarClock/><h3>{task.name}</h3><p>{task.description}</p><small className="compliance-frequency">{task.frequency}</small></article>
          ))}
        </div>
        <div className="center-action"><Link className="btn btn-outline" to="/texas-compliance">See all compliance support <ArrowRight size={18}/></Link></div>
      </div>
    </section>

    {/* 8. Additional business services */}
    <section className="section">
      <div className="container">
        <SectionHeading centered eyebrow="Beyond formation" title="Additional services to manage your business" description="Keep your compliance and documents organized as your business grows." />
        <ServiceGrid group="Manage your business" />
      </div>
    </section>

    {/* 9. Guided vs. DIY comparison */}
    <section className="section compare-section">
      <div className="container">
        <SectionHeading centered eyebrow="Why go guided" title="Filing on your own is possible this makes it easier" />
        <div className="compare-grid">
          <Reveal as="div" delay={0} className="compare-card highlight">
            <h3>With American Business Formations</h3>
            <ul className="check-list">
              <li><CheckCircle2/> A guided questionnaire built for state requirements</li>
              <li><CheckCircle2/> EIN assistance and compliance reminders in one place</li>
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
              <li><X/> Coordinate EIN, banking, and compliance separately</li>
              <li><X/> No guided dashboard for status or documents</li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>

    {/* 10. Transparent pricing preview */}
    <section className="section pricing-section">
      <div className="container"><SectionHeading centered eyebrow="Flexible plans" title="Choose the plan that fits your business" description="Prices shown are our service fee. The state filing fee is always itemized separately." /><PricingCards/></div>
    </section>

    {/* 10b. Pricing overview: individual services */}
    <section className="section soft-section">
      <div className="container">
        <SectionHeading centered eyebrow="Business solutions" title="Or add exactly what your business needs" description="Every service is also available on its own, with the same transparent pricing." />
        <AddOnPricingCards/>
      </div>
    </section>

    {/* 11. Verified testimonials only */}
    <section className="section testimonials-section">
      <div className="container">
        <SectionHeading centered eyebrow="Founder stories" title="What our customers say" />
        {reviews.length > 0
          ? <Reveal as="div" className="testimonial-carousel"><article><p>&ldquo;{reviews[0].quote}&rdquo;</p><div className="person"><div>{reviews[0].customer_name?.[0]}</div><span><strong>{reviews[0].customer_name}</strong><small>{reviews[0].customer_role}</small></span></div></article></Reveal>
          : <div className="alert-banner info" style={{ maxWidth: 640, margin: '0 auto' }}><MessageCircle size={20}/><p style={{ margin: 0 }}>We don&rsquo;t publish reviews until we can verify they&rsquo;re from real customers so this section is honestly empty for now. Read <Link to="/about">how we work</Link> instead.</p></div>}
      </div>
    </section>

    {/* 12. FAQs */}
    <FAQ items={homeFaq} searchable />

    {/* 13. Support section */}
    <section className="section help-section">
      <div className="container help-grid">
        <Reveal as="div" delay={0} className="help-copy">
          <SectionHeading eyebrow="We&rsquo;re here to help" title="Questions about forming your LLC?" description="Reach our support team by email, or use the chat button in the corner of your screen." />
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

    {/* 14. Final CTA */}
    <div className="closing-cta">
      <Reveal as="div" className="container closing-cta-inner">
        <div><span>Every plan includes support and status tracking</span><h2>Turn your business idea into a filed LLC.</h2></div>
        <BusinessNameStartForm source="homepage_closing_cta" compact buttonText="Start My LLC" />
      </Reveal>
    </div>
  </>
}
