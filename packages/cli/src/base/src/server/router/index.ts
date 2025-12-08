import { Elysia } from "elysia";

/**
 * Root API route middleware
 * Applied to: GET /, POST /
 * Also inherited by all nested routes: /upload, etc.
 */
export const middleware = [
  (app: Elysia) => {
    app.derive(({ request }) => {
      const requestId = crypto.randomUUID();
      return { requestId };
    });
  },
];

/**
 * GET / - API health check
 */
export const GET = ({ requestId }: any) => {
  return {
    message: "Welcome to bev-fs API",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    requestId
  };
};

/**
 * POST / - Create something
 */
export const POST = ({ body, requestId }: any) => {
  return {
    success: true,
    message: "POST received",
    requestId,
    body
  };
};
