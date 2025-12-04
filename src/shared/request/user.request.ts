import { UserRole } from '../enums/user.enum';
import { PaginationRequest } from './common.request';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  remark?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  remark?: string;
}

export interface GetUsersRequest extends PaginationRequest {
  search?: string;
}
