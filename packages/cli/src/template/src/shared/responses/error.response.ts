/**
 * Error Response Type
 * Used for API error responses with discriminated union pattern
 */

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
}
