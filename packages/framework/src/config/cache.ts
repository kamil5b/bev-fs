/**
 * Route caching utility to avoid re-discovering routes on every request
 */

export interface CachedRoute {
  path: string;
  handlers: Record<string, Function>;
  middleware?: Function | Function[];
}

class RouteCache {
  private cache: Map<string, CachedRoute[]> = new Map();
  private initialized: Set<string> = new Set();

  /**
   * Check if routes for a directory have been cached
   */
  has(dir: string): boolean {
    return this.initialized.has(dir);
  }

  /**
   * Get cached routes for a directory
   */
  get(dir: string): CachedRoute[] | undefined {
    return this.cache.get(dir);
  }

  /**
   * Set cached routes for a directory
   */
  set(dir: string, routes: CachedRoute[]): void {
    this.cache.set(dir, routes);
    this.initialized.add(dir);
  }

  /**
   * Clear all cached routes
   */
  clear(): void {
    this.cache.clear();
    this.initialized.clear();
  }

  /**
   * Clear routes for a specific directory
   */
  clearDir(dir: string): void {
    this.cache.delete(dir);
    this.initialized.delete(dir);
  }
}

export const routeCache = new RouteCache();
