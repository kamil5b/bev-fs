import { Elysia } from 'elysia'

/**
 * Global logging middleware
 * Logs all incoming requests with timestamp and method
 * Applied at server level in index.ts
 */
export function createLoggingMiddleware() {
  return (app: Elysia) => {
    const startTimes = new Map<string, number>()

    app.derive(({ request }) => {
      const timestamp = new Date().toISOString()
      const method = request?.method || 'UNKNOWN'
      const requestId = crypto.randomUUID()
      startTimes.set(requestId, Date.now())

      try {
        const pathname = new URL(request?.url || '', 'http://localhost')
          .pathname
        console.log(`[${timestamp}] ${method} ${pathname} (${requestId})`)
      } catch {
        // Silent fail
      }

      return { requestId }
    })

    app.onAfterHandle(({ request, requestId }) => {
      const duration =
        Date.now() - (startTimes.get(requestId as string) || Date.now())
      const method = request?.method || 'UNKNOWN'
      const pathname = new URL(request?.url || '', 'http://localhost').pathname
      console.log(`✓ ${method} ${pathname} - ${duration}ms (${requestId})`)
      startTimes.delete(requestId as string)
    })
  }
}

/**
 * Example: Create authentication middleware
 *
 * Usage:
 * export const middleware = createAuthMiddleware();
 */
export function createAuthMiddleware() {
  return (app: Elysia) => {
    app.derive(({ headers }) => {
      const authHeader = headers.get('authorization')
      if (!authHeader) {
        throw new Error('Missing authorization header')
      }
      const token = authHeader.replace('Bearer ', '')
      return { authToken: token }
    })
  }
}

/**
 * Example: Create validation middleware
 *
 * Usage:
 * export const middleware = [
 *   createValidationMiddleware({ field: 'email' })
 * ];
 */
export function createValidationMiddleware(schema: Record<string, any>) {
  return (app: Elysia) => {
    app.derive(({ body }) => {
      if (!body || typeof body !== 'object') {
        throw new Error('Request body is required')
      }
      for (const [field] of Object.entries(schema)) {
        if (!(field in body)) {
          throw new Error(`Missing required field: ${field}`)
        }
      }
      return { validatedBody: body }
    })
  }
}
