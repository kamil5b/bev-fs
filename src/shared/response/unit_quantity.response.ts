export interface UnitQuantityResponse {
  id: string;
  name: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy?: string;
}
