import type { ProductAPI } from '../../shared/api';
import { store } from '../store';

// GET /api/product/:id - get a product by id
export const GET = ({ params }: any): ProductAPI.GetByIdResponse => {
  const id = parseInt(params.id);
  const product = store.products.find(p => p.id === id);
  return { product: product || { id, name: `Product ${id}`, price: 0 } };
};

// PATCH /api/product/:id - update a product
export const PATCH = ({ params, body }: any): ProductAPI.UpdateResponse => {
  const id = parseInt(params.id);
  const req = body as ProductAPI.UpdateRequest;
  const product = store.products.find(p => p.id === id);
  if (product) {
    if (req.name !== undefined) product.name = req.name;
    if (req.price !== undefined) product.price = req.price;
  }
  return { updated: product || { id, name: `Product ${id}`, price: 0 } };
};

// DELETE /api/product/:id - delete a product
export const DELETE = ({ params }: any): ProductAPI.DeleteResponse => {
  const id = parseInt(params.id);
  const index = store.products.findIndex(p => p.id === id);
  if (index !== -1) {
    store.products.splice(index, 1);
  }
  return { deleted: id };
};
