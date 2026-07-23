import {
  ClipboardList, FileText, Landmark, LayoutGrid, LogOut, MapPin, Menu,
  MessageSquare, Package, ScrollText, ShieldAlert, Users, X
} from 'lucide-react'
import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import SEO from '../SEO'

const labels = {
  '/admin': 'Overview', '/admin/applications': 'Applications', '/admin/customers': 'Customers',
  '/admin/orders': 'Orders & payments', '/admin/states': 'State configuration',
  '/admin/plans': 'Products & plans', '/admin/support': 'Support tickets',
  '/admin/content': 'Content', '/admin/audit-log': 'Audit log'
}

export default function AdminShell(){
  const { user, logout } = useApp()
  const [mobile, setMobile] = useState(false)
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <><SEO title={`${labels[location.pathname]||'Admin'} — Admin Portal`} description="American Business Formations operations portal." path={location.pathname} noindex />
    <div className="studio-app admin-shell">
      <aside className={`studio-sidebar ${mobile?'is-open':''}`}>
        <div className="studio-logo-row"><NavLink to="/admin" className="studio-logo"><img src="/logo.webp" alt="American Business Formations" className="brand-mini"/><strong>Operations<br/>Portal</strong></NavLink><button className="studio-close" onClick={()=>setMobile(false)} aria-label="Close navigation"><X/></button></div>
        <nav className="studio-nav">
          <NavLink end to="/admin" onClick={()=>setMobile(false)}><LayoutGrid/><span>Overview</span></NavLink>
          <NavLink to="/admin/applications" onClick={()=>setMobile(false)}><ClipboardList/><span>Applications</span></NavLink>
          <NavLink to="/admin/customers" onClick={()=>setMobile(false)}><Users/><span>Customers</span></NavLink>
          <NavLink to="/admin/orders" onClick={()=>setMobile(false)}><Landmark/><span>Orders & payments</span></NavLink>
          <p>Configuration</p>
          <NavLink to="/admin/states" onClick={()=>setMobile(false)}><MapPin/><span>States</span></NavLink>
          <NavLink to="/admin/plans" onClick={()=>setMobile(false)}><Package/><span>Products & plans</span></NavLink>
          <NavLink to="/admin/content" onClick={()=>setMobile(false)}><FileText/><span>Content</span></NavLink>
          <p>Operations</p>
          <NavLink to="/admin/support" onClick={()=>setMobile(false)}><MessageSquare/><span>Support tickets</span></NavLink>
          <NavLink to="/admin/audit-log" onClick={()=>setMobile(false)}><ScrollText/><span>Audit log</span></NavLink>
        </nav>
        <div className="studio-side-bottom">
          <button onClick={logout}><LogOut/> Log out</button>
        </div>
      </aside>
      {mobile && <button aria-label="Close navigation" className="studio-overlay" onClick={()=>setMobile(false)}/>}
      <main className="studio-main">
        <header className="studio-topbar">
          <button className="studio-menu" onClick={()=>setMobile(true)} aria-label="Open navigation"><Menu/></button>
          <div className="studio-breadcrumb"><ShieldAlert size={17}/><span>{labels[location.pathname]||'Admin'}</span></div>
        </header>
        <div className="studio-page">
          <Outlet/>
        </div>
      </main>
    </div>
  </>
}
