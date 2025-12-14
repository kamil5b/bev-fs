import { users } from '../db/users'
import type { User, LoginRequest, SignupRequest, AuthResponse } from '../../shared'

export const authRepository = {
  // Find user by email
  getUserByEmail(email: string): User | undefined {
    return users.find((u) => u.email === email)
  },

  // Check if user exists by email
  userExists(email: string): boolean {
    return users.some((u) => u.email === email)
  },

  // Create new user
  createUser(data: SignupRequest): User {
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      createdAt: new Date(),
    }
    users.push({
      ...newUser,
      password: data.password, // Store password separately
    })
    return newUser
  },

  // Get all users (for admin purposes)
  getAllUsers(): Omit<User, 'password'>[] {
    return users.map(({ password, ...user }) => user)
  },
}
