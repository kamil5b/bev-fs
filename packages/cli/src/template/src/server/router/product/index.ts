import { getProducts, createProduct } from '../../handler/product.handler';

// GET /api/product - list all products
export const GET = () => {
  return getProducts();
};

// POST /api/product - create a product
export const POST = ({ body }: any) => {
  return createProduct(body);
};
