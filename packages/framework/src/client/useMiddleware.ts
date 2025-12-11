import { App, inject, provide } from 'vue'
import { useAppRouter } from './useAppRouter'
import type { ClientMiddleware, ClientMiddlewareContext } from '../shared/types'

/**
 * Middleware chain executor
 */
class MiddlewareChain {
  private middlewares: ClientMiddleware[] = []
  private index = 0

  constructor(middlewares: ClientMiddleware[]) {
    this.middlewares = middlewares
  }

  async execute(ctx: ClientMiddlewareContext): Promise<boolean> {
    return new Promise((resolve) => {
      const originalNext = ctx.next
      let aborted = false

      ctx.next = async () => {
        if (this.index < this.middlewares.length) {
          const middleware = this.middlewares[this.index++]
          await middleware(ctx)
        } else {
          await originalNext?.()
        }
      }

      ctx.abort = (reason?: string) => {
        aborted = true
        resolve(false)
      }

      this.index = 0
      const result = ctx.next()
      Promise.resolve(result).finally(() => {
        resolve(!aborted)
      })
    })
  }
}

const MIDDLEWARE_KEY = Symbol('client-middleware')

/**
 * Register client-side middleware with the Vue app
 */
export function registerMiddleware(
  app: App,
  middlewares: ClientMiddleware[],
): void {
  provide(MIDDLEWARE_KEY, middlewares)
  app.provide(MIDDLEWARE_KEY, middlewares)
}

/**
 * Get registered middlewares
 */
export function useMiddlewareChain(): ClientMiddleware[] {
  return inject<ClientMiddleware[]>(MIDDLEWARE_KEY, [])
}

/**
 * Execute middleware chain before navigation or on specific events
 */
export async function executeMiddleware(
  middlewares: ClientMiddleware[],
  options?: {
    router?: any
    route?: any
    meta?: Record<string, unknown>
  },
): Promise<boolean> {
  const router = options?.router
  const route = options?.route
  const meta = options?.meta

  const ctx: ClientMiddlewareContext = {
    router,
    route,
    next: () => {},
    abort: () => {},
    meta,
  }

  const chain = new MiddlewareChain(middlewares)
  return await chain.execute(ctx)
}

/**
 * Composable to use middleware in a component
 */
export function useClientMiddleware() {
  const router = useAppRouter()
  const middlewares = useMiddlewareChain()

  return {
    middlewares,
    execute: (options?: { meta?: Record<string, unknown> }) =>
      executeMiddleware(middlewares, {
        router,
        meta: options?.meta,
      }),
  }
}
