export interface BaseResponse<TData, TRequest = any> {
  requestId: string;       // uuid for correlation
  success: boolean;
  timestamp: number;       // Date.now()
  request: TRequest;       // echo of the request
  data?: TData;            // present on success
  error?: string;          // present when success === false
}
