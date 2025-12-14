import { Elysia, t } from 'elysia'
import { signup } from '../../../handler/auth.handler'
import type { SignupRequest, AuthResponse } from '../../../shared'

export default new Elysia().post(
  '/signup',
  ({ body, set }): AuthResponse | { message: string } => {
    try {
      return signup(body as SignupRequest)
    } catch (error: any) {
      set.status = 409
      return { message: error.message || 'Signup failed' }
    }
  },
  {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
    }),
  }
)
