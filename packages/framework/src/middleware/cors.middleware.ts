import { Elysia } from 'elysia'

export interface CorsOptions {
  origin?: string | string[] | RegExp
  methods?: string[]
  allowedHeaders?: string[]
  credentials?: boolean
}

/**
 * CORS (Cross-Origin Resource Sharing) middleware
 */
export function corsMiddleware(options: CorsOptions = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = false,
  } = options

  return (app: Elysia) => {
    return app.onBeforeHandle(({ request, set }) => {
      const originHeader = request.headers.get('origin')

      // Determine allowed origin
      let allowOrigin = '*'
      if (typeof origin === 'string') {
        allowOrigin = origin
      } else if (Array.isArray(origin)) {
        allowOrigin = origin.includes(originHeader || '')
          ? originHeader || '*'
          : origin[0]
      } else if (origin instanceof RegExp) {
        allowOrigin = origin.test(originHeader || '')
          ? originHeader || '*'
          : 'null'
      }

      // Set CORS headers
      set.headers['Access-Control-Allow-Origin'] = allowOrigin
      set.headers['Access-Control-Allow-Methods'] = methods.join(', ')
      set.headers['Access-Control-Allow-Headers'] = allowedHeaders.join(', ')

      if (credentials) {
        set.headers['Access-Control-Allow-Credentials'] = 'true'
      }

      // Handle OPTIONS requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204 })
      }
    })
  }
}
