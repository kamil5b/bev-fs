import { Elysia } from 'elysia';
import { getProductProgress, createProductProgress } from '../../../../handler/product.handler';
import { createRouteCustomMiddleware } from '../../../../middleware';

/**
 * MIDDLEWARE INHERITANCE CHAIN for /api/product/:id/progress:
 * 
 * 1. Global middleware from server setup
 * 2. Parent /product middleware (timing, logging)
 * 3. Parent /product/[id] middleware (ID validation)
 * 4. This route's middleware (if defined at route level)
 * 5. Method-specific middleware (authorization, etc)
 * 
 * Current setup: method-specific middleware only
 */
export const middleware = {
  GET: [
    (app: Elysia) => {
      // Log progress fetch
      app.derive(() => ({
        action: 'fetch_progress',
      }));
    },
  ],
  POST: [
    (app: Elysia) => {
      // Validate progress creation
      app.derive(({ body }) => {
        if (!body?.status || !body?.percentage) {
          throw new Error('Missing required fields: status, percentage');
        }
        return {};
      });
    },
    createRouteCustomMiddleware(),
  ],
};

// GET /api/product/:id/progress - list progress for a product
export const GET = ({ params }: any) => {
  return getProductProgress(params);
};

// POST /api/product/:id/progress - create progress entry
export const POST = ({ params, body }: any) => {
  return createProductProgress(params, body);
};
