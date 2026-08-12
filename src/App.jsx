import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RouteFallback from './components/RouteFallback'
import { services } from './data/services'

const Home = lazy(() => import('./pages/Home'))
const ServicePage = lazy(() => import('./pages/ServicePage'))
const VirtualOffice = lazy(() => import('./pages/VirtualOffice'))
const Services = lazy(() => import('./pages/Services'))
const Pricing = lazy(() => import('./pages/Pricing'))
const About = lazy(() => import('./pages/About'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Resources = lazy(() => import('./pages/Resources'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Contact = lazy(() => import('./pages/Contact'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Help = lazy(() => import('./pages/Help'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const DashboardShell = lazy(() => import('./components/dashboard/DashboardShell'))
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'))
const Businesses = lazy(() => import('./pages/dashboard/Businesses'))
const BusinessDetail = lazy(() => import('./pages/dashboard/BusinessDetail'))
const Orders = lazy(() => import('./pages/dashboard/Orders'))
const Billing = lazy(() => import('./pages/dashboard/Billing'))
const Support = lazy(() => import('./pages/dashboard/Support'))
const Notifications = lazy(() => import('./pages/dashboard/Notifications'))
const Settings = lazy(() => import('./pages/dashboard/Settings'))
const Guide = lazy(() => import('./pages/dashboard/Guide'))
const AdminShell = lazy(() => import('./components/admin/AdminShell'))
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminPlans = lazy(() => import('./pages/admin/AdminPlans'))
const AdminSupport = lazy(() => import('./pages/admin/AdminSupport'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminAuditLog = lazy(() => import('./pages/admin/AdminAuditLog'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ServerError = lazy(() => import('./pages/ServerError'))

export default function App(){
  return <Suspense fallback={<RouteFallback/>}><Routes>
    <Route element={<Layout/>}>
      <Route index element={<Home/>}/>
      <Route path="services" element={<Services/>}/>
      <Route path="virtual-office" element={<VirtualOffice/>}/>
      {/* virtual-office has its own dedicated page above (richer, multi-section
          content per its scope) — excluded here so the generic ServicePage
          template never claims the same URL. */}
      {Object.keys(services).filter(slug => slug !== 'virtual-office').map(slug=><Route key={slug} path={slug} element={<ServicePage forcedSlug={slug}/>}/>) }
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
  </Routes></Suspense>
}
