import { ArrowRight, BadgeCheck, BarChart3, Building2, CalendarCheck, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, FileCheck2, Globe2, Megaphone, Palette, ShieldCheck, Sparkles, Target, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Reveal from '../../components/Reveal'

export default function StudioHome(){
  const {user}=useApp(); const onboarding=read('abf-onboarding'); const boarding=read('abf-boarding')
  const name=onboarding.businessName||'American Venture LLC'
  return <div className="studio-page studio-home">
    <Reveal as="section" className="studio-welcome"><div><span>Good to see you, {user?.name?.split(' ')[0]||'Founder'}</span><h1>Let’s keep your business moving.</h1><p>Your personalized studio brings formation, compliance, money, brand, and marketing into one clear workspace.</p></div><Link className="studio-primary" to="/studio/ai-tools"><Sparkles/> Ask Formation AI</Link></Reveal>
    <Reveal as="section" delay={1} className="launch-card"><div className="launch-copy"><span className="studio-pill"><Clock3/> Formation in progress</span><h2>{name}</h2><p>{onboarding.entityType||'LLC'} · {onboarding.state||'Wyoming'} · {onboarding.industry||'Professional services'}</p><div className="launch-meter"><div><i style={{width:'68%'}}/></div><strong>68% complete</strong></div><Link to="/studio/formation">Continue formation <ArrowRight/></Link></div><div className="launch-steps"><div className="done"><i><CheckCircle2/></i><span><strong>Business details</strong><small>Completed</small></span></div><div className="current"><i>2</i><span><strong>Review information</strong><small>Action needed</small></span></div><div><i>3</i><span><strong>State filing</strong><small>Upcoming</small></span></div><div><i>4</i><span><strong>Approved</strong><small>Upcoming</small></span></div></div></Reveal>
    <div className="studio-section-heading"><div><span>Recommended for you</span><h2>Your next best steps</h2></div><button>View all recommendations</button></div>
    <section className="next-step-grid">
      <Reveal as="article" delay={0} className="next-step-feature"><div className="feature-icon"><FileCheck2/></div><span>Priority task</span><h3>Confirm your registered agent details</h3><p>Review the address and contact information that will be used for official state notices.</p><Link to="/studio/formation">Review details <ArrowRight/></Link><div className="due-label"><CalendarCheck/> Due in 2 days</div></Reveal>
      <Reveal as="article" delay={1}><i><BadgeCheck/></i><div><span>Business setup</span><h3>Prepare your EIN application</h3><p>Unlock banking, hiring, and federal tax setup.</p></div><Link to="/studio/formation"><ChevronRight/></Link></Reveal>
      <Reveal as="article" delay={2}><i><CircleDollarSign/></i><div><span>Finance</span><h3>Separate business finances</h3><p>Use the banking readiness checklist.</p></div><Link to="/studio/finance"><ChevronRight/></Link></Reveal>
      <Reveal as="article" delay={3}><i><Globe2/></i><div><span>Online presence</span><h3>Claim your domain name</h3><p>Secure a professional name before launch.</p></div><Link to="/studio/website"><ChevronRight/></Link></Reveal>
    </section>
    <div className="studio-dashboard-grid">
      <Reveal as="section" delay={0} className="studio-panel progress-panel"><div className="panel-heading"><div><span>Business progress</span><h3>Your launch roadmap</h3></div><button>See full roadmap</button></div><div className="roadmap-list">
        <Road icon={Building2} title="Form your business" progress="3 of 5 tasks" value="60%" pct={60}/>
        <Road icon={ShieldCheck} title="Protect & stay compliant" progress="1 of 4 tasks" value="25%" pct={25}/>
        <Road icon={CircleDollarSign} title="Set up finances" progress="0 of 4 tasks" value="0%" pct={0}/>
        <Road icon={Palette} title="Build your brand" progress="2 of 5 tasks" value="40%" pct={40}/>
        <Road icon={Megaphone} title="Find customers" progress="1 of 5 tasks" value="20%" pct={20}/>
      </div></Reveal>
      <Reveal as="section" delay={1} className="studio-panel ai-card"><div className="ai-orb"><Sparkles/></div><span>Formation AI</span><h3>Your business co-pilot</h3><p>Get explanations, personalized action plans, content ideas, and setup guidance based on your saved profile.</p><div className="ai-prompts"><Link to="/studio/ai-tools">What should I do next?</Link><Link to="/studio/ai-tools">Create a launch checklist</Link><Link to="/studio/ai-tools">Explain LLC compliance</Link></div></Reveal>
    </div>
    <Reveal as="section" className="tools-strip"><div className="panel-heading"><div><span>Tools picked for you</span><h3>Build and grow in one place</h3></div></div><div className="tool-mini-grid"><Tool icon={Palette} title="Brand kit" copy="Create your visual direction" to="/studio/brand"/><Tool icon={Globe2} title="Website" copy="Build your online presence" to="/studio/website"/><Tool icon={Target} title="Marketing plan" copy="Choose growth channels" to="/studio/marketing"/><Tool icon={BarChart3} title="Business plan" copy="Generate a clear strategy" to="/studio/ai-tools"/></div></Reveal>
  </div>
}
function Road({icon:Icon,title,progress,value,pct}){return <div className="road-row"><i><Icon/></i><div><strong>{title}</strong><span>{progress}</span><div><b style={{width:`${pct}%`}}/></div></div><em>{value}</em><ChevronRight/></div>}
function Tool({icon:Icon,title,copy,to}){return <Link to={to}><i><Icon/></i><div><strong>{title}</strong><span>{copy}</span></div><ChevronRight/></Link>}
function read(key){try{return JSON.parse(localStorage.getItem(key))||{}}catch{return {}}}
