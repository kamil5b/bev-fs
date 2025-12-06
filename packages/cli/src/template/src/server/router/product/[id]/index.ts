import { getProduct, updateProduct, deleteProduct } from '../../../handler/product.handler';

// GET /api/product/:id - get a product by id
export const GET = ({ params }: any) => {
  return getProduct(params);
};

// PATCH /api/product/:id - update a product
export const PATCH = ({ params, body }: any) => {
  return updateProduct(params, body);
};

// DELETE /api/product/:id - delete a product
export const DELETE = ({ params }: any) => {
  return deleteProduct(params);
};
