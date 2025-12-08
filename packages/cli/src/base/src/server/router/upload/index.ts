import { Elysia } from "elysia";

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
      // Validate that files are provided
      if (!body || Object.keys(body).length === 0) {
        throw new Error("No files provided");
      }
      return { filesCount: Object.keys(body).length };
    });
  },
];

/**
 * Handle file uploads
 * POST /api/upload
 * 
 * Example with curl:
 * curl -F "file=@document.pdf" http://localhost:3000/api/upload
 */
export const POST = ({ body, requestId, filesCount }: any) => {
  console.log(`[${requestId}] Files received:`, Object.keys(body));
  
  return {
    success: true,
    message: "File upload successful",
    requestId,
    filesCount,
    files: Object.keys(body || {})
  };
};
