import { Elysia, t } from 'elysia'
import { login } from '../../../handler/auth.handler'
import type { LoginRequest, AuthResponse } from '../../../../shared'

export default new Elysia().post(
  '/login',
  ({ body, set }): AuthResponse | { message: string } => {
    const result = login(body as LoginRequest)

    if (!result) {
      set.status = 401
      return { message: 'Invalid email or password' }
    }

    return result
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 6 }),
    }),
  }
)
