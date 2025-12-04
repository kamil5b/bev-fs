import { ProductType } from '../entities/product.entity';

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy?: string;
}
