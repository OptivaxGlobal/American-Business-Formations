import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { serviceGroups } from '../data/services'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>Simple, guided business formation and operational tools for entrepreneurs building in the United States.</p>
          <div className="social-row"><a href="#"><Facebook /></a><a href="#"><Instagram /></a><a href="#"><Linkedin /></a></div>
        </div>
        <div>
          <h4>Formation</h4>
          {serviceGroups[0].items.slice(0, 7).map(([slug, label]) => <Link key={slug} to={`/${slug}`}>{label}</Link>)}
        </div>
        <div>
          <h4>Business tools</h4>
          {serviceGroups[1].items.map(([slug, label]) => <Link key={slug} to={`/${slug}`}>{label}</Link>)}
          <Link to="/pricing">Plans & pricing</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About us</Link><Link to="/reviews">Customer stories</Link><Link to="/resources">Resources</Link><Link to="/contact">Contact</Link>
          <p className="footer-contact"><MapPin size={16}/> Sheridan, Wyoming</p>
          <p className="footer-contact"><Phone size={16}/> +1 (307) 555-0184</p>
          <p className="footer-contact"><Mail size={16}/> support@americanbusinessformations.com</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} American Business Formations. All rights reserved.</span>
        <div><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/disclaimer">Disclaimer</Link><Link to="/cookie-policy">Cookies</Link><Link to="/refund-policy">Refunds</Link><Link to="/accessibility">Accessibility</Link><Link to="/do-not-sell">Do Not Sell My Info</Link></div>
      </div>
    </footer>
  )
}
