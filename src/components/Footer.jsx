import { Linkedin, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { SUPPORT_EMAIL } from '../data/seo'

const formationLinks = [
  ['llc-formation', 'LLC Formation'],
  ['registered-agent', 'Registered Agent'],
  ['ein', 'EIN Assistance'],
  ['operating-agreement', 'Operating Agreement'],
  ['texas-dba', 'DBA / Assumed Name']
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>A guided platform for forming and maintaining your LLC currently available for businesses forming in Texas.</p>
          <div className="social-row"><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin /></a></div>
        </div>
        <div>
          <h4>Formation</h4>
          {formationLinks.map(([slug, label]) => <Link key={slug} to={`/${slug}`}>{label}</Link>)}
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/login">Sign In</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms and Conditions</Link>
          <Link to="/refund-policy">Refund Policy</Link>
          <Link to="/disclaimer">Legal Disclaimer</Link>
          <p className="footer-contact"><Mail size={16}/> {SUPPORT_EMAIL}</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} American Business Formations. All rights reserved. Not a law firm or government agency.</span>
        <div><Link to="/cookie-policy">Cookies</Link><Link to="/accessibility">Accessibility</Link><Link to="/do-not-sell">Do Not Sell My Info</Link></div>
      </div>
    </footer>
  )
}
