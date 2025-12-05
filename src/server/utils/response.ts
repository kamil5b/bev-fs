import type { BaseResponse } from "@shared/response-envelope";

export function ok<TData, TReq>(data: TData, request: TReq): BaseResponse<TData, TReq> {
  return {
    requestId: crypto.randomUUID(),
    success: true,
    timestamp: Date.now(),
    request,
    data
  };
}

export function fail<TReq>(err: unknown, request: TReq): BaseResponse<null, TReq> {
  return {
    requestId: crypto.randomUUID(),
    success: false,
    timestamp: Date.now(),
    request,
    error: err instanceof Error ? err.message : String(err)
  };
}
