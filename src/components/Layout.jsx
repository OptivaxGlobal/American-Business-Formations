import { Outlet, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { organizationSchema, websiteSchema } from '../data/seo'

const ChatWidget = lazy(() => import('./ChatWidget'))

export default function Layout() {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])
  useEffect(() => {
    // Site-wide schema (present on every page, not per-route like SEO.jsx's
    // Service/Article/FAQPage/BreadcrumbList graphs): who the business is
    // and what the site is, once each.
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({ '@context': 'https://schema.org', '@graph': [organizationSchema, websiteSchema].map(({ '@context': _drop, ...rest }) => rest) })
    document.head.appendChild(script)
    return () => script.remove()
  }, [])
  return <>
    <Header/><main id="main-content" tabIndex={-1}><Outlet/></main><Footer/>
    <Suspense fallback={null}><ChatWidget/></Suspense>
  </>
}
