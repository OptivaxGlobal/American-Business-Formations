import {
  Bell, CalendarDays, CircleHelp, CreditCard, FileText, FolderOpen,
  LayoutDashboard, LogOut, Menu, MessageSquare, Settings, Sparkles, X
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useBusiness } from '../../context/BusinessContext'
import SEO from '../SEO'

const labels = {
  '/dashboard': 'Overview', '/dashboard/businesses': 'My businesses', '/dashboard/orders': 'Orders & services',
  '/dashboard/billing': 'Billing', '/dashboard/support': 'Support', '/dashboard/notifications': 'Notifications',
  '/dashboard/settings': 'Settings', '/dashboard/guide': 'ABF Business Guide'
}

export default function DashboardShell(){
  const {user,logout}=useApp(); const {selectedBusiness}=useBusiness()
  const [mobile,setMobile]=useState(false)
  const location=useLocation()
  const title = location.pathname.startsWith('/dashboard/businesses/') ? 'Business details' : (labels[location.pathname]||'Dashboard')

  return <><SEO title={title==='Dashboard'?'Dashboard':`${title} — Dashboard`} description="Your American Business Formations client dashboard." path={location.pathname} noindex />
    <section className="dashboard-page">
      <aside className={mobile?'open':''}>
        <div className="dash-brand"><img src="/logo.webp" alt="American Business Formations" className="brand-mini-light"/><button onClick={()=>setMobile(false)} aria-label="Close navigation"><X/></button></div>
        <nav>
          <NavLink end to="/dashboard" onClick={()=>setMobile(false)}><LayoutDashboard/>Overview</NavLink>
          <NavLink to="/dashboard/businesses" onClick={()=>setMobile(false)}><FolderOpen/>My businesses</NavLink>
          <NavLink to="/dashboard/orders" onClick={()=>setMobile(false)}><FileText/>Orders & services</NavLink>
          <NavLink to="/dashboard/billing" onClick={()=>setMobile(false)}><CreditCard/>Billing</NavLink>
          <NavLink to="/dashboard/notifications" onClick={()=>setMobile(false)}><CalendarDays/>Notifications</NavLink>
          <NavLink to="/dashboard/support" onClick={()=>setMobile(false)}><MessageSquare/>Support</NavLink>
          <NavLink to="/dashboard/guide" onClick={()=>setMobile(false)}><Sparkles/>ABF Business Guide</NavLink>
        </nav>
        <div className="dash-help"><CircleHelp/><strong>Need help?</strong><p>Contact the support team or open the on-site guide.</p><Link to="/dashboard/support">Get support</Link></div>
        <nav className="dash-bottom">
          <NavLink to="/dashboard/settings" onClick={()=>setMobile(false)}><Settings/>Settings</NavLink>
          <button onClick={logout}><LogOut/>Log out</button>
        </nav>
      </aside>
      <main>
        <header>
          <button className="dash-mobile-menu" onClick={()=>setMobile(true)} aria-label="Open navigation"><Menu/></button>
          <div><span>{selectedBusiness?.name || 'Client dashboard'}</span><h1>{title}</h1></div>
          <div className="dash-head-actions">
            <button aria-label="Notifications"><Bell/></button>
            <div className="user-chip"><div>{(user?.name||'F')[0].toUpperCase()}</div><span><strong>{user?.name||'Founder Account'}</strong><small>{user?.email||'founder@example.com'}</small></span></div>
          </div>
        </header>
        <div className="dash-content"><Outlet/></div>
      </main>
    </section>
  </>
}
