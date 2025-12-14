import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import type { HealthCheckResponse } from '../shared/types'

describe('Framework Types', () => {
  describe('HealthCheckResponse', () => {
    it('should have correct structure', () => {
      const response: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 123.45,
        version: '1.0.0',
      }

      expect(response.status).toBe('ok')
      expect(response.timestamp).toBeDefined()
      expect(response.uptime).toBe(123.45)
      expect(response.version).toBe('1.0.0')
    })

    it('should accept degraded status', () => {
      const response: HealthCheckResponse = {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: 0,
      }

      expect(response.status).toBe('degraded')
    })

    it('should accept error status', () => {
      const response: HealthCheckResponse = {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: 0,
      }

      expect(response.status).toBe('error')
    })

    it('should support optional version', () => {
      const response1: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 0,
      }

      const response2: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 0,
        version: '1.0.0',
      }

      expect(response1.version).toBeUndefined()
      expect(response2.version).toBe('1.0.0')
    })

    it('should have valid ISO timestamp', () => {
      const timestamp = new Date().toISOString()
      const response: HealthCheckResponse = {
        status: 'ok',
        timestamp,
        uptime: 0,
      }

      expect(response.timestamp).toBe(timestamp)
      expect(() => new Date(response.timestamp)).not.toThrow()
    })

    it('should support numeric uptime', () => {
      const response: HealthCheckResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 3600.5,
      }

      expect(response.uptime).toBe(3600.5)
    })
  })

  describe('Json type', () => {
    it('should be flexible Record type', () => {
      const data: Record<string, unknown> = {
        name: 'test',
        count: 42,
        active: true,
        nested: { key: 'value' },
      }

      expect(data.name).toBe('test')
      expect(data.count).toBe(42)
      expect(data.active).toBe(true)
    })
  })

  describe('Context interface', () => {
    it('should have params property', () => {
      const context = {
        params: { id: '123' },
        headers: {},
      }

      expect(context.params).toBeDefined()
      expect(context.params.id).toBe('123')
    })

    it('should support optional body', () => {
      type TestContext = {
        params: Record<string, any>
        headers: Record<string, any>
        body?: any
      }

      const context1: TestContext = {
        params: {},
        body: { data: 'test' },
        headers: {},
      }

      const context2: TestContext = {
        params: {},
        headers: {},
      }

      expect(context1.body).toBeDefined()
      expect(context2.body).toBeUndefined()
    })

    it('should support optional query', () => {
      const context = {
        params: {},
        query: { search: 'test' },
        headers: {},
      }

      expect(context.query).toBeDefined()
      expect(context.query?.search).toBe('test')
    })

    it('should support request property', () => {
      const mockRequest = new Request('http://example.com')
      const context = {
        params: {},
        headers: {},
        request: mockRequest,
      }

      expect(context.request).toBe(mockRequest)
    })

    it('should support set property with headers', () => {
      const context = {
        params: {},
        headers: {},
        set: {
          headers: { 'X-Custom': 'value' },
        },
      }

      expect(context.set?.headers).toBeDefined()
      expect(context.set?.headers['X-Custom']).toBe('value')
    })

    it('should support set property with status', () => {
      const context = {
        params: {},
        headers: {},
        set: {
          headers: {},
          status: 200,
        },
      }

      expect(context.set?.status).toBe(200)
    })
  })

  describe('RouteModule interface', () => {
    it('should support GET handler', () => {
      const module = {
        GET: async (ctx: any) => ({ data: 'test' }),
      }

      expect(module.GET).toBeDefined()
      expect(typeof module.GET).toBe('function')
    })

    it('should support POST handler', () => {
      const module = {
        POST: async (ctx: any) => ({ success: true }),
      }

      expect(module.POST).toBeDefined()
      expect(typeof module.POST).toBe('function')
    })

    it('should support multiple HTTP methods', () => {
      const module = {
        GET: async (ctx: any) => ({}),
        POST: async (ctx: any) => ({}),
        PUT: async (ctx: any) => ({}),
        DELETE: async (ctx: any) => ({}),
      }

      expect(module.GET).toBeDefined()
      expect(module.POST).toBeDefined()
      expect(module.PUT).toBeDefined()
      expect(module.DELETE).toBeDefined()
    })

    it('should support default handler', () => {
      const module = {
        default: async (ctx: any) => ({ data: 'default' }),
      }

      expect(module.default).toBeDefined()
    })

    it('should support middleware property', () => {
      const module = {
        middleware: (app: Elysia) => app,
        GET: async (ctx: any) => ({}),
      }

      expect(module.middleware).toBeDefined()
      expect(typeof module.middleware).toBe('function')
    })
  })

  describe('ClientMiddlewareContext interface', () => {
    it('should have required properties', () => {
      const ctx = {
        next: () => {},
        abort: () => {},
      }

      expect(ctx.next).toBeDefined()
      expect(ctx.abort).toBeDefined()
    })

    it('should support optional router property', () => {
      const ctx = {
        router: { push: () => {} },
        next: () => {},
        abort: () => {},
      }

      expect(ctx.router).toBeDefined()
    })

    it('should support optional route property', () => {
      const ctx = {
        route: { path: '/test' },
        next: () => {},
        abort: () => {},
      }

      expect(ctx.route).toBeDefined()
    })

    it('should support optional meta property', () => {
      const ctx = {
        meta: { auth: true },
        next: () => {},
        abort: () => {},
      }

      expect(ctx.meta).toBeDefined()
      expect((ctx.meta as any).auth).toBe(true)
    })

    it('should allow abort with reason', () => {
      const ctx = {
        next: () => {},
        abort: (reason?: string) => console.log(reason),
      }

      expect(() => ctx.abort('Unauthorized')).not.toThrow()
    })

    it('should support async next', async () => {
      const ctx = {
        next: async () => {
          await Promise.resolve()
        },
        abort: () => {},
      }

      expect(() => ctx.next()).not.toThrow()
    })
  })
})
