import type { ClientMiddleware } from '@bev-fs'

/**
 * Example custom middleware that logs a message
 */
export const loggingMiddleware: ClientMiddleware = async (ctx) => {
  console.log('this is custom middleware')
  await ctx.next()
}
