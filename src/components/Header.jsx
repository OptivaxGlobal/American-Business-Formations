import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Mail, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import { serviceGroups, services } from '../data/services'
import { useApp } from '../context/AppContext'
import { SUPPORT_EMAIL } from '../data/seo'
import { api } from '../lib/api'
import useFocusTrap from '../hooks/useFocusTrap'

// Mega menu column layout: "Business address services" must appear at the
// top of the right column (previously it was the 3rd item in a flat,
// array-order 2-column grid, which wrapped it to a new row under the LEFT
// column i.e. the bottom-left bug this fixes). Built here as an explicit
// left/right split rather than reordering `serviceGroups` itself, since
// that array is also consumed in its original order by ServiceGrid.jsx
// (Home.jsx's "Start your business" / "Manage your business" sections).
const MEGA_MENU_LEFT_GROUPS = ['Start your business']
const MEGA_MENU_RIGHT_GROUPS = ['Business address services', 'Manage your business']

function MegaMenuGroup({ group, isOpen, onToggle, onSelect }) {
  return (
    <div className="mega-menu-col" key={group.title}>
      <button
        type="button"
        className="mega-menu-col-head"
        onClick={() => onToggle(group.title)}
        aria-expanded={isOpen}
      >
        {group.title}
        <ChevronDown size={14} className="mega-menu-col-chevron" />
      </button>
      {isOpen && group.items.map(([slug, label]) => {
        const Icon = services[slug]?.icon
        return (
          <Link key={slug} to={`/${slug}`} onClick={onSelect} className="mega-menu-item" role="menuitem">
            {Icon && <i><Icon size={16} /></i>}
            <span>{label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(serviceGroups.map(g => [g.title, true])))
  const { user } = useApp()
  const dropdownRef = useRef(null)
  const navRef = useRef(null)
  const mobileToggleRef = useRef(null)
  const [announcement, setAnnouncement] = useState({ enabled: false, message: '' })

  useEffect(() => {
    let cancelled = false
    api.getAnnouncement().then(res => { if (!cancelled) setAnnouncement(res.data) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const toggleGroup = (title) => setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }))

  const closeAll = () => { setOpen(false); setServicesOpen(false) }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape-to-close, Tab focus-trap while the mobile nav panel is open, and
  // focus restoration back to the toggle button on close. The toggle button
  // itself only renders/is clickable under the 900px breakpoint (styles.css),
  // so `open` can only become true from a real mobile-nav interaction.
  const closeNav = () => setOpen(false)
  useFocusTrap(navRef, open, closeNav)

  useEffect(() => {
    if (!open) return
    const onClickOutside = e => {
      if (navRef.current && !navRef.current.contains(e.target) && mobileToggleRef.current && !mobileToggleRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  useEffect(() => {
    if (!servicesOpen) return
    const onKeyDown = e => { if (e.key === 'Escape') setServicesOpen(false) }
    const onClickOutside = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setServicesOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [servicesOpen])

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      {announcement.enabled && announcement.message && (
        <div className="topbar">
          <div className="container topbar-inner">
            <span>{announcement.message}</span>
            <a href={`mailto:${SUPPORT_EMAIL}`}><Mail size={14} /> {SUPPORT_EMAIL}</a>
          </div>
        </div>
      )}
      <div className="container nav-wrap">
        <Logo />
        <button ref={mobileToggleRef} className="mobile-menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
        <nav ref={navRef} className={`main-nav ${open ? 'nav-open' : ''}`}>
          <NavLink to="/llc-formation" onClick={closeAll}>Form an LLC</NavLink>
          <div
            className={`nav-dropdown ${servicesOpen ? 'is-open' : ''}`}
            ref={dropdownRef}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button onClick={() => setServicesOpen(!servicesOpen)} aria-haspopup="true" aria-expanded={servicesOpen}>
              Services <ChevronDown size={16} />
            </button>
            <div className="mega-menu mega-menu-compact" role="menu">
              <div className="mega-menu-columns">
                <div className="mega-menu-col-stack">
                  {MEGA_MENU_LEFT_GROUPS.map(title => serviceGroups.find(g => g.title === title)).filter(Boolean).map(group => (
                    <MegaMenuGroup key={group.title} group={group} isOpen={openGroups[group.title]} onToggle={toggleGroup} onSelect={closeAll} />
                  ))}
                </div>
                <div className="mega-menu-col-stack">
                  {/* .find() in MEGA_MENU_RIGHT_GROUPS order, not serviceGroups'
                      own order a plain .filter() here previously rendered
                      "Manage your business" above "Business address services"
                      because that's their relative order in serviceGroups,
                      silently undoing the whole point of this layout. */}
                  {MEGA_MENU_RIGHT_GROUPS.map(title => serviceGroups.find(g => g.title === title)).filter(Boolean).map(group => (
                    <MegaMenuGroup key={group.title} group={group} isOpen={openGroups[group.title]} onToggle={toggleGroup} onSelect={closeAll} />
                  ))}
                </div>
              </div>
              <div className="mega-menu-cta">
                <span>Ready to make your business official?</span>
                <Link to="/formation-details" onClick={closeAll} className="btn btn-primary btn-sm" role="menuitem">
                  Start My LLC <ArrowRight size={15}/>
                </Link>
              </div>
            </div>
          </div>
          <NavLink to="/how-it-works" onClick={closeAll}>How It Works</NavLink>
          <NavLink to="/pricing" onClick={closeAll}>Pricing</NavLink>
          <NavLink to="/resources" onClick={closeAll}>Resources</NavLink>
          <NavLink to="/blog" onClick={closeAll}>Blog</NavLink>
          <NavLink to="/about" onClick={closeAll}>About</NavLink>
          <NavLink to="/contact" onClick={closeAll}>Contact</NavLink>
          <div className="nav-actions">
            <Link className="btn btn-ghost" to={user ? (user.role==='admin' ? '/admin' : '/dashboard') : '/login'} onClick={closeAll}>{user ? (user.role==='admin' ? 'Admin portal' : 'Dashboard') : 'Sign In'}</Link>
            <Link className="btn btn-primary" to="/formation-details" onClick={closeAll}>Start My LLC</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
