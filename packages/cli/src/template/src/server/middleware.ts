import { Elysia } from 'elysia'

/**
 * Request logging middleware with timing
 */
export function createLoggingMiddleware() {
  return (app: Elysia) => {
    return app
      .derive({ as: 'scoped' }, ({ request }) => {
        const startTime = Date.now()
        const timestamp = new Date().toISOString()
        const method = request.method
        const pathname = new URL(request.url).pathname
        console.log(`[${timestamp}] ${method} ${pathname}`)
        return { startTime }
      })
      .onAfterHandle({ as: 'scoped' }, ({ request, startTime }) => {
        const duration = Date.now() - startTime
        const method = request.method
        const pathname = new URL(request.url).pathname
        console.log(`${method} ${pathname} - ${duration}ms`)
      })
  }
}

/**
 * Example custom middleware
 */
export function createRouteCustomMiddleware() {
  return (app: Elysia) => {
    return app.onBeforeHandle(({ request }) => {
      // Add custom logic here (e.g., authentication, validation)
      console.log('Custom middleware executed for:', request.url)
    })
  }
}
