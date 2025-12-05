import type { BaseResponse } from "../response-envelope";
import type { User } from "./model.users";
import type { UsersListRequest, UsersGetRequest, UsersCreateRequest } from "./request.users";

export interface ListMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export type UsersListResponse = BaseResponse<{ items: User[]; meta: ListMeta }, UsersListRequest>;

export type UsersGetResponse = BaseResponse<User, UsersGetRequest>;

export type UsersCreateResponse = BaseResponse<User, UsersCreateRequest>;
