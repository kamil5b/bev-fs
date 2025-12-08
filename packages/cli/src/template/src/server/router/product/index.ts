import { Elysia } from 'elysia';
import { getProducts, createProduct } from '../../handler/product.handler';

/**
 * Middleware that applies to all product routes and sub-routes
 * Examples: /api/product, /api/product/[id], /api/product/[id]/progress
 */
export const middleware = [
  (app: Elysia) => {
    app.derive(({ request }) => ({
      startTime: Date.now(),
    }));
  },
];

// GET /api/product - list all products
export const GET = () => {
  return getProducts();
};

// POST /api/product - create a product
// Method-specific middleware just for POST
export const POST = ({ body }: any) => {
  return createProduct(body);
};
