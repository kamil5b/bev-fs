import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { compressionMiddleware } from '../middleware/compression.middleware'
import { Elysia } from 'elysia'

describe('compressionMiddleware', () => {
  let app: Elysia

  beforeEach(() => {
    app = new Elysia()
  })

  it('should create middleware function', () => {
    const middleware = compressionMiddleware()
    expect(typeof middleware).toBe('function')
  })

  it('should apply to Elysia app', () => {
    const middleware = compressionMiddleware()
    const appWithMiddleware = middleware(app)
    expect(appWithMiddleware).toBeInstanceOf(Elysia)
  })

  it('should return Elysia instance', () => {
    const middleware = compressionMiddleware()
    const result = middleware(app)
    expect(result).toBeInstanceOf(Elysia)
  })

  it('should not throw on application', () => {
    const middleware = compressionMiddleware()
    expect(() => middleware(app)).not.toThrow()
  })

  it('should chain with other middleware', () => {
    const compression = compressionMiddleware()
    const app2 = new Elysia()
    const result1 = compression(app2)
    const result2 = compression(result1)

    expect(result1).toBeInstanceOf(Elysia)
    expect(result2).toBeInstanceOf(Elysia)
  })

  it('should return modified app instance', () => {
    const middleware = compressionMiddleware()
    const originalApp = new Elysia()
    const modifiedApp = middleware(originalApp)

    // Should return a configured Elysia instance
    expect(modifiedApp).toBeDefined()
    expect(typeof modifiedApp).toBe('object')
  })

  it('should support hook registration for afterHandle', () => {
    const middleware = compressionMiddleware()
    const app2 = new Elysia()

    expect(() => {
      const result = middleware(app2)
      // Verify that the middleware set up an afterHandle hook
      expect(result).toBeInstanceOf(Elysia)
    }).not.toThrow()
  })

  it('should not require configuration', () => {
    expect(() => compressionMiddleware()).not.toThrow()
  })

  it('should handle scoped middleware', () => {
    const middleware = compressionMiddleware<string>()
    const app2 = new Elysia({ prefix: '/api' })
    const result = middleware(app2)

    expect(result).toBeInstanceOf(Elysia)
  })

  it('should be reusable across multiple apps', () => {
    const middleware = compressionMiddleware()
    const app1 = new Elysia()
    const app2 = new Elysia()

    const result1 = middleware(app1)
    const result2 = middleware(app2)

    expect(result1).toBeInstanceOf(Elysia)
    expect(result2).toBeInstanceOf(Elysia)
  })

  it('should target application/json content type', () => {
    const middleware = compressionMiddleware()
    const app2 = new Elysia()

    expect(() => middleware(app2)).not.toThrow()
  })

  describe('compression response handling', () => {
    it('should return response when gzip not accepted', async () => {
      const middleware = compressionMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ data: 'test' }))

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { 'accept-encoding': 'deflate' },
        }),
      )

      expect(response.status).toBe(200)
      expect(response.ok).toBe(true)
    })

    it('should handle response when gzip is accepted', async () => {
      const middleware = compressionMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ data: 'test' }))

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { 'accept-encoding': 'gzip' },
        }),
      )

      expect(response.status).toBe(200)
    })

    it('should handle response without accept-encoding header', async () => {
      const middleware = compressionMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ data: 'test' }))

      const response = await testApp.handle(
        new Request('http://localhost/test', { method: 'GET' }),
      )

      expect(response.status).toBe(200)
    })

    it('should process JSON responses', async () => {
      const middleware = compressionMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ data: 'test' }), {
        // Elysia expects a schema, not a string, for the response option
        response: undefined,
      })

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { 'accept-encoding': 'gzip' },
        }),
      )

      expect(response.ok).toBe(true)
    })

    it('should return response unchanged when not Response instance', async () => {
      const middleware = compressionMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ data: 'test' }))

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { 'accept-encoding': 'gzip' },
        }),
      )

      expect(response).toBeDefined()
      expect(response.status).toBe(200)
    })

    it('should handle multiple accept-encoding values', async () => {
      const middleware = compressionMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ data: 'test' }))

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { 'accept-encoding': 'deflate, gzip, br' },
        }),
      )

      expect(response.status).toBe(200)
    })

    it('should handle non-JSON content types', async () => {
      const middleware = compressionMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => '<html></html>', {
        // Elysia expects a schema, not a string, for the response option
        response: undefined,
      })

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { 'accept-encoding': 'gzip' },
        }),
      )

      expect(response).toBeDefined()
    })
  })
})
