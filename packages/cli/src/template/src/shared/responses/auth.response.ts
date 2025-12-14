import type { User } from '../entities/user.entity'

export interface AuthResponse {
  token: string
  user: User
}

export interface LogoutResponse {
  message: string
}
