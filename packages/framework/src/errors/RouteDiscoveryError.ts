/**
 * Error thrown when route discovery fails
 */
export class RouteDiscoveryError extends Error {
  constructor(
    public readonly routerDir: string,
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message)
    this.name = 'RouteDiscoveryError'
  }
}
