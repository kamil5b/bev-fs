import { store } from '../db/store';
import { ProductRequest, ProductResponse, ProgressRequest, ProgressResponse } from '../../shared';

export const productRepository = {
  // Product operations
  getAllProducts(): ProductResponse.GetList['products'] {
    return store.products;
  },

  getProductById(id: number) {
    return store.products.find((p: any) => p.id === id);
  },

  createProduct(data: ProductRequest.Create) {
    const newProduct = {
      id: Math.max(...store.products.map(p => p.id), 0) + 1,
      name: data.name,
      price: data.price
    };
    store.products.push(newProduct);
    return newProduct;
  },

  updateProduct(id: number, data: ProductRequest.Update) {
    const product = this.getProductById(id);
    if (product) {
      if (data.name !== undefined) product.name = data.name;
      if (data.price !== undefined) product.price = data.price;
    }
    return product;
  },

  deleteProduct(id: number): boolean {
    const index = store.products.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      store.products.splice(index, 1);
      return true;
    }
    return false;
  },

  // Progress operations
  getProgressByProductId(productId: number) {
    return store.getProgressByProductId(productId);
  },

  getProgressById(productId: number, progressId: number) {
    return store.getProgressById(productId, progressId);
  },

  createProgress(productId: number, data: ProgressRequest.Create) {
    return store.createProgress(productId, data);
  },

  updateProgress(productId: number, progressId: number, data: ProgressRequest.Update) {
    return store.updateProgress(productId, progressId, data);
  },

  deleteProgress(productId: number, progressId: number): boolean {
    return store.deleteProgress(productId, progressId) === 1;
  }
};
