import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ServicePage from './pages/ServicePage'
import StateServicePage from './pages/StateServicePage'
import Services from './pages/Services'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Reviews from './pages/Reviews'
import Resources from './pages/Resources'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TwoFactor from './pages/TwoFactor'
import Onboarding from './pages/Onboarding'
import DashboardShell from './components/dashboard/DashboardShell'
import DashboardHome from './pages/dashboard/DashboardHome'
import Businesses from './pages/dashboard/Businesses'
import BusinessDetail from './pages/dashboard/BusinessDetail'
import Orders from './pages/dashboard/Orders'
import Billing from './pages/dashboard/Billing'
import Support from './pages/dashboard/Support'
import Notifications from './pages/dashboard/Notifications'
import Settings from './pages/dashboard/Settings'
import Guide from './pages/dashboard/Guide'
import AdminShell from './components/admin/AdminShell'
import AdminOverview from './pages/admin/AdminOverview'
import AdminApplications from './pages/admin/AdminApplications'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminStates from './pages/admin/AdminStates'
import AdminPlans from './pages/admin/AdminPlans'
import AdminSupport from './pages/admin/AdminSupport'
import AdminContent from './pages/admin/AdminContent'
import AdminAuditLog from './pages/admin/AdminAuditLog'
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
      <Route path="llc-formation/:state" element={<StateServicePage/>}/>
      <Route path="pricing" element={<Pricing/>}/>
      <Route path="about" element={<About/>}/>
      <Route path="reviews" element={<Reviews/>}/>
      <Route path="resources" element={<Resources/>}/>
      <Route path="resources/:slug" element={<BlogPost/>}/>
      <Route path="contact" element={<Contact/>}/>
      <Route path="privacy" element={<LegalPage/>}/>
      <Route path="terms" element={<LegalPage/>}/>
      <Route path="disclaimer" element={<LegalPage/>}/>
      <Route path="cookie-policy" element={<LegalPage/>}/>
      <Route path="refund-policy" element={<LegalPage/>}/>
      <Route path="accessibility" element={<LegalPage/>}/>
      <Route path="do-not-sell" element={<LegalPage/>}/>
      <Route path="404" element={<NotFound/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Route>
    <Route path="login" element={<Login/>}/>
    <Route path="signup" element={<Signup/>}/>
    <Route path="verify-email" element={<VerifyEmail/>}/>
    <Route path="forgot-password" element={<ForgotPassword/>}/>
    <Route path="reset-password" element={<ResetPassword/>}/>
    <Route path="two-factor" element={<TwoFactor/>}/>
    <Route path="start" element={<Navigate to="/boarding/131616968/stage" replace/>}/>
    <Route path="formation-details" element={<Onboarding/>}/>
    <Route path="dashboard" element={<ProtectedRoute><DashboardShell/></ProtectedRoute>}>
      <Route index element={<DashboardHome/>}/>
      <Route path="businesses" element={<Businesses/>}/>
      <Route path="businesses/:id" element={<BusinessDetail/>}/>
      <Route path="orders" element={<Orders/>}/>
      <Route path="billing" element={<Billing/>}/>
      <Route path="support" element={<Support/>}/>
      <Route path="notifications" element={<Notifications/>}/>
      <Route path="settings" element={<Settings/>}/>
      <Route path="guide" element={<Guide/>}/>
    </Route>
    <Route path="admin" element={<AdminShell/>}>
      <Route index element={<AdminOverview/>}/>
      <Route path="applications" element={<AdminApplications/>}/>
      <Route path="customers" element={<AdminCustomers/>}/>
      <Route path="orders" element={<AdminOrders/>}/>
      <Route path="states" element={<AdminStates/>}/>
      <Route path="plans" element={<AdminPlans/>}/>
      <Route path="support" element={<AdminSupport/>}/>
      <Route path="content" element={<AdminContent/>}/>
      <Route path="audit-log" element={<AdminAuditLog/>}/>
    </Route>
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
