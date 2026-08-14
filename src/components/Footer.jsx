import { Mail, MapPin, Phone } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaTiktok, FaXTwitter } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { BUSINESS_ADDRESS, BUSINESS_ADDRESS_MAP_URL, SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_TEL } from '../data/seo'

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/americanbusinessformations/', icon: FaFacebookF, cls: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/american_business_formations/', icon: FaInstagram, cls: 'instagram' },
  { label: 'X', href: 'https://x.com/American_bus_F', icon: FaXTwitter, cls: 'x' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@americanbusinessf?lang=en', icon: FaTiktok, cls: 'tiktok' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/americanbusinessformations/', icon: FaPinterestP, cls: 'pinterest' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/american-business-formations/', icon: FaLinkedinIn, cls: 'linkedin' }
]

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
          <p>A guided platform for forming and maintaining your LLC available for businesses forming across all 50 states, Washington, D.C. &amp; Puerto Rico.</p>
          {socialLinks.length > 0 && (
            <div className="social-row">
              {socialLinks.map(({ label, href, icon: Icon, cls }) => (
                <a key={label} className={`social-link ${cls}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon /></a>
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
          <Link to="/blog">Blog</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms and Conditions</Link>
          <Link to="/refund-policy">Refund Policy</Link>
          <Link to="/disclaimer">Legal Disclaimer</Link>
          <p className="footer-contact footer-address"><MapPin size={16}/> <a href={BUSINESS_ADDRESS_MAP_URL} target="_blank" rel="noopener noreferrer">{BUSINESS_ADDRESS}</a></p>
          <p className="footer-contact"><Mail size={16}/> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
          <p className="footer-contact"><Phone size={16}/> <a href={`tel:${SUPPORT_PHONE_TEL}`}>{SUPPORT_PHONE}</a></p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} American Business Formations. All rights reserved. Not a law firm or government agency.</span>
        <div><Link to="/cookie-policy">Cookies</Link><Link to="/accessibility">Accessibility</Link><Link to="/do-not-sell">Do Not Sell My Info</Link></div>
      </div>
    </footer>
  )
}
