import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { SUPPORT_EMAIL } from '../data/seo'

// Real, verified social profile URLs go here once they exist (e.g.
// { label: 'LinkedIn', href: 'https://www.linkedin.com/company/...', icon: Linkedin }).
// Intentionally empty for now rather than linking a generic, non-company URL.
const socialLinks = []

const formationLinks = [
  ['llc-formation', 'LLC Formation'],
  ['business-formation-filings', 'Business Formation Filings'],
  ['registered-agent', 'Registered Agent'],
  ['ein', 'EIN & S-Corp Elections'],
  ['s-corp-election', 'S-Corp Election'],
  ['operating-agreement', 'Operating Agreement'],
  ['texas-dba', 'DBA / Assumed Name'],
  ['compliance-filings', 'Compliance Filings'],
  ['certificate-of-good-standing', 'Certificate of Good Standing'],
  ['apostille-services', 'Apostille Services'],
  ['mail-forwarding', 'Mail Forwarding']
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>A guided platform for forming and maintaining your LLC currently available for businesses forming in Texas.</p>
          {socialLinks.length > 0 && (
            <div className="social-row">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}><Icon /></a>
              ))}
            </div>
          )}
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
