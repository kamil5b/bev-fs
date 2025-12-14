import { authService } from '../service/auth.service'
import type { LoginRequest, SignupRequest } from '../../shared'

// Login Handler
export const login = (body: LoginRequest) => {
  return authService.login(body)
}

// Signup Handler
export const signup = (body: SignupRequest) => {
  return authService.signup(body)
}

// Logout Handler
export const logout = () => {
  return authService.logout()
}
