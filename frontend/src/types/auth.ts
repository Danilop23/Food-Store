
export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: UserRole
  disabled: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  full_name: string
  email: string
  password: string
}

export interface AuthResponse {
  message: string
}
