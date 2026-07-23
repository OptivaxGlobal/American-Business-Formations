import { ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Building2, Check, ChevronRight, CircleDollarSign, ClipboardCheck, Globe2, Megaphone, Palette, Rocket, ShieldCheck, ShoppingBag, Sparkles, Store, Target, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, withLocalFallback } from '../../lib/api'
import SEO from '../../components/SEO'

const order=['stage','focus','products','marketing']
const data={
  stage:{eyebrow:'Let’s personalize your experience',title:'What stage is your business in?',description:'Your answer helps us build the right launch plan and recommend only what you need.',single:true,options:[
    ['idea',Sparkles,'I’m exploring an idea','I have a concept and want help turning it into a real business.'],
    ['starting',Rocket,'I’m starting a new business','I am ready to form, launch, and build my business identity.'],
    ['running',Store,'I already run a business','I want better tools for compliance, finance, branding, or growth.'],
  ]},
  focus:{eyebrow:'Choose your priorities',title:'What do you want to focus on first?',description:'Select all that apply. You can change these preferences later from your studio.',options:[
    ['formation',Building2,'Make my business official','Formation, EIN, registered agent, and operating documents.'],
    ['compliance',ShieldCheck,'Stay compliant','Deadlines, state reports, licenses, permits, and records.'],
    ['money',CircleDollarSign,'Manage business finances','Banking, bookkeeping, invoices, funding, and taxes.'],
    ['brand',Palette,'Build a professional brand','Logo, visual identity, domain, email, and business cards.'],
    ['online',Globe2,'Get online','Website, online store, search visibility, and customer contact.'],
    ['growth',BarChart3,'Reach more customers','Marketing plans, social content, campaigns, and insights.'],
  ]},
  products:{eyebrow:'Build your workspace',title:'Which tools should we prepare for you?',description:'Choose the products you want inside your business studio. No payment is taken in this demo.',options:[
    ['llc',ClipboardCheck,'LLC formation','Guided company setup and filing checklist.'],
    ['agent',ShieldCheck,'Registered agent','Compliance mail and annual reminder center.'],
    ['ein',BadgeCheck,'EIN application','Federal tax ID preparation workflow.'],
    ['banking',CircleDollarSign,'Business banking','Banking readiness and document checklist.'],
    ['logo',Palette,'Logo & brand kit','AI-assisted logo directions and brand system.'],
    ['website',Globe2,'Website builder','Launch pages, copy tools, and domain setup.'],
    ['store',ShoppingBag,'Online store','Product catalog and checkout starter.'],
    ['marketing',Megaphone,'Marketing suite','Social posts, campaign ideas, and content calendar.'],
  ]},
  marketing:{eyebrow:'One last step',title:'How do you plan to reach customers?',description:'We’ll tailor your marketing workspace and starter recommendations around these channels.',options:[
    ['social',Megaphone,'Social media','Create posts, captions, campaign ideas, and a content plan.'],
    ['search',Target,'Search & local discovery','Improve search visibility and local business presence.'],
    ['website',Globe2,'Website & content','Build landing pages, service copy, and lead forms.'],
    ['email',Users,'Email marketing','Collect leads and prepare useful email campaigns.'],
    ['sales',Store,'Direct sales','Build proposals, follow-ups, and a practical sales process.'],
    ['unsure',Sparkles,'I’m not sure yet','Use AI guidance to choose the best channels for my business.'],
  ]}
}

export default function Boarding(){
  const {step='stage'}=useParams(); const navigate=useNavigate(); const config=data[step]||data.stage
  const [answers,setAnswers]=useState(()=>{try{return JSON.parse(localStorage.getItem('abf-boarding'))||{}}catch{return {}}})
  const selected=answers[step]||[]; const idx=Math.max(0,order.indexOf(step)); const [saving,setSaving]=useState(false)
  useEffect(()=>{window.scrollTo(0,0)},[step])
  const choose=id=>setAnswers(prev=>({...prev,[step]:config.single?[id]:(prev[step]||[]).includes(id)?(prev[step]||[]).filter(x=>x!==id):[...(prev[step]||[]),id]}))
  const continueFlow=async()=>{localStorage.setItem('abf-boarding',JSON.stringify(answers)); if(idx<order.length-1){navigate(`/boarding/131616968/${order[idx+1]}`);return} setSaving(true);await withLocalFallback(()=>api.submitBoarding(answers),()=>({ok:true}));setSaving(false);navigate('/studio')}
  const back=()=>idx===0?navigate('/'):navigate(`/boarding/131616968/${order[idx-1]}`)
  return <><SEO title="Personalize Your Studio" description="Tell us about your business to personalize your studio." path="/boarding" noindex /><div className="boarding-page">
    <header className="boarding-header"><div className="boarding-logo"><img src="/logo.webp" alt="American Business Formations" className="brand-mini"/></div><div className="boarding-help">Need help? <Link to="/contact">Contact support</Link></div></header>
    <div className="boarding-progress"><i style={{width:`${((idx+1)/order.length)*100}%`}}/></div>
    <main className="boarding-content">
      <div className="boarding-heading" key={`h-${step}`}><span>{config.eyebrow}</span><h1>{config.title}</h1><p>{config.description}</p></div>
      <div className={`boarding-options ${config.single?'three':''}`} key={`o-${step}`}>{config.options.map(([id,Icon,title,copy])=><button key={id} onClick={()=>choose(id)} className={selected.includes(id)?'selected':''}><i><Icon/></i><div><strong>{title}</strong><p>{copy}</p></div><span className="boarding-check">{selected.includes(id)?<Check/>:<ChevronRight/>}</span></button>)}</div>
    </main>
    <footer className="boarding-footer"><button className="boarding-back" onClick={back}><ArrowLeft/> Back</button><span>Step {idx+1} of {order.length}</span><button disabled={!selected.length||saving} className="boarding-next" onClick={continueFlow}>{saving?'Preparing studio...':idx===order.length-1?'Open my studio':'Continue'} <ArrowRight/></button></footer>
  </div></>
}
