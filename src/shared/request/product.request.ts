import { PaginationRequest } from './common.request';
import { ProductType } from '../entities/product.entity';

export interface CreateProductRequest {
  name: string;
  description: string;
  type: ProductType;
  remark?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  type?: ProductType;
  remark?: string;
}

export interface GetProductsRequest extends PaginationRequest {
  search?: string;
}
