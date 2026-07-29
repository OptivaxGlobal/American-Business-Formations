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
import HowItWorks from './pages/HowItWorks'
import Help from './pages/Help'
import FAQPage from './pages/FAQPage'
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
import AdminLeads from './pages/admin/AdminLeads'
import AdminSettings from './pages/admin/AdminSettings'
import AdminPlans from './pages/admin/AdminPlans'
import AdminSupport from './pages/admin/AdminSupport'
import AdminContent from './pages/admin/AdminContent'
import AdminAuditLog from './pages/admin/AdminAuditLog'
import LegalPage from './pages/LegalPage'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'
import { services } from './data/services'

export default function App(){
  return <Routes>
    <Route element={<Layout/>}>
      <Route index element={<Home/>}/>
      <Route path="services" element={<Services/>}/>
      {Object.keys(services).map(slug=><Route key={slug} path={slug} element={<ServicePage forcedSlug={slug}/>}/>) }
      <Route path="pricing" element={<Pricing/>}/>
      <Route path="how-it-works" element={<HowItWorks/>}/>
      <Route path="about" element={<About/>}/>
      <Route path="reviews" element={<Reviews/>}/>
      <Route path="resources" element={<Resources/>}/>
      <Route path="resources/:slug" element={<BlogPost/>}/>
      <Route path="contact" element={<Contact/>}/>
      <Route path="help" element={<Help/>}/>
      <Route path="faq" element={<FAQPage/>}/>
      <Route path="privacy" element={<LegalPage/>}/>
      <Route path="terms" element={<LegalPage/>}/>
      <Route path="disclaimer" element={<LegalPage/>}/>
      <Route path="cookie-policy" element={<LegalPage/>}/>
      <Route path="refund-policy" element={<LegalPage/>}/>
      <Route path="accessibility" element={<LegalPage/>}/>
      <Route path="do-not-sell" element={<LegalPage/>}/>
      <Route path="500" element={<ServerError/>}/>
      <Route path="404" element={<NotFound/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Route>
    <Route path="login" element={<Login/>}/>
    <Route path="signup" element={<Signup/>}/>
    <Route path="verify-email" element={<VerifyEmail/>}/>
    <Route path="forgot-password" element={<ForgotPassword/>}/>
    <Route path="reset-password" element={<ResetPassword/>}/>
    <Route path="two-factor" element={<TwoFactor/>}/>
    <Route path="start" element={<Navigate to="/formation-details" replace/>}/>
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
    <Route path="admin" element={<ProtectedRoute role="admin"><AdminShell/></ProtectedRoute>}>
      <Route index element={<AdminOverview/>}/>
      <Route path="leads" element={<AdminLeads/>}/>
      <Route path="applications" element={<AdminApplications/>}/>
      <Route path="customers" element={<AdminCustomers/>}/>
      <Route path="orders" element={<AdminOrders/>}/>
      <Route path="plans" element={<AdminPlans/>}/>
      <Route path="support" element={<AdminSupport/>}/>
      <Route path="content" element={<AdminContent/>}/>
      <Route path="audit-log" element={<AdminAuditLog/>}/>
      <Route path="settings" element={<AdminSettings/>}/>
    </Route>
  </Routes>
}
