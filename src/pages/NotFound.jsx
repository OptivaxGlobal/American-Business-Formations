import { Link } from 'react-router-dom'
export default function NotFound(){return <section className="not-found"><div><span>404</span><h1>This page could not be found.</h1><p>The link may be outdated or the page may have moved.</p><Link className="btn btn-primary" to="/">Return home</Link></div></section>}
