import { Elysia } from 'elysia'

/**
 * Route-level middleware for upload route
 *
 * INHERITS middleware from parent route (root /)
 * Middleware chain:
 *  1. Root middleware (request ID generation)
 *  2. This route's middleware (file validation)
 *  3. Handler execution
 */
export const middleware = [
  (app: Elysia) => {
    app.derive(({ body }) => {
      // Validate that files are provided - handle null/undefined body
      const bodyKeys = body && typeof body === 'object' ? Object.keys(body) : []
      if (bodyKeys.length === 0) {
        throw new Error('No files provided')
      }
      return { filesCount: bodyKeys.length }
    })

    return app
  },
]

/**
 * Handle file uploads
 * POST /api/upload
 *
 * Example with curl:
 * curl -F "file=@document.pdf" http://localhost:3000/api/upload
 */
export const POST = ({ body, requestId, filesCount }: any) => {
  // Handle null/undefined body safely
  const fileKeys = body && typeof body === 'object' ? Object.keys(body) : []
  console.log(`[${requestId}] Files received:`, fileKeys)

  return {
    success: true,
    message: 'File upload successful',
    requestId,
    filesCount,
    files: fileKeys,
  }
}
