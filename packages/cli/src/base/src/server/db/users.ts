interface User {
  id: string
  name: string
  email: string
  password: string
}

// In-memory user store (replace with database in production)
export const users: User[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123', // In production, hash this!
  },
]
