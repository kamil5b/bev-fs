import type { ProductAPI } from '../shared/api';

// Shared in-memory store
export const store = {
  products: [
    { id: 1, name: 'Product 1', price: 9.99 },
    { id: 2, name: 'Product 2', price: 19.99 }
  ] as ProductAPI.GetListResponse['products']
};
