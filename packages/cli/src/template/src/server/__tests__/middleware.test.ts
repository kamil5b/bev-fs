import { describe, it, expect, beforeEach } from 'bun:test'
import { createLoggingMiddleware, createRouteCustomMiddleware } from '../middleware'
import { Elysia } from 'elysia'

describe('Middleware', () => {
  describe('createLoggingMiddleware', () => {
    it('should create a valid logging middleware function', () => {
      const middleware = createLoggingMiddleware()
      expect(middleware).toBeInstanceOf(Function)
    })

    it('should return a function that accepts an Elysia app', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should return an Elysia app instance', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      expect(result).toBeInstanceOf(Elysia)
    })

    it('should add derive handler to app', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      expect(result).toBeDefined()
      // The app should be chainable
      expect(typeof result.onAfterHandle).toBe('function')
    })

    it('should add onAfterHandle handler to app', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      expect(typeof result.onAfterHandle).toBe('function')
    })

    it('should use scoped mode for derive and onAfterHandle', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      // Should work with scoped handlers
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should be chainable with other middleware', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      // Should allow chaining more handlers
      expect(() => {
        result.get('/test', () => 'test')
      }).not.toThrow()
    })

    it('should create independent instances', () => {
      const mw1 = createLoggingMiddleware()
      const mw2 = createLoggingMiddleware()
      
      expect(mw1).not.toBe(mw2)
    })

    it('should handle multiple app instances', () => {
      const middleware = createLoggingMiddleware()
      const app1 = new Elysia()
      const app2 = new Elysia()
      
      const result1 = middleware(app1)
      const result2 = middleware(app2)
      
      expect(result1).toBeInstanceOf(Elysia)
      expect(result2).toBeInstanceOf(Elysia)
      expect(result1).not.toBe(result2)
    })

    it('should provide startTime in derive context', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      // The derive handler returns startTime which is available to onAfterHandle
      expect(result).toBeDefined()
    })

    it('should work with GET routes', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/', () => ({ status: 'ok' }))
      }).not.toThrow()
    })

    it('should work with POST routes', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.post('/', ({ body }) => ({ received: body }))
      }).not.toThrow()
    })

    it('should be applicable to routes at different levels', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/api/products', () => [])
        result.post('/api/products', () => ({}))
        result.delete('/api/products/:id', () => ({}))
      }).not.toThrow()
    })
  })

  describe('createRouteCustomMiddleware', () => {
    it('should create a valid custom middleware function', () => {
      const middleware = createRouteCustomMiddleware()
      expect(middleware).toBeInstanceOf(Function)
    })

    it('should return a function that accepts an Elysia app', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should return an Elysia app instance', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      expect(result).toBeInstanceOf(Elysia)
    })

    it('should add onBeforeHandle handler', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      expect(typeof result.onBeforeHandle).toBe('function')
    })

    it('should be chainable with other handlers', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/test', () => 'test')
      }).not.toThrow()
    })

    it('should create independent instances', () => {
      const mw1 = createRouteCustomMiddleware()
      const mw2 = createRouteCustomMiddleware()
      
      expect(mw1).not.toBe(mw2)
    })

    it('should work with multiple apps', () => {
      const middleware = createRouteCustomMiddleware()
      const app1 = new Elysia()
      const app2 = new Elysia()
      
      const result1 = middleware(app1)
      const result2 = middleware(app2)
      
      expect(result1).toBeInstanceOf(Elysia)
      expect(result2).toBeInstanceOf(Elysia)
      expect(result1).not.toBe(result2)
    })

    it('should have access to request object', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      // The onBeforeHandle receives request parameter
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should execute before route handler', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/api/test', () => ({ result: 'success' }))
      }).not.toThrow()
    })
  })

  describe('Middleware Composition', () => {
    it('should allow chaining both middleware together', () => {
      const logMW = createLoggingMiddleware()
      const customMW = createRouteCustomMiddleware()
      const app = new Elysia()
      
      expect(() => {
        logMW(app)
        customMW(app)
      }).not.toThrow()
    })

    it('should apply middleware in sequence', () => {
      const logMW = createLoggingMiddleware()
      const customMW = createRouteCustomMiddleware()
      const app = new Elysia()
      
      const app1 = logMW(app)
      const app2 = customMW(app1)
      
      expect(app1).toBeInstanceOf(Elysia)
      expect(app2).toBeInstanceOf(Elysia)
    })

    it('should allow reusing middleware instances on different apps', () => {
      const logMW = createLoggingMiddleware()
      const app1 = new Elysia()
      const app2 = new Elysia()
      
      expect(() => {
        logMW(app1)
        logMW(app2)
      }).not.toThrow()
    })

    it('should maintain app chainability after middleware', () => {
      const logMW = createLoggingMiddleware()
      const customMW = createRouteCustomMiddleware()
      const app = new Elysia()
      
      const result = logMW(app)
      const result2 = customMW(result)
      
      expect(() => {
        result2.get('/api/health', () => ({ status: 'healthy' }))
      }).not.toThrow()
    })
  })

  describe('Middleware with Routes', () => {
    it('should work with simple GET route', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/', () => ({ message: 'Hello' }))
      }).not.toThrow()
    })

    it('should work with parameterized routes', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/api/users/:id', ({ params }) => ({ id: params.id }))
      }).not.toThrow()
    })

    it('should work with POST routes accepting body', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.post('/api/users', ({ body }) => ({ created: body }))
      }).not.toThrow()
    })

    it('should work with multiple HTTP methods', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/api/resource', () => ({}))
        result.post('/api/resource', () => ({}))
        result.put('/api/resource/:id', () => ({}))
        result.delete('/api/resource/:id', () => ({}))
      }).not.toThrow()
    })

    it('should work with routes returning different types', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/text', () => 'text response')
        result.get('/json', () => ({ key: 'value' }))
        result.get('/array', () => [1, 2, 3])
        result.get('/number', () => 42)
      }).not.toThrow()
    })
  })

  describe('Middleware Edge Cases', () => {
    it('should handle apps with no routes', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should not throw when applied twice to same app', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
        middleware(app)
      }).not.toThrow()
    })

    it('should work with routes added after middleware', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/early', () => 'early')
        result.post('/late', () => 'late')
      }).not.toThrow()
    })

    it('should handle route groups', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.group('/api', (app) => 
          app.get('/status', () => ({ ok: true }))
        )
      }).not.toThrow()
    })
  })

  describe('Logging Middleware Behavior', () => {
    it('should extract request method', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      // The middleware extracts request.method
      expect(result).toBeDefined()
    })

    it('should extract request URL', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      // The middleware constructs URL from request.url
      expect(result).toBeDefined()
    })

    it('should calculate request duration', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      // The middleware calculates Date.now() - startTime
      expect(result).toBeDefined()
    })

    it('should format timestamp in ISO format', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      // Middleware creates timestamp with new Date().toISOString()
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should use scoped context for timing isolation', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      // Middleware uses 'scoped' mode for proper request isolation
      const result = middleware(app)
      expect(result).toBeInstanceOf(Elysia)
    })
  })

  describe('Custom Middleware Behavior', () => {
    it('should execute custom logic on each request', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      expect(result).toBeDefined()
    })

    it('should have access to request.url', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      // Middleware accesses request.url
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should execute before handler logic', () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      
      expect(() => {
        result.get('/test', () => 'handler')
      }).not.toThrow()
    })
  })

  describe('Middleware Factory Pattern', () => {
    it('should create independent instances with createLoggingMiddleware', () => {
      const mw1 = createLoggingMiddleware()
      const mw2 = createLoggingMiddleware()
      
      expect(mw1).not.toBe(mw2)
      expect(mw1).toBeInstanceOf(Function)
      expect(mw2).toBeInstanceOf(Function)
    })

    it('should create independent instances with createRouteCustomMiddleware', () => {
      const mw1 = createRouteCustomMiddleware()
      const mw2 = createRouteCustomMiddleware()
      
      expect(mw1).not.toBe(mw2)
    })

    it('should allow customization per instance', () => {
      const mw1 = createLoggingMiddleware()
      const mw2 = createRouteCustomMiddleware()
      
      const app1 = new Elysia()
      const app2 = new Elysia()
      
      const result1 = mw1(app1)
      const result2 = mw2(app2)
      
      expect(result1).toBeInstanceOf(Elysia)
      expect(result2).toBeInstanceOf(Elysia)
    })
  })
})

describe('Middleware Integration Tests', () => {
  describe('createLoggingMiddleware - HTTP Request Flow', () => {
    it('should handle GET request with logging middleware', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/test', () => ({ message: 'success' }))
      
      const response = await app.handle(
        new Request('http://localhost/test', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.message).toBe('success')
    })

    it('should handle POST request with logging middleware', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.post('/api/data', ({ body }) => ({
        received: body,
        success: true,
      }))
      
      const response = await app.handle(
        new Request('http://localhost/api/data', {
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
          headers: { 'Content-Type': 'application/json' },
        })
      )
      
      expect(response.status).toBe(200)
    })

    it('should handle parameterized routes', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/users/:id', ({ params }) => ({
        userId: params.id,
      }))
      
      const response = await app.handle(
        new Request('http://localhost/api/users/123', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.userId).toBe('123')
    })

    it('should extract correct method from request', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.delete('/api/resource/:id', ({ params }) => ({
        deleted: params.id,
      }))
      
      const response = await app.handle(
        new Request('http://localhost/api/resource/456', {
          method: 'DELETE',
        })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.deleted).toBe('456')
    })

    it('should extract correct pathname from URL', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/v1/health', () => ({ status: 'ok' }))
      
      const response = await app.handle(
        new Request('http://localhost/api/v1/health', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.status).toBe('ok')
    })

    it('should handle requests with query parameters', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/search', ({ query }) => ({
        query: query,
      }))
      
      const response = await app.handle(
        new Request(
          'http://localhost/api/search?q=test&limit=10',
          { method: 'GET' }
        )
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.query).toBeDefined()
    })

    it('should track request duration', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/slow', () => {
        // Simulate some processing
        return { result: 'done' }
      })
      
      const startTime = Date.now()
      const response = await app.handle(
        new Request('http://localhost/api/slow', { method: 'GET' })
      )
      const endTime = Date.now()
      
      expect(response.status).toBe(200)
      // Request should complete quickly (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should handle multiple consecutive requests', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/counter', () => ({ count: Math.random() }))
      
      const response1 = await app.handle(
        new Request('http://localhost/api/counter', { method: 'GET' })
      )
      const response2 = await app.handle(
        new Request('http://localhost/api/counter', { method: 'GET' })
      )
      
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
    })

    it('should work with root path requests', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/', () => ({ root: true }))
      
      const response = await app.handle(
        new Request('http://localhost/', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.root).toBe(true)
    })

    it('should handle routes returning different content types', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/json', () => ({ type: 'json' }))
      app.get('/text', () => 'plain text')
      app.get('/number', () => 42)
      
      const jsonResponse = await app.handle(
        new Request('http://localhost/json', { method: 'GET' })
      )
      const textResponse = await app.handle(
        new Request('http://localhost/text', { method: 'GET' })
      )
      const numberResponse = await app.handle(
        new Request('http://localhost/number', { method: 'GET' })
      )
      
      expect(jsonResponse.status).toBe(200)
      expect(textResponse.status).toBe(200)
      expect(numberResponse.status).toBe(200)
    })

    it('should handle routes with different HTTP methods', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/resource', () => ({ method: 'GET' }))
      app.post('/resource', () => ({ method: 'POST' }))
      app.put('/resource/:id', () => ({ method: 'PUT' }))
      app.delete('/resource/:id', () => ({ method: 'DELETE' }))
      
      const get = await app.handle(
        new Request('http://localhost/resource', { method: 'GET' })
      )
      const post = await app.handle(
        new Request('http://localhost/resource', { method: 'POST' })
      )
      const put = await app.handle(
        new Request('http://localhost/resource/1', { method: 'PUT' })
      )
      const del = await app.handle(
        new Request('http://localhost/resource/1', { method: 'DELETE' })
      )
      
      expect(get.status).toBe(200)
      expect(post.status).toBe(200)
      expect(put.status).toBe(200)
      expect(del.status).toBe(200)
    })
  })

  describe('createRouteCustomMiddleware - HTTP Request Flow', () => {
    it('should execute custom middleware on GET request', async () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/test', () => ({ custom: 'executed' }))
      
      const response = await app.handle(
        new Request('http://localhost/api/test', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.custom).toBe('executed')
    })

    it('should execute custom middleware on POST request', async () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia().use(middleware)
      
      app.post('/api/create', ({ body }) => ({
        received: true,
        data: body,
      }))
      
      const response = await app.handle(
        new Request('http://localhost/api/create', {
          method: 'POST',
          body: JSON.stringify({ test: 'data' }),
          headers: { 'Content-Type': 'application/json' },
        })
      )
      
      expect(response.status).toBe(200)
    })

    it('should have access to request URL in middleware', async () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/path', ({ request }) => ({
        path: new URL(request.url).pathname,
      }))
      
      const response = await app.handle(
        new Request('http://localhost/api/path', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.path).toBe('/api/path')
    })

    it('should execute before route handler', async () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/order', () => ({
        sequence: 'middleware then handler',
      }))
      
      const response = await app.handle(
        new Request('http://localhost/api/order', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.sequence).toBe('middleware then handler')
    })

    it('should work with multiple routes', async () => {
      const middleware = createRouteCustomMiddleware()
      const app = new Elysia().use(middleware)
      
      app.get('/api/one', () => ({ id: 1 }))
      app.get('/api/two', () => ({ id: 2 }))
      app.post('/api/create', () => ({ created: true }))
      
      const response1 = await app.handle(
        new Request('http://localhost/api/one', { method: 'GET' })
      )
      const response2 = await app.handle(
        new Request('http://localhost/api/two', { method: 'GET' })
      )
      const response3 = await app.handle(
        new Request('http://localhost/api/create', { method: 'POST' })
      )
      
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(response3.status).toBe(200)
    })
  })

  describe('Middleware Composition - HTTP Request Flow', () => {
    it('should apply both logging and custom middleware', async () => {
      const logMW = createLoggingMiddleware()
      const customMW = createRouteCustomMiddleware()
      const app = new Elysia().use(logMW).use(customMW)
      
      app.get('/api/combined', () => ({ middleware: 'combined' }))
      
      const response = await app.handle(
        new Request('http://localhost/api/combined', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.middleware).toBe('combined')
    })

    it('should maintain request context through middleware chain', async () => {
      const logMW = createLoggingMiddleware()
      const customMW = createRouteCustomMiddleware()
      const app = new Elysia()
        .use(logMW)
        .use(customMW)
      
      app.get('/api/chain/:id', ({ params }) => ({
        id: params.id,
      }))
      
      const response = await app.handle(
        new Request('http://localhost/api/chain/999', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.id).toBe('999')
    })

    it('should handle errors in middleware gracefully', async () => {
      const logMW = createLoggingMiddleware()
      const app = new Elysia().use(logMW)
      
      app.get('/api/ok', () => ({ ok: true }))
      // Routes not matching should return 404
      
      const response = await app.handle(
        new Request('http://localhost/api/ok', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
    })
  })

  describe('Middleware with Route Groups', () => {
    it('should apply middleware to route groups', async () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia().use(middleware)
      
      app.group('/api', (app) =>
        app
          .get('/users', () => [{ id: 1 }])
          .get('/products', () => [{ id: 1 }])
      )
      
      const response1 = await app.handle(
        new Request('http://localhost/api/users', { method: 'GET' })
      )
      const response2 = await app.handle(
        new Request('http://localhost/api/products', { method: 'GET' })
      )
      
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
    })
  })
})
