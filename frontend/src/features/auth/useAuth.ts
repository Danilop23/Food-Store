
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { authService } from './authService'
import { useAuthStore } from '../../store/authStore'
import type { LoginCredentials, RegisterData } from '../../types/auth'

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const user = await authService.getCurrentUser()
        setUser(user)
        return user
      } catch (error) {
        clearUser()
        throw error
      } finally {
        setLoading(false)
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),

    onSuccess: async () => {
      const user = await authService.getCurrentUser()
      setUser(user)
      queryClient.setQueryData(['currentUser'], user)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const clearUser = useAuthStore((state) => state.clearUser)

  return useMutation({
    mutationFn: () => authService.logout(),

    onSettled: () => {
      clearUser()
      queryClient.clear()
    },
  })
}
