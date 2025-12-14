import { Elysia } from 'elysia'
import { logout } from '../../../handler/auth.handler'
import type { LogoutResponse } from '../../../../shared'

export default new Elysia().post('/logout', (): LogoutResponse => {
  return logout()
})
