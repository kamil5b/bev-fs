/**
 * Product API Response Types
 */

import { Product } from '../entities/product.entity';

export namespace ProductResponse {
  export interface GetList {
    products: Product[];
  }

  export interface GetById {
    product: Product;
  }

  export interface Create {
    created: Product;
  }

  export interface Update {
    updated: Product;
  }

  export interface Delete {
    deleted: number;
  }
}