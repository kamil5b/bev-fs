export interface UnitQuantityEntity {
  id: string;
  name: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
  deletedBy?: string;
}
