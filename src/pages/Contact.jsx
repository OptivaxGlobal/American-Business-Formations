import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import { api, withLocalFallback } from '../lib/api'
import { useApp } from '../context/AppContext'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'

export default function Contact(){
  const [loading,setLoading]=useState(false); const {notify}=useApp()
  const submit=async e=>{e.preventDefault();setLoading(true);const payload=Object.fromEntries(new FormData(e.currentTarget));await withLocalFallback(()=>api.submitLead(payload),()=>({ok:true}));setLoading(false);e.currentTarget.reset();notify('Your message has been received.')}
  return <>
    <PageHero eyebrow="Contact our team" title="Tell us how we can help" description="Use the form for formation questions, service requests, partnership inquiries, or project support." />
    <section className="section"><div className="container contact-grid">
      <Reveal as="div" delay={0} className="contact-details"><h2>Start a conversation</h2><p>Our sample contact information and support schedule can be replaced with your real company details.</p><div><Phone/><span><strong>Call</strong><a href="tel:+13075550184">+1 (307) 555-0184</a></span></div><div><Mail/><span><strong>Email</strong><a href="mailto:support@americanbusinessformations.com">support@americanbusinessformations.com</a></span></div><div><Clock/><span><strong>Support hours</strong><p>Monday–Friday, 9:00 AM–6:00 PM ET</p></span></div><div><MapPin/><span><strong>Mailing office</strong><p>Sheridan, Wyoming, United States</p></span></div></Reveal>
      <Reveal as="form" delay={1} className="contact-form" onSubmit={submit}><div className="form-grid"><label>First name<input required name="first_name"/></label><label>Last name<input required name="last_name"/></label><label>Email<input required type="email" name="email"/></label><label>Phone<input name="phone"/></label></div><label>What do you need help with?<select name="service"><option>LLC Formation</option><option>Registered Agent</option><option>EIN</option><option>Licenses & Permits</option><option>Trademark</option><option>Website & Branding</option><option>Other</option></select></label><label>Message<textarea required rows="6" name="message" placeholder="Share the important details..."></textarea></label><button className="btn btn-primary" disabled={loading}>{loading?'Sending...':'Send message'} <Send size={18}/></button></Reveal>
    </div></section>
  </>}
