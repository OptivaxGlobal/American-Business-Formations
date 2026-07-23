import { CheckCircle2, ChevronRight, Clock3, Download, FileText, ShieldCheck, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useBusiness } from '../../context/BusinessContext'
import Reveal from '../../components/Reveal'

const initialTasks=[
  {id:1,title:'Review formation details',due:'Today',done:false},
  {id:2,title:'Confirm registered agent selection',due:'Tomorrow',done:false},
  {id:3,title:'Upload owner identification',due:'Jul 24',done:true},
  {id:4,title:'Review operating agreement request',due:'Jul 28',done:false}
]

export default function DashboardHome(){
  const {user,notify}=useApp()
  const {selectedBusiness}=useBusiness()
  const [tasks,setTasks]=useState(initialTasks)
  const toggleTask=id=>setTasks(v=>v.map(t=>t.id===id?{...t,done:!t.done}:t))
  const business = selectedBusiness?.name || 'Your New Business'
  const state = selectedBusiness?.state || 'Wyoming'
  const doneSteps = selectedBusiness?.timeline?.filter(t=>t.done).length || 1
  const totalSteps = selectedBusiness?.timeline?.length || 6
  const pct = Math.round((doneSteps/totalSteps)*100)

  return <>
    <Reveal as="section" delay={0} className="business-summary"><div><span className="status-pill"><Clock3/> Formation in progress</span><h2>Good evening, {user?.name?.split(' ')[0]||'Founder'}.</h2><p>{business} • {selectedBusiness?.entityType||'LLC'} • {state}</p></div><div className="progress-ring"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16"/><circle className="progress" cx="21" cy="21" r="16" style={{strokeDasharray:`${pct} 100`}}/></svg><strong>{pct}%</strong></div><div className="summary-action"><small>Current stage</small><strong>{selectedBusiness?.timeline?.find(t=>!t.done)?.label || 'Information review'}</strong><span>Estimated next update: 1–2 business days</span><Link to={selectedBusiness ? `/dashboard/businesses/${selectedBusiness.id}` : '/dashboard/businesses'}>View details <ChevronRight/></Link></div></Reveal>

    <div className="dash-grid"><Reveal as="section" delay={1} className="dash-card task-card"><div className="dash-card-head"><div><span>Your next steps</span><h3>Formation checklist</h3></div></div><div className="task-list">{tasks.map(task=><label key={task.id} className={task.done?'done':''}><input type="checkbox" checked={task.done} onChange={()=>toggleTask(task.id)}/><i>{task.done&&<CheckCircle2/>}</i><span><strong>{task.title}</strong><small>Due {task.due}</small></span><ChevronRight/></label>)}</div></Reveal><Reveal as="section" delay={2} className="dash-card guide-card"><div className="guide-icon"><Sparkles/></div><span>ABF Guide</span><h3>What should I focus on next?</h3><p>Your ownership details are complete. Review the registered-agent selection and confirm the mailing address before the next milestone.</p><div><Link to="/dashboard/guide" className="btn btn-outline btn-block">Ask the ABF Business Guide</Link></div></Reveal></div>

    <div className="dash-grid lower"><Reveal as="section" delay={0} className="dash-card" id="documents"><div className="dash-card-head"><div><span>Documents</span><h3>Recent files</h3></div><Link to={selectedBusiness ? `/dashboard/businesses/${selectedBusiness.id}` : '/dashboard/businesses'}>View all</Link></div><div className="document-list">{(selectedBusiness?.documents?.length ? selectedBusiness.documents.slice(0,3) : [{name:'Formation summary',category:'PDF',uploadedAt:'Updated recently'}]).map((doc,i)=><div key={doc.id||i}><div className="doc-icon"><FileText/></div><span><strong>{doc.name}</strong><small>{doc.category||'PDF'}</small></span><button aria-label="Download document"><Download/></button></div>)}</div></Reveal><Reveal as="section" delay={1} className="dash-card"><div className="dash-card-head"><div><span>Recommended</span><h3>Complete your business setup</h3></div></div><div className="recommend-list"><Link to="/ein"><div><ShieldCheck/></div><span><strong>Apply for an EIN</strong><small>Prepare for taxes, banking, and hiring.</small></span><ChevronRight/></Link><Link to="/business-banking"><div><FileText/></div><span><strong>Business banking</strong><small>Separate personal and business finances.</small></span><ChevronRight/></Link><Link to="/website-builder"><div><User/></div><span><strong>Build your online presence</strong><small>Plan a website, domain, and email.</small></span><ChevronRight/></Link></div></Reveal></div>

    <Reveal as="section" className="dash-card timeline-card"><div className="dash-card-head"><div><span>Formation progress</span><h3>Milestone timeline</h3></div></div><div className="timeline">{(selectedBusiness?.timeline||[]).map((t,i)=><div key={i} className={t.done?'complete':(!t.done && (selectedBusiness.timeline[i-1]?.done ?? true))?'current':''}><i>{t.done?<CheckCircle2/>:i+1}</i><span><strong>{t.label}</strong><small>{t.done?'Complete':'Upcoming'}</small></span></div>)}{!selectedBusiness&&<p className="dash-empty">Start a business to see your formation timeline here.</p>}</div></Reveal>
  </>
}
