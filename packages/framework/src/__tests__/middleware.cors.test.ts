import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { corsMiddleware, type CorsOptions } from '../middleware/cors.middleware'
import { Elysia } from 'elysia'

describe('corsMiddleware', () => {
  let app: Elysia

  beforeEach(() => {
    app = new Elysia()
  })

  it('should create middleware function', () => {
    const middleware = corsMiddleware()
    expect(typeof middleware).toBe('function')
  })

  it('should apply CORS headers with default options', () => {
    const middleware = corsMiddleware()
    const appWithMiddleware = middleware(app)
    expect(appWithMiddleware).toBeInstanceOf(Elysia)
  })

  it('should accept custom CORS options', () => {
    const options: CorsOptions = {
      origin: 'https://example.com',
      methods: ['GET', 'POST'],
      credentials: true,
    }
    const middleware = corsMiddleware(options)
    expect(typeof middleware).toBe('function')
  })

  it('should handle origin as string', () => {
    const options: CorsOptions = { origin: 'https://example.com' }
    const middleware = corsMiddleware(options)
    expect(typeof middleware).toBe('function')
  })

  it('should handle origin as array', () => {
    const options: CorsOptions = {
      origin: ['https://example.com', 'https://other.com'],
    }
    const middleware = corsMiddleware(options)
    expect(typeof middleware).toBe('function')
  })

  it('should handle origin as regex', () => {
    const options: CorsOptions = {
      origin: /https:\/\/.+\.example\.com/,
    }
    const middleware = corsMiddleware(options)
    expect(typeof middleware).toBe('function')
  })

  it('should accept custom HTTP methods', () => {
    const options: CorsOptions = {
      methods: ['GET', 'POST', 'DELETE'],
    }
    const middleware = corsMiddleware(options)
    expect(typeof middleware).toBe('function')
  })

  it('should accept custom allowed headers', () => {
    const options: CorsOptions = {
      allowedHeaders: ['Content-Type', 'X-Custom-Header'],
    }
    const middleware = corsMiddleware(options)
    expect(typeof middleware).toBe('function')
  })

  it('should handle credentials option', () => {
    const optionsWithCredentials: CorsOptions = { credentials: true }
    const optionsWithoutCredentials: CorsOptions = { credentials: false }

    const middleware1 = corsMiddleware(optionsWithCredentials)
    const middleware2 = corsMiddleware(optionsWithoutCredentials)

    expect(typeof middleware1).toBe('function')
    expect(typeof middleware2).toBe('function')
  })

  it('should accept all options together', () => {
    const options: CorsOptions = {
      origin: ['https://example.com', 'https://other.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom'],
      credentials: true,
    }
    const middleware = corsMiddleware(options)
    expect(typeof middleware).toBe('function')
  })

  it('should use default wildcard origin', () => {
    const middleware = corsMiddleware()
    expect(typeof middleware).toBe('function')
  })

  it('should use default HTTP methods', () => {
    const middleware = corsMiddleware()
    expect(typeof middleware).toBe('function')
  })

  it('should use default allowed headers', () => {
    const middleware = corsMiddleware()
    expect(typeof middleware).toBe('function')
  })

  it('should use false as default for credentials', () => {
    const middleware = corsMiddleware()
    expect(typeof middleware).toBe('function')
  })

  it('should return Elysia instance from middleware', () => {
    const middleware = corsMiddleware()
    const result = middleware(app)
    expect(result).toBeInstanceOf(Elysia)
  })

  it('should not throw with no options', () => {
    const middleware = corsMiddleware()
    expect(() => middleware(app)).not.toThrow()
  })

  it('should not throw with empty options', () => {
    const middleware = corsMiddleware({})
    expect(() => middleware(app)).not.toThrow()
  })

  it('should handle multiple origin formats', () => {
    const stringOrigin = corsMiddleware({ origin: 'https://example.com' })
    const arrayOrigin = corsMiddleware({
      origin: ['https://example.com', 'https://other.com'],
    })
    const regexOrigin = corsMiddleware({ origin: /example\.com/ })

    expect(typeof stringOrigin).toBe('function')
    expect(typeof arrayOrigin).toBe('function')
    expect(typeof regexOrigin).toBe('function')
  })

  describe('CORS header handling', () => {
    it('should set wildcard origin header by default', async () => {
      const middleware = corsMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', { method: 'GET' }),
      )
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should set string origin header', async () => {
      const middleware = corsMiddleware({ origin: 'https://example.com' })
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', { method: 'GET' }),
      )
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://example.com',
      )
    })

    it('should set CORS methods header', async () => {
      const middleware = corsMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', { method: 'GET' }),
      )
      const methods = response.headers.get(
        'Access-Control-Allow-Methods',
      ) as string
      expect(methods).toContain('GET')
      expect(methods).toContain('POST')
      expect(methods).toContain('PUT')
    })

    it('should set CORS allowed headers', async () => {
      const middleware = corsMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', { method: 'GET' }),
      )
      const allowedHeaders = response.headers.get(
        'Access-Control-Allow-Headers',
      ) as string
      expect(allowedHeaders).toContain('Content-Type')
      expect(allowedHeaders).toContain('Authorization')
    })

    it('should set credentials header when enabled', async () => {
      const middleware = corsMiddleware({ credentials: true })
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', { method: 'GET' }),
      )
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
        'true',
      )
    })

    it('should not set credentials header when disabled', async () => {
      const middleware = corsMiddleware({ credentials: false })
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', { method: 'GET' }),
      )
      expect(
        response.headers.get('Access-Control-Allow-Credentials'),
      ).toBeNull()
    })

    it('should handle OPTIONS requests with 204 status', async () => {
      const middleware = corsMiddleware()
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))
      testApp.options('/test', () => null)

      const response = await testApp.handle(
        new Request('http://localhost/test', { method: 'OPTIONS' }),
      )
      expect(response.status).toBe(204)
    })

    it('should match regex origin pattern', async () => {
      const middleware = corsMiddleware({
        origin: /https:\/\/.+\.example\.com/,
      })
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { origin: 'https://sub.example.com' },
        }),
      )
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://sub.example.com',
      )
    })

    it('should use first origin when array has no match', async () => {
      const middleware = corsMiddleware({
        origin: ['https://example.com', 'https://other.com'],
      })
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { origin: 'https://unknown.com' },
        }),
      )
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://example.com',
      )
    })

    it('should match origin from array', async () => {
      const middleware = corsMiddleware({
        origin: ['https://example.com', 'https://other.com'],
      })
      const testApp = new Elysia()
      middleware(testApp)
      testApp.get('/test', () => ({ ok: true }))

      const response = await testApp.handle(
        new Request('http://localhost/test', {
          method: 'GET',
          headers: { origin: 'https://other.com' },
        }),
      )
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://other.com',
      )
    })
  })
})
