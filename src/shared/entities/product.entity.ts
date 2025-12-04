export enum ProductType {
  SELLABLE = 'sellable',
  ASSET = 'asset',
  UTILITY = 'utility',
  PLACEHOLDER = 'placeholder',
}

export interface ProductEntity {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
  deletedBy?: string;
}
