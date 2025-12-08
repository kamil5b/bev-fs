import { Product } from '../../shared/entities/product.entity';
import { Progress } from '../../shared/entities/progress.entity';

// Shared in-memory store (data only)
export const store = {
  products: [
    { id: 1, name: 'Product 1', price: 9.99 },
    { id: 2, name: 'Product 2', price: 19.99 }
  ] as Product[],

  // Product-scoped progress data
  productProgress: 
    [
      {
        id: 1,
        productId: 1,
        percentage: 50,
        status: 'in-progress',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString()
      },
      {
        id: 2,
        productId: 2,
        percentage: 100,
        status: 'completed',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-03').toISOString()
      }
    ] as Progress[]
};
