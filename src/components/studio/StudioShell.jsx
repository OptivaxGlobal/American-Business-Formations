import {
  BadgeCheck, Bell, BookOpen, Building2, ChevronDown, CircleDollarSign,
  FileCheck2, Globe2, HelpCircle, Home, Landmark, LayoutGrid, LogOut,
  Menu, MessageCircle, Palette, Rocket, Settings, ShieldCheck, Sparkles,
  Store, Target, Users, X
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

const primary = [
  ['/studio', Home, 'Home'],
  ['/studio/business', Building2, 'My business'],
  ['/studio/formation', FileCheck2, 'Formation'],
  ['/studio/compliance', ShieldCheck, 'Compliance'],
  ['/studio/finance', CircleDollarSign, 'Finance'],
]
const growth = [
  ['/studio/brand', Palette, 'Brand'],
  ['/studio/website', Globe2, 'Website'],
  ['/studio/marketing', Target, 'Marketing'],
  ['/studio/ai-tools', Sparkles, 'AI tools'],
]

export default function StudioShell(){
  const { user, logout } = useApp()
  const [open,setOpen]=useState(false)
  const [businessOpen,setBusinessOpen]=useState(false)
  const location=useLocation()
  const business=(()=>{try{return JSON.parse(localStorage.getItem('abf-onboarding'))?.businessName}catch{return ''}})() || 'American Venture LLC'
  const initials=(user?.name||'Business Owner').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  return <div className="studio-app">
    <aside className={`studio-sidebar ${open?'is-open':''}`}>
      <div className="studio-logo-row"><NavLink to="/" className="studio-logo"><span>AB</span><strong>American<br/>Business Formations</strong></NavLink><button className="studio-close" onClick={()=>setOpen(false)} aria-label="Close navigation"><X/></button></div>
      <button className="business-switcher" onClick={()=>setBusinessOpen(!businessOpen)} aria-expanded={businessOpen}><span className="business-avatar"><Store/></span><span><small>Current business</small><strong>{business}</strong></span><ChevronDown className={businessOpen?'rotated':''}/></button>
      {businessOpen&&<div className="business-popover"><button><span>AV</span><div><strong>{business}</strong><small>Formation in progress</small></div><BadgeCheck/></button><button className="new-business"><Rocket/> Start another business</button></div>}
      <nav className="studio-nav">
        {primary.map(([to,Icon,label])=><NavLink end={to==='/studio'} onClick={()=>setOpen(false)} key={to} to={to}><Icon/><span>{label}</span>{label==='Formation'&&<b>3</b>}</NavLink>)}
        <p>Build & grow</p>
        {growth.map(([to,Icon,label])=><NavLink onClick={()=>setOpen(false)} key={to} to={to}><Icon/><span>{label}</span>{label==='AI tools'&&<em>New</em>}</NavLink>)}
      </nav>
      <div className="studio-side-bottom">
        <NavLink to="/resources"><BookOpen/> Resources</NavLink>
        <NavLink to="/contact"><HelpCircle/> Help center</NavLink>
        <button onClick={logout}><LogOut/> Log out</button>
      </div>
    </aside>
    {open&&<button aria-label="Close navigation" className="studio-overlay" onClick={()=>setOpen(false)}/>} 
    <main className="studio-main">
      <header className="studio-topbar">
        <button className="studio-menu" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu/></button>
        <div className="studio-breadcrumb"><LayoutGrid/><span>{routeLabel(location.pathname)}</span></div>
        <div className="studio-top-actions">
          <button className="navi-button"><Sparkles/><span>Ask Formation AI</span></button>
          <button className="top-icon" aria-label="Open messages"><MessageCircle/></button>
          <button className="top-icon notification" aria-label="Notifications, 3 unread"><Bell/><i>3</i></button>
          <button className="profile-button"><span>{initials}</span><div><strong>{user?.name||'Business Owner'}</strong><small>Owner account</small></div><ChevronDown/></button>
        </div>
      </header>
      <Outlet/>
    </main>
  </div>
}

function routeLabel(path){
  const labels={
    '/studio':'Home','/studio/business':'My business','/studio/formation':'Formation center',
    '/studio/compliance':'Compliance center','/studio/finance':'Finance & operations',
    '/studio/brand':'Brand studio','/studio/website':'Website studio',
    '/studio/marketing':'Marketing studio','/studio/ai-tools':'AI tools'
  }
  return labels[path]||'Business studio'
}
