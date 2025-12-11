import { Elysia } from 'elysia'

export type Json = Record<string, unknown>

/**
 * Context object passed to route handlers
 */
export interface Context {
  params: Record<string, string>
  body?: unknown
  query?: Record<string, string>
  headers: Record<string, string>
  request?: Request
  set?: {
    headers: Record<string, string>
    status?: number
  }
}

/**
 * Route handler function type
 */
export type RouteHandler = (ctx: Context) => unknown | Promise<unknown>

/**
 * Server-side middleware function type
 */
export type Middleware = (app: Elysia) => Elysia | Promise<Elysia>

/**
 * Route handler definition with optional middleware
 */
export interface RouteModule {
  GET?: RouteHandler
  POST?: RouteHandler
  PUT?: RouteHandler
  PATCH?: RouteHandler
  DELETE?: RouteHandler
  default?: RouteHandler
  middleware?: Middleware | Record<string, Middleware>
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  uptime: number
  version?: string
}

/**
 * Context object for client-side middleware
 */
export interface ClientMiddlewareContext {
  router?: any
  route?: any
  next: () => void | Promise<void>
  abort: (reason?: string) => void
  meta?: Record<string, unknown>
}

/**
 * Client-side middleware function type
 */
export type ClientMiddleware = (
  ctx: ClientMiddlewareContext,
) => void | Promise<void>


