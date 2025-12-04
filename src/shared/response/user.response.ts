import { UserRole } from '../enums/user.enum';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy?: string;
}
