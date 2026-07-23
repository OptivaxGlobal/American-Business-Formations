import { Star } from 'lucide-react'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
const reviews=[
  ['Maya Reynolds','Creative agency founder','The guided questions made the setup feel approachable. I always knew what was complete and what needed attention.'],
  ['James Walker','Consulting business owner','The dashboard is the best part. Documents, status, reminders, and services all live in one place.'],
  ['Sofia Bennett','Online shop founder','I could prepare my business information before the filing conversation, which saved a lot of back and forth.'],
  ['Noah Harris','Property services owner','The site feels professional on mobile and desktop. The onboarding steps are simple and easy to follow.'],
  ['Ava Collins','Wellness brand founder','The service pages explain the purpose clearly without overwhelming me with legal language.'],
  ['Ethan Brooks','Technology consultant','I like that the structure is ready for real backend integrations while still working as a frontend demo.']
]
export default function Reviews(){return <>
  <SEO title="Customer Stories" description="Sample testimonial content for the completed UI project." path="/reviews" />
  <PageHero
    eyebrow="Customer stories"
    title="Founders deserve a calmer starting experience"
    description="Sample testimonial content for the completed UI project."
    actions={<div className="rating-badge"><div>★★★★★</div><strong>4.8 out of 5</strong><small>Based on sample project content</small></div>}
  />
  <section className="section"><div className="container review-grid">{reviews.map(([name,role,text],i)=><Reveal as="article" delay={i%6} key={name}><div className="stars">★★★★★</div><p>“{text}”</p><div className="person"><div>{name[0]}</div><span><strong>{name}</strong><small>{role}</small></span></div></Reveal>)}</div></section>
</>}
