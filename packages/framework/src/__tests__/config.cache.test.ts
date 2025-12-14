import { describe, it, expect, beforeEach } from 'bun:test'
import { routeCache } from '../config/cache'

describe('routeCache', () => {
  beforeEach(() => {
    routeCache.clear()
  })

  it('should initialize with empty cache', () => {
    expect(routeCache.has('src/router')).toBe(false)
    expect(routeCache.get('src/router')).toBeUndefined()
  })

  it('should store routes in cache', () => {
    const routes = [
      { path: '/users', handlers: { GET: () => {}, POST: () => {} } },
      { path: '/posts', handlers: { GET: () => {}, POST: () => {} } },
    ]
    routeCache.set('src/router', routes)

    expect(routeCache.has('src/router')).toBe(true)
    expect(routeCache.get('src/router')).toEqual(routes)
  })

  it('should return undefined for non-existent cache entry', () => {
    expect(routeCache.get('non/existent')).toBeUndefined()
  })

  it('should track initialized directories', () => {
    routeCache.set('src/router', [])
    expect(routeCache.has('src/router')).toBe(true)
  })

  it('should clear all cache entries', () => {
    routeCache.set('src/router', [])
    routeCache.set('src/api', [])

    expect(routeCache.has('src/router')).toBe(true)
    expect(routeCache.has('src/api')).toBe(true)

    routeCache.clear()

    expect(routeCache.has('src/router')).toBe(false)
    expect(routeCache.has('src/api')).toBe(false)
  })

  it('should clear specific directory from cache', () => {
    routeCache.set('src/router', [])
    routeCache.set('src/api', [])

    routeCache.clearDir('src/router')

    expect(routeCache.has('src/router')).toBe(false)
    expect(routeCache.has('src/api')).toBe(true)
  })

  it('should handle clearing non-existent directory gracefully', () => {
    routeCache.set('src/router', [])
    expect(() => routeCache.clearDir('non/existent')).not.toThrow()
    expect(routeCache.has('src/router')).toBe(true)
  })

  it('should store and retrieve multiple cached route sets', () => {
    const routes1 = [{ path: '/users', handlers: { GET: () => {} } }]
    const routes2 = [{ path: '/posts', handlers: { POST: () => {} } }]

    routeCache.set('src/router', routes1)
    routeCache.set('src/api', routes2)

    expect(routeCache.get('src/router')).toEqual(routes1)
    expect(routeCache.get('src/api')).toEqual(routes2)
  })

  it('should handle cache entries with middleware', () => {
    const routes = [
      {
        path: '/protected',
        handlers: { GET: () => {} },
        middleware: () => {},
      },
    ]
    routeCache.set('src/router', routes)

    expect(routeCache.get('src/router')).toEqual(routes)
  })

  it('should overwrite existing cache entry', () => {
    const oldRoutes = [{ path: '/old', handlers: { GET: () => {} } }]
    const newRoutes = [{ path: '/new', handlers: { GET: () => {} } }]

    routeCache.set('src/router', oldRoutes)
    expect(routeCache.get('src/router')).toEqual(oldRoutes)

    routeCache.set('src/router', newRoutes)
    expect(routeCache.get('src/router')).toEqual(newRoutes)
  })

  it('should maintain separate cache entries for different directories', () => {
    const routes1 = [{ path: '/api', handlers: { GET: () => {} } }]
    const routes2 = [{ path: '/web', handlers: { GET: () => {} } }]

    routeCache.set('src/api', routes1)
    routeCache.set('src/web', routes2)

    expect(routeCache.get('src/api')).toEqual(routes1)
    expect(routeCache.get('src/web')).toEqual(routes2)
    expect(routeCache.has('src/api')).toBe(true)
    expect(routeCache.has('src/web')).toBe(true)
  })
})
