import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RouteFallback from './RouteFallback'

export default function ProtectedRoute({ children, role }) {
  const { user, authStatus } = useApp()
  const location = useLocation()
  // Wait for the startup /api/auth/me check to resolve before deciding
  // whether to redirect otherwise a real, still-valid session gets
  // bounced to /login for the split second before the request returns.
  if (authStatus === 'loading') return <RouteFallback />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
