export interface BaseResponse {
  status: number;
  message: string;
  requestedAt: string;
  requestId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends BaseResponse {
  data: T[];
  meta: PaginationMeta;
}
