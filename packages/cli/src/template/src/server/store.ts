import type { ProductAPI, ProgressAPI } from '../shared/api';

// Shared in-memory store
export const store = {
  products: [
    { id: 1, name: 'Product 1', price: 9.99 },
    { id: 2, name: 'Product 2', price: 19.99 }
  ] as ProductAPI.GetListResponse['products'],

  // Product-scoped progress data
  productProgress: {
    1: [
      { 
        id: 1, 
        productId: 1, 
        percentage: 50, 
        status: 'in-progress' as const,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString()
      }
    ],
    2: [
      { 
        id: 2, 
        productId: 2, 
        percentage: 100, 
        status: 'completed' as const,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-03').toISOString()
      }
    ]
  } as Record<number, ProgressAPI.GetListResponse['progress']>,

  // Product-scoped Progress CRUD operations
  getProgressByProductId(productId: number) {
    return this.productProgress[productId] || [];
  },

  getProgressById(productId: number, id: number) {
    return this.getProgressByProductId(productId).find(p => p.id === id);
  },

  createProgress(productId: number, data: ProgressAPI.CreateRequest) {
    if (!this.productProgress[productId]) {
      this.productProgress[productId] = [];
    }
    const newProgress = {
      id: Math.max(...this.getProgressByProductId(productId).map(p => p.id), 0) + 1,
      percentage: data.percentage,
      productId: data.productId,
      status: data.status || 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.productProgress[productId].push(newProgress);
    return newProgress;
  },

  updateProgress(productId: number, id: number, data: ProgressAPI.UpdateRequest) {
    const progress = this.getProgressById(productId, id);
    if (!progress) return null;
    
    if (data.percentage !== undefined) progress.percentage = data.percentage;
    if (data.status !== undefined) progress.status = data.status;
    progress.updatedAt = new Date().toISOString();
    
    return progress;
  },

  deleteProgress(productId: number, id: number) {
    const list = this.productProgress[productId];
    if (!list) return 0;
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return 0;
    list.splice(index, 1);
    return 1;
  }
};
