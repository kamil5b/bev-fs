import { multipart } from "@elysiajs/multipart";

/**
 * Example of route-level middleware (multiple)
 * These middlewares will only apply to this route
 * 
 * You can pass either:
 * - A single function: export const middleware = (app) => app.use(something());
 * - An array of functions for multiple middlewares
 */
export const middleware = [
  (app: any) => app.use(multipart()),
  // Add more middlewares here as needed
  // (app) => app.use(authMiddleware()),
  // (app) => app.use(validationMiddleware()),
];

/**
 * Handle file uploads
 * POST /api/upload
 */
export const POST = ({ body }: any) => {
  console.log("Files received:", body);
  
  return {
    success: true,
    message: "File upload endpoint",
    filesReceived: Object.keys(body || {}).length
  };
};
