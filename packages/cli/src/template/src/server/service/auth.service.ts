import { authRepository } from '../repository/auth.repository'
import type { LoginRequest, SignupRequest, AuthResponse, User } from '../../shared'

export const authService = {
  // Login logic
  login(credentials: LoginRequest): AuthResponse | null {
    const user = authRepository.getUserByEmail(credentials.email)

    if (!user) {
      return null
    }

    // Find the full user object with password for validation
    const fullUser = (global as any).__users?.find(
      (u: any) => u.email === credentials.email
    )
    if (!fullUser || fullUser.password !== credentials.password) {
      return null
    }

    // Generate token
    const token = btoa(JSON.stringify({ id: user.id, email: user.email }))

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  },

  // Signup logic
  signup(data: SignupRequest): AuthResponse {
    if (authRepository.userExists(data.email)) {
      throw new Error('User already exists')
    }

    const newUser = authRepository.createUser(data)

    // Generate token
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email }))

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    }
  },

  // Logout logic
  logout(): { message: string } {
    return { message: 'Logged out successfully' }
  },
}
