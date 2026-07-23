import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, Phone, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import { serviceGroups, services } from '../data/services'
import { useApp } from '../context/AppContext'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useApp()
  const dropdownRef = useRef(null)

  const closeAll = () => { setOpen(false); setServicesOpen(false) }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
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
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Guided business formation for founders across the United States</span>
          <a href="tel:+13075550184"><Phone size={14} /> +1 (307) 555-0184</a>
        </div>
      </div>
      <div className="container nav-wrap">
        <Logo />
        <button className="mobile-menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={`main-nav ${open ? 'nav-open' : ''}`}>
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
            <div className="mega-menu" role="menu">
              {serviceGroups.map(group => (
                <div key={group.title}>
                  <h4>{group.title}</h4>
                  {group.items.map(([slug, label]) => {
                    const Icon = services[slug]?.icon
                    return (
                      <Link key={slug} to={`/${slug}`} onClick={closeAll} className="mega-menu-item" role="menuitem">
                        {Icon && <i><Icon size={16} /></i>}
                        <div>
                          <strong>{label}</strong>
                          {services[slug]?.short && <small>{services[slug].short}</small>}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <NavLink to="/pricing" onClick={closeAll}>Pricing</NavLink>
          <NavLink to="/resources" onClick={closeAll}>Resources</NavLink>
          <NavLink to="/about" onClick={closeAll}>About</NavLink>
          <NavLink to="/contact" onClick={closeAll}>Contact</NavLink>
          <div className="nav-actions">
            <Link className="btn btn-ghost" to={user ? (user.role==='admin' ? '/admin' : '/dashboard') : '/login'} onClick={closeAll}>{user ? (user.role==='admin' ? 'Admin portal' : 'Dashboard') : 'Log in'}</Link>
            <Link className="btn btn-primary" to="/start" onClick={closeAll}>Get started</Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
