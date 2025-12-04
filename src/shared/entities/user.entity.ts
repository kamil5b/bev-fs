export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
  deletedBy?: string;
}
