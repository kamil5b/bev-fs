import { Elysia } from 'elysia';
import { getProduct, updateProduct, deleteProduct } from '../../../handler/product.handler';

/**
 * Middleware specific to product/:id and its sub-routes
 * INHERITS middleware from parent: /product
 * 
 * Middleware chain:
 *  1. Parent middleware from /product (timing, etc)
 *  2. This route's middleware (validation)
 *  3. Method-specific middleware (authorization)
 */
export const middleware = [
  (app: Elysia) => {
    app.derive(({ params }) => {
      // Validate ID format
      if (!params.id || isNaN(Number(params.id))) {
        throw new Error('Invalid product ID');
      }
      return { productId: Number(params.id) };
    });
  },
];

// GET /api/product/:id - get a product by id
export const GET = ({ params }: any) => {
  return getProduct(params);
};

// PATCH /api/product/:id - update a product (requires ownership)
export const PATCH = ({ params, body }: any) => {
  return updateProduct(params, body);
};

// DELETE /api/product/:id - delete a product (requires admin)
export const DELETE = ({ params }: any) => {
  return deleteProduct(params);
};
