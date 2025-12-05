import type { UserRole } from "./enum.users";

export interface UsersListRequest {
  page?: number;           // 1-based
  perPage?: number;
  sortBy?: string;         // allowed values validated server-side
  sortOrder?: "asc" | "desc";
  q?: string;              // search query against name
  role?: string;           // filter role
}

export interface UsersGetRequest {
  id: number;
}

export interface UsersCreateRequest {
  name: string;
  role: UserRole;
}
