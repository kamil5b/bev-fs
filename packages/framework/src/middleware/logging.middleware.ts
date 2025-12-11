import { Elysia } from 'elysia'

/**
 * Logging middleware for request/response logging
 */
export function loggingMiddleware() {
  return (app: Elysia) => {
    return app.onBeforeHandle(({ request }) => {
      const { method, url } = request
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] ${method} ${url}`)
    })
  }
}

/**
 * Request/response logging with timing
 */
export function requestTimingMiddleware() {
  return (app: Elysia) => {
    return app
      .derive({ as: 'scoped' }, ({ request }) => {
        const startTime = Date.now()
        return { startTime }
      })
      .onAfterHandle({ as: 'scoped' }, ({ request, startTime }) => {
        const duration = Date.now() - startTime
        const { method, url } = request
        console.log(`${method} ${url} - ${duration}ms`)
      })
  }
}
