import { useState } from 'react'
import {
  ArrowRight, BadgeCheck, Building2, Calculator, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, FileCheck2, Phone, ShieldCheck, Sparkles, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StateSelector from '../components/StateSelector'
import PricingCards from '../components/PricingCards'
import FAQ from '../components/FAQ'
import Reveal from '../components/Reveal'
import { serviceGroups } from '../data/services'

const homeFaq = [
  ['What do I need to start an LLC?', 'You will usually need a preferred business name, formation state, business address, ownership details, management structure, and registered-agent information.'],
  ['Are state fees included in plan prices?', 'No. State filing fees are separate and vary by jurisdiction. The selected state is shown throughout the onboarding flow so pricing can be connected later.'],
  ['Can a non-US resident use the website?', 'The intake experience can collect non-resident founder information. Final legal, tax, banking, and identification requirements depend on the selected services and providers.'],
  ['Does the site include a client dashboard?', 'Yes. This project includes login, signup, onboarding, dashboard, order progress, document cards, reminders, and recommended next steps.'],
  ['Is the frontend ready for Flask?', 'Yes. API calls are centralized in src/lib/api.js, Vite proxies /api to Flask in development, and a starter Flask server is included.']
]

const testimonials = [
  ['“The process finally felt organized. I knew what information was missing and what was happening next.”', 'Maya R.', 'Creative studio owner'],
  ['“I liked having formation, documents, and reminders in one dashboard instead of juggling notes and emails.”', 'Marcus T.', 'Home services founder'],
  ['“The guided questions made it much easier to prepare everything before speaking with the filing team.”', 'Elena P.', 'Online retail founder']
]

const categoryIcons = [Building2, Calculator, Sparkles]

function CategoryAccordion() {
  const [open, setOpen] = useState(0)
  return (
    <div className="category-accordion">
      {serviceGroups.map((group, index) => {
        const Icon = categoryIcons[index % categoryIcons.length]
        const isOpen = open === index
        return (
          <Reveal as="article" delay={index} className={`category-row ${isOpen ? 'open' : ''}`} key={group.title}>
            <button onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen}>
              <span className="category-row-label"><Icon size={20} /> {group.title}</span>
              {isOpen ? <ChevronDown className="rot" /> : <ChevronDown />}
            </button>
            <div className="category-row-body">
              <p>Explore every {group.title.toLowerCase()} tool in one guided workspace.</p>
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

function TestimonialCarousel() {
  const [index, setIndex] = useState(0)
  const [quote, name, role] = testimonials[index]
  const go = dir => setIndex((index + dir + testimonials.length) % testimonials.length)
  return (
    <Reveal as="div" className="testimonial-carousel">
      <article>
        <div className="stars">★★★★★</div>
        <p>{quote}</p>
        <div className="person"><div>{name[0]}</div><span><strong>{name}</strong><small>{role}</small></span></div>
      </article>
      <div className="carousel-controls">
        <button onClick={() => go(-1)} aria-label="Previous story"><ChevronLeft /></button>
        <div className="carousel-dots">{testimonials.map((_, i) => <i key={i} className={i === index ? 'active' : ''} />)}</div>
        <button onClick={() => go(1)} aria-label="Next story"><ChevronRight /></button>
      </div>
    </Reveal>
  )
}

export default function Home() {
  return <>
    <section className="hero home-hero">
      <div className="container hero-grid-3">
        <img className="hero-side-art left" src="/illustrations/hero-business.svg" alt="" aria-hidden="true" />
        <Reveal as="div" className="hero-copy">
          <div className="eyebrow"><Sparkles size={16}/> Built for first-time founders</div>
          <h1>Great businesses <span>start here.</span></h1>
          <p>Form your LLC, organize compliance, and access practical business tools through one guided platform built for American entrepreneurs.</p>
          <StateSelector />
        </Reveal>
        <img className="hero-side-art right" src="/illustrations/registered-agent.svg" alt="" aria-hidden="true" />
      </div>
      <Reveal as="div" delay={2} className="container hero-badge-row">
        <span><BadgeCheck size={16}/> Guided, plain-language setup</span>
        <span><FileCheck2 size={16}/> Documents organized for you</span>
        <span><ShieldCheck size={16}/> Compliance reminders built in</span>
      </Reveal>
    </section>

    <section className="logo-strip"><div className="container"><span>Designed to support modern founders</span><div><b>STARTUP DAILY</b><b>FOUNDER LAB</b><b>SMALL BIZ NETWORK</b><b>VENTURE DESK</b><b>COMMERCE WEEKLY</b></div></div></section>

    <section className="section intro-section">
      <div className="container split-grid">
        <Reveal as="div" delay={0} className="image-panel"><img src="/illustrations/dashboard-preview.svg" alt="American Business Formations client dashboard preview"/></Reveal>
        <Reveal as="div" delay={1} className="content-panel">
          <div className="section-heading"><span>Built for your first time</span><h2>Built to make the first steps feel manageable</h2></div>
          <p>Business formation involves choices, paperwork, and deadlines. Our experience breaks the work into clear stages, keeps important information organized, and gives founders a practical next action.</p>
          <ul className="check-list"><li><CheckCircle2/> Guided forms that save progress</li><li><CheckCircle2/> A dashboard for milestones and documents</li><li><CheckCircle2/> Services that grow with the business</li></ul>
          <Link className="text-link" to="/about">Why American Business Formations <ArrowRight/></Link>
        </Reveal>
      </div>
    </section>

    <section className="section ai-section">
      <div className="container split-grid reverse-mobile">
        <Reveal as="div" delay={0} className="content-panel">
          <div className="eyebrow"><Sparkles size={16}/> ABF Guide</div>
          <h2>Your AI sidekick for every step</h2>
          <p>The included interface features an on-site guide, task recommendations, dashboard reminders, and a Flask-ready structure for adding real AI or support integrations later.</p>
          <div className="feature-pills"><span>Formation questions</span><span>Deadline guidance</span><span>Service discovery</span><span>Dashboard help</span></div>
          <Link className="btn btn-primary" to="/start">Try the guided flow</Link>
        </Reveal>
        <Reveal as="div" delay={1} className="assistant-demo">
          <div className="assistant-top"><div className="assistant-avatar">A</div><div><strong>ABF Guide</strong><small>Business setup assistant</small></div><span>Online</span></div>
          <div className="demo-message user-message">What should I prepare before starting an LLC?</div>
          <div className="demo-message bot-message">Start with your preferred name, state, business address, ownership details, and registered-agent plan. I’ll keep the process organized.</div>
          <div className="demo-options"><button>Choose my state</button><button>Compare plans</button><button>See required details</button></div>
        </Reveal>
      </div>
    </section>

    <section className="section process-section-light">
      <div className="container">
        <div className="section-heading centered"><span>A simpler path</span><h2>Make it official in minutes</h2></div>
        <div className="process-grid-light">
          <Reveal as="article" delay={0}><div className="step-number-light">01</div><h3>Tell us about the business</h3><p>Choose your state, enter a preferred name, and answer a focused set of questions.</p></Reveal>
          <Reveal as="article" delay={1}><div className="step-number-light">02</div><h3>Review your formation plan</h3><p>See selected services, package details, state fee placeholders, and information still needed.</p></Reveal>
          <Reveal as="article" delay={2}><div className="step-number-light">03</div><h3>Track every milestone</h3><p>Use the dashboard for progress, documents, reminders, requests, and recommended next steps.</p></Reveal>
        </div>
        <div className="center-action"><Link className="btn btn-primary" to="/start">Launch my business <ArrowRight size={18}/></Link></div>
      </div>
    </section>

    <section className="section soft-section">
      <div className="container">
        <div className="section-heading centered"><span>Business formation & support</span><h2>Start, protect, operate, and grow</h2><p>Choose the category you need now and add more tools as your business develops.</p></div>
        <CategoryAccordion />
        <div className="center-action"><Link className="btn btn-outline" to="/services">View all services <ArrowRight size={18}/></Link></div>
      </div>
    </section>

    <section className="section testimonials-section">
      <div className="container">
        <div className="section-heading centered"><span>Founder stories</span><h2>Confidence from the very first step</h2></div>
        <TestimonialCarousel />
      </div>
    </section>

    <section className="section compare-section">
      <div className="container">
        <div className="section-heading centered"><span>Why go guided</span><h2>Independence doesn't mean doing it alone</h2></div>
        <div className="compare-grid">
          <Reveal as="div" delay={0} className="compare-card highlight">
            <h3>With American Business Formations</h3>
            <ul className="check-list">
              <li><CheckCircle2/> We prepare and file your paperwork</li>
              <li><CheckCircle2/> Every requirement organized and tracked</li>
              <li><CheckCircle2/> Deadlines and renewals handled for you</li>
              <li><CheckCircle2/> Step-by-step guidance built for beginners</li>
            </ul>
            <Link className="btn btn-primary" to="/start">Get started</Link>
          </Reveal>
          <Reveal as="div" delay={1} className="compare-card">
            <h3>On your own</h3>
            <ul className="check-list muted-list">
              <li><X/> Research requirements and file by yourself</li>
              <li><X/> Track deadlines and forms manually</li>
              <li><X/> Juggle between agencies and paperwork</li>
              <li><X/> Figure it out through trial and error</li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>

    <section className="section pricing-section">
      <div className="container"><div className="section-heading centered"><span>Flexible plans</span><h2>Choose the plan that fits your path</h2><p>Sample service pricing is ready to connect to your own checkout and backend rules.</p></div><PricingCards/></div>
    </section>

    <section className="section help-section">
      <div className="container help-grid">
        <Reveal as="div" delay={0} className="help-copy">
          <div className="section-heading"><span>We're here to help</span><h2>Figuring it out on your own can be exhausting</h2><p>Good thing you don't have to. Click the chat button below, or give us a call at <a href="tel:+13075550184">+1 (307) 555-0184</a>.</p></div>
          <Link className="btn btn-primary" to="/contact">Talk to our team <ArrowRight size={18}/></Link>
        </Reveal>
        <Reveal as="div" delay={1} className="help-visual">
          <div className="help-phone-card">
            <Phone size={20}/>
            <span>American Business Formations</span>
            <strong>00:06</strong>
            <small>Don't worry, we'll take care of it</small>
          </div>
        </Reveal>
      </div>
    </section>

    <div className="faq-cta-wrap">
      <FAQ items={homeFaq} searchable dark />
      <div className="closing-cta">
        <Reveal as="div" className="container closing-cta-inner">
          <div><span>Every plan comes with support built in</span><h2>Turn your "someday" goal into today's success.</h2></div>
          <StateSelector compact title="Select your formation state" />
        </Reveal>
      </div>
    </div>
  </>
}
