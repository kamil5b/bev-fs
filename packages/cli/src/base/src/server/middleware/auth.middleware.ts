import type { Context } from 'elysia'

export function createAuthMiddleware() {
  return async (ctx: Context) => {
    const authHeader = ctx.request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      try {
        const decoded = JSON.parse(atob(token))
        ctx.set.user = decoded
      } catch (err) {
        console.error('Invalid token:', err)
      }
    }
  }
}

export function requireAuth(ctx: Context) {
  const user = (ctx.set as any).user
  if (!user) {
    ctx.set.status = 401
    return { message: 'Unauthorized' }
  }
  return null
}
