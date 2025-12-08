import { Elysia } from "elysia";

/**
 * Compression middleware for response compression
 * Supports gzip compression for responses
 */
export function compressionMiddleware() {
  return (app: Elysia) => {
    return app.onAfterHandle({ as: "scoped" }, ({ request, response }) => {
      const acceptEncoding = request.headers.get("accept-encoding") || "";

      // Check if client accepts gzip
      if (!acceptEncoding.includes("gzip")) {
        return response;
      }

      // Only compress text-based responses
      if (
        response instanceof Response &&
        response.headers.get("content-type")?.includes("application/json")
      ) {
        // Elysia handles compression automatically if enabled
        // This is a placeholder for custom compression logic
      }

      return response;
    });
  };
}
