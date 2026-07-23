import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from './ChatWidget'
import { organizationSchema } from '../data/seo'

export default function Layout() {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(organizationSchema)
    document.head.appendChild(script)
    return () => script.remove()
  }, [])
  return <><Header/><main><Outlet/></main><Footer/><ChatWidget/></>
}
