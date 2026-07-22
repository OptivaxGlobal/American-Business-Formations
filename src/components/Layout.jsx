import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from './ChatWidget'

export default function Layout() {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])
  return <><Header/><main><Outlet/></main><Footer/><ChatWidget/></>
}
