import { MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import SEO from '../components/SEO'
import { api } from '../lib/api'

export default function Reviews(){
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    let cancelled = false
    api.getTestimonials().then(res => { if (!cancelled) setReviews(res.data || []) }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  return <>
    <SEO title="Customer Stories" description="Verified customer stories from founders who formed their LLC with American Business Formations." path="/reviews" />
    <PageHero
      eyebrow="Customer stories"
      title="What our customers say"
      description="We only publish reviews we can verify came from real customers. As formations complete, verified stories will appear here."
    />
    <section className="section"><div className="container">
      {reviews.length > 0
        ? <div className="review-grid">{reviews.map((r,i)=>(
            <Reveal as="article" delay={i%6} key={r.id}>
              <p>&ldquo;{r.quote}&rdquo;</p>
              <div className="person"><div>{r.customer_name?.[0] || '?'}</div><span><strong>{r.customer_name}</strong><small>{r.customer_role}</small></span></div>
            </Reveal>
          ))}</div>
        : <div className="alert-banner info" style={{ maxWidth: 640, margin: '0 auto' }}>
            <MessageSquareText size={20}/>
            <p style={{ margin: 0 }}>We don&rsquo;t have verified customer reviews published yet. We&rsquo;d rather show nothing than a fabricated quote check back as real formations complete, or read about <a href="/about">how we work</a> in the meantime.</p>
          </div>}
    </div></section>
  </>
}
