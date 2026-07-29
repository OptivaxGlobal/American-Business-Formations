import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children, role }) {
  const { user } = useApp()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
