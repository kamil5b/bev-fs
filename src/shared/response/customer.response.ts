export interface CustomerResponse {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  description?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy?: string;
}
