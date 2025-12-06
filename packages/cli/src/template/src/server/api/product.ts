import type { ProductAPI } from '../../shared/api';
import { store } from '../store';

// GET /api/product - list all products
export const GET = (): ProductAPI.GetListResponse => {
  return { products: store.products };
};

// POST /api/product - create a product
export const POST = ({ body }: any): ProductAPI.CreateResponse => {
  const req = body as ProductAPI.CreateRequest;
  const newProduct = {
    id: Math.max(...store.products.map(p => p.id), 0) + 1,
    ...req
  };
  store.products.push(newProduct);
  return { created: newProduct };
};

