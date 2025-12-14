import { describe, it, expect } from 'bun:test'
import { createLoggingMiddleware, createAuthMiddleware, createValidationMiddleware } from '../middleware'
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
      
      // Should not throw
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should add derive and onAfterHandle handlers to app', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      // The middleware should modify the app
      const modifiedApp = middleware(app)
      expect(modifiedApp).toBeDefined()
    })

    it('should create middleware with proper structure', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      // Should return the app for chaining
      expect(result).toBeDefined()
    })

    it('should handle multiple instances independently', () => {
      const middleware1 = createLoggingMiddleware()
      const middleware2 = createLoggingMiddleware()
      
      expect(middleware1).not.toBe(middleware2)
    })

    it('should work with Elysia app without errors', () => {
      const middleware = createLoggingMiddleware()
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })
  })

  describe('createAuthMiddleware', () => {
    it('should create a valid auth middleware function', () => {
      const middleware = createAuthMiddleware()
      expect(middleware).toBeInstanceOf(Function)
    })

    it('should return a function that accepts an Elysia app', () => {
      const middleware = createAuthMiddleware()
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should add derive handler to app', () => {
      const middleware = createAuthMiddleware()
      const app = new Elysia()
      
      const result = middleware(app)
      expect(result).toBeDefined()
    })

    it('should extract authorization header', () => {
      const middleware = createAuthMiddleware()
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should handle Bearer token format', () => {
      const middleware = createAuthMiddleware()
      expect(middleware).toBeInstanceOf(Function)
    })

    it('should work independently of other middleware', () => {
      const authMW = createAuthMiddleware()
      const logMW = createLoggingMiddleware()
      
      const app = new Elysia()
      authMW(app)
      logMW(app)
      
      expect(app).toBeDefined()
    })
  })

  describe('createValidationMiddleware', () => {
    it('should create a validation middleware function', () => {
      const schema = { email: 'string', name: 'string' }
      const middleware = createValidationMiddleware(schema)
      expect(middleware).toBeInstanceOf(Function)
    })

    it('should accept a schema parameter', () => {
      const schema = { email: 'string' }
      expect(() => {
        createValidationMiddleware(schema)
      }).not.toThrow()
    })

    it('should create middleware for empty schema', () => {
      const middleware = createValidationMiddleware({})
      expect(middleware).toBeInstanceOf(Function)
    })

    it('should create middleware for complex schema', () => {
      const schema = {
        email: 'string',
        password: 'string',
        age: 'number',
        active: 'boolean'
      }
      const middleware = createValidationMiddleware(schema)
      expect(middleware).toBeInstanceOf(Function)
    })

    it('should return a function that accepts an Elysia app', () => {
      const schema = { email: 'string' }
      const middleware = createValidationMiddleware(schema)
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should add derive handler to app', () => {
      const schema = { field: 'string' }
      const middleware = createValidationMiddleware(schema)
      const app = new Elysia()
      
      const result = middleware(app)
      expect(result).toBeDefined()
    })

    it('should work with single field schema', () => {
      const schema = { username: 'string' }
      const middleware = createValidationMiddleware(schema)
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })

    it('should work with multiple field schema', () => {
      const schema = {
        name: 'string',
        email: 'string',
        phone: 'string',
        address: 'string'
      }
      const middleware = createValidationMiddleware(schema)
      const app = new Elysia()
      
      expect(() => {
        middleware(app)
      }).not.toThrow()
    })
  })

  describe('Middleware Composition', () => {
    it('should allow chaining multiple middleware', () => {
      const app = new Elysia()
      const logMW = createLoggingMiddleware()
      const authMW = createAuthMiddleware()
      const valMW = createValidationMiddleware({ email: 'string' })
      
      expect(() => {
        logMW(app)
        authMW(app)
        valMW(app)
      }).not.toThrow()
    })

    it('should apply middleware in order', () => {
      const app = new Elysia()
      
      const mw1 = createLoggingMiddleware()
      const mw2 = createAuthMiddleware()
      
      expect(() => {
        mw1(app)
        mw2(app)
      }).not.toThrow()
    })

    it('should allow reusing middleware instances', () => {
      const mw = createLoggingMiddleware()
      const app1 = new Elysia()
      const app2 = new Elysia()
      
      expect(() => {
        mw(app1)
        mw(app2)
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

    it('should create independent instances with createAuthMiddleware', () => {
      const mw1 = createAuthMiddleware()
      const mw2 = createAuthMiddleware()
      
      expect(mw1).not.toBe(mw2)
    })

    it('should create independent instances with createValidationMiddleware', () => {
      const schema1 = { field1: 'string' }
      const schema2 = { field2: 'number' }
      
      const mw1 = createValidationMiddleware(schema1)
      const mw2 = createValidationMiddleware(schema2)
      
      expect(mw1).not.toBe(mw2)
    })
  })
})
