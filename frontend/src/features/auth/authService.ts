
import { api } from '../../api/client'

import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '../../types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new URLSearchParams()

    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await api.post<AuthResponse>(
      '/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )

    return response.data
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>(
      '/usuarios/registro',
      data,
    )

    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  async logout(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/logout')
    return response.data
  },
}
