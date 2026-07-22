import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ServicePage from './pages/ServicePage'
import Services from './pages/Services'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Reviews from './pages/Reviews'
import Resources from './pages/Resources'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import StudioShell from './components/studio/StudioShell'
import Boarding from './pages/studio/Boarding'
import StudioHome from './pages/studio/StudioHome'
import StudioSection from './pages/studio/StudioSection'
import BrandStudio from './pages/studio/BrandStudio'
import WebsiteStudio from './pages/studio/WebsiteStudio'
import MarketingStudio from './pages/studio/MarketingStudio'
import AIToolkit from './pages/studio/AIToolkit'
import LegalPage from './pages/LegalPage'
import NotFound from './pages/NotFound'
import { services } from './data/services'

export default function App(){
  return <Routes>
    <Route element={<Layout/>}>
      <Route index element={<Home/>}/>
      <Route path="services" element={<Services/>}/>
      {Object.keys(services).map(slug=><Route key={slug} path={slug} element={<ServicePage forcedSlug={slug}/>}/>) }
      <Route path="pricing" element={<Pricing/>}/>
      <Route path="about" element={<About/>}/>
      <Route path="reviews" element={<Reviews/>}/>
      <Route path="resources" element={<Resources/>}/>
      <Route path="resources/:slug" element={<BlogPost/>}/>
      <Route path="contact" element={<Contact/>}/>
      <Route path="privacy" element={<LegalPage/>}/>
      <Route path="terms" element={<LegalPage/>}/>
      <Route path="disclaimer" element={<LegalPage/>}/>
      <Route path="404" element={<NotFound/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Route>
    <Route path="login" element={<Login/>}/>
    <Route path="signup" element={<Signup/>}/>
    <Route path="start" element={<Navigate to="/boarding/131616968/stage" replace/>}/>
    <Route path="formation-details" element={<Onboarding/>}/>
    <Route path="dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
    <Route path="boarding/:id/:step" element={<Boarding/>}/>
    <Route path="studio" element={<StudioShell/>}>
      <Route index element={<StudioHome/>}/>
      <Route path="business" element={<StudioSection section="business"/>}/>
      <Route path="formation" element={<StudioSection section="formation"/>}/>
      <Route path="compliance" element={<StudioSection section="compliance"/>}/>
      <Route path="finance" element={<StudioSection section="finance"/>}/>
      <Route path="brand" element={<BrandStudio/>}/>
      <Route path="website" element={<WebsiteStudio/>}/>
      <Route path="marketing" element={<MarketingStudio/>}/>
      <Route path="ai-tools" element={<AIToolkit/>}/>
    </Route>
  </Routes>
}
