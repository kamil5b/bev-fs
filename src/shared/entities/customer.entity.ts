export interface CustomerEntity {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  description?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
  deletedBy?: string;
}
