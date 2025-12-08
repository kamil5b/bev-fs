import { getProductProgress, createProductProgress } from '../../../../handler/product.handler';
import { createRouteCustomMiddleware } from '../../../../middleware';

/**
 * Apply per-method middleware
 * Both GET and POST use the same custom middleware
 * But you can customize per method if needed
 */
export const middleware = {
  GET: createRouteCustomMiddleware(),
  POST: createRouteCustomMiddleware(),
};

// GET /api/product/:id/progress - list progress for a product
export const GET = ({ params }: any) => {
  return getProductProgress(params);
};

// POST /api/product/:id/progress - create progress entry
export const POST = ({ params, body }: any) => {
  return createProductProgress(params, body);
};
