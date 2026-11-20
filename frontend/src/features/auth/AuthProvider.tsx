
import { useEffect, type ReactNode } from 'react'

import { useCurrentUser } from './useAuth'
import { useAuthStore } from '../../store/authStore'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoading } = useCurrentUser()
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    if (!isLoading) {
      setLoading(false)
    }
  }, [isLoading, setLoading])

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
        <p>Verificando sesión...</p>
      </div>
    )
  }

  return <>{children}</>
}
