
import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../../types/auth'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  )
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
        <p>Verificando permisos...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
