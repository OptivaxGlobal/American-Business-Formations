import { Link } from 'react-router-dom'
import { RefreshCcw } from 'lucide-react'
import SEO from '../components/SEO'
import { SUPPORT_EMAIL } from '../data/seo'

export default function ServerError() {
  return <>
    <SEO title="Something Went Wrong" description="We hit an unexpected error. Please try again." path="/500" noindex />
    <section className="not-found">
      <div>
        <span>500</span>
        <h1>Something went wrong on our end.</h1>
        <p>This wasn&rsquo;t your fault try again in a moment, or reach us at {SUPPORT_EMAIL} if it keeps happening.</p>
        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginTop:8}}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}><RefreshCcw size={18}/> Try again</button>
          <Link className="btn btn-outline" to="/">Return home</Link>
        </div>
      </div>
    </section>
  </>
}
