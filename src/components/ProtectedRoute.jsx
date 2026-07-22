import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children }) {
  const { user } = useApp()
  const location = useLocation()
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />
}
