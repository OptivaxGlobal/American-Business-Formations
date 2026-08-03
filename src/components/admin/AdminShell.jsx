import {
  ClipboardList, FileText, Landmark, LayoutGrid, LogOut, Megaphone, Menu,
  MessageSquare, Package, ScrollText, Settings, ShieldAlert, Users, X
} from 'lucide-react'
import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import SEO from '../SEO'

const labels = {
  '/admin': 'Overview', '/admin/leads': 'Leads', '/admin/applications': 'Applications', '/admin/customers': 'Customers',
  '/admin/orders': 'Orders & payments',
  '/admin/plans': 'Products & plans', '/admin/support': 'Support tickets',
  '/admin/content': 'Content', '/admin/audit-log': 'Audit log', '/admin/settings': 'Settings'
}

export default function AdminShell(){
  const { user, logout } = useApp()
  const [mobile, setMobile] = useState(false)
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <><SEO title={`${labels[location.pathname]||'Admin'} Admin Portal`} description="American Business Formations operations portal." path={location.pathname} noindex />
    <a href="#admin-main" className="skip-link">Skip to main content</a>
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobile?'is-open':''}`}>
        <div className="admin-logo-row"><NavLink to="/admin" className="admin-logo"><img src="/logo.webp" alt="American Business Formations" className="brand-mini-light" width="1500" height="486"/><strong>Operations<br/>Portal</strong></NavLink><button className="admin-close" onClick={()=>setMobile(false)} aria-label="Close navigation"><X/></button></div>
        <nav className="admin-nav" aria-label="Primary">
          <NavLink end to="/admin" onClick={()=>setMobile(false)}><LayoutGrid/><span>Overview</span></NavLink>
          <NavLink to="/admin/leads" onClick={()=>setMobile(false)}><Megaphone/><span>Leads</span></NavLink>
          <NavLink to="/admin/applications" onClick={()=>setMobile(false)}><ClipboardList/><span>Applications</span></NavLink>
          <NavLink to="/admin/customers" onClick={()=>setMobile(false)}><Users/><span>Customers</span></NavLink>
          <NavLink to="/admin/orders" onClick={()=>setMobile(false)}><Landmark/><span>Orders & payments</span></NavLink>
          <p>Configuration</p>
          <NavLink to="/admin/plans" onClick={()=>setMobile(false)}><Package/><span>Products & plans</span></NavLink>
          <NavLink to="/admin/content" onClick={()=>setMobile(false)}><FileText/><span>Content</span></NavLink>
          <NavLink to="/admin/settings" onClick={()=>setMobile(false)}><Settings/><span>Formation settings</span></NavLink>
          <p>Operations</p>
          <NavLink to="/admin/support" onClick={()=>setMobile(false)}><MessageSquare/><span>Support tickets</span></NavLink>
          <NavLink to="/admin/audit-log" onClick={()=>setMobile(false)}><ScrollText/><span>Audit log</span></NavLink>
        </nav>
        <div className="admin-side-bottom">
          <button onClick={logout}><LogOut/> Log out</button>
        </div>
      </aside>
      {mobile && <button aria-label="Close navigation" className="admin-overlay" onClick={()=>setMobile(false)}/>}
      <main className="admin-main" id="admin-main" tabIndex={-1}>
        <header className="admin-topbar">
          <button className="admin-menu-btn" onClick={()=>setMobile(true)} aria-label="Open navigation"><Menu/></button>
          <div className="admin-breadcrumb"><ShieldAlert size={17}/><span>{labels[location.pathname]||'Admin'}</span></div>
        </header>
        <div className="admin-page">
          <Outlet/>
        </div>
      </main>
    </div>
  </>
}
