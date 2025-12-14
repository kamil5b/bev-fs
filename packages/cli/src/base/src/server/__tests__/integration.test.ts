import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { middleware as rootMiddleware, GET as rootGET, POST as rootPOST } from '../router'
import { middleware as uploadMiddleware, POST as uploadPOST } from '../router/upload'

describe('Base Template - Integration Tests', () => {
  describe('Root Middleware Integration', () => {
    it('should apply root middleware and generate requestId', async () => {
      const app = new Elysia()
      
      // Apply root middleware
      rootMiddleware.forEach(mw => mw(app))
      
      // Register root routes
      app.get('/', ({ requestId }: any) => rootGET({ requestId }))
      
      const response = await app.handle(
        new Request('http://localhost/', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.requestId).toBeDefined()
      expect(typeof body.requestId).toBe('string')
    })

    it('should execute derive callback and return request with requestId', async () => {
      const app = new Elysia()
      
      // Apply root middleware - this exercises lines 10-11 (derive callback)
      rootMiddleware.forEach(mw => mw(app))
      
      let capturedRequestId: string | null = null
      
      app.get('/test', ({ requestId }: any) => {
        capturedRequestId = requestId
        return { requestId }
      })
      
      const response = await app.handle(
        new Request('http://localhost/test', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      expect(capturedRequestId).toBeDefined()
      expect(typeof capturedRequestId).toBe('string')
      expect(capturedRequestId?.length).toBeGreaterThan(0)
    })
  })

  describe('Upload Middleware Integration', () => {
    it('should apply upload middleware and validate files', async () => {
      const app = new Elysia()
      
      // Apply root middleware first
      rootMiddleware.forEach(mw => mw(app))
      
      // Create upload group
      app.group('/api', (api) => {
        // Apply upload middleware - this exercises lines 14-19 (derive callback in middleware)
        uploadMiddleware.forEach(mw => mw(api))
        
        api.post('/upload', ({ body, requestId, filesCount }: any) => 
          uploadPOST({ body, requestId, filesCount })
        )
        
        return api
      })
      
      const response = await app.handle(
        new Request('http://localhost/api/upload', {
          method: 'POST',
          body: JSON.stringify({ file: 'test.pdf' }),
          headers: { 'Content-Type': 'application/json' },
        })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.requestId).toBeDefined()
      expect(body.filesCount).toBeDefined()
    })

    it('should execute upload middleware derive callback', async () => {
      const app = new Elysia()
      
      rootMiddleware.forEach(mw => mw(app))
      
      app.group('/api', (api) => {
        uploadMiddleware.forEach(mw => mw(api))
        
        let capturedFilesCount: number | null = null
        
        api.post('/upload', ({ body, requestId, filesCount }: any) => {
          capturedFilesCount = filesCount
          return {
            success: true,
            message: 'Upload successful',
            requestId,
            filesCount,
            files: [],
          }
        })
        
        return api
      })
      
      const response = await app.handle(
        new Request('http://localhost/api/upload', {
          method: 'POST',
          body: JSON.stringify({ file1: 'test1.pdf', file2: 'test2.pdf' }),
          headers: { 'Content-Type': 'application/json' },
        })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.filesCount).toBe(2)
    })
  })

  describe('Full Request/Response Flow', () => {
    it('should handle GET request through middleware chain', async () => {
      const app = new Elysia()
      
      rootMiddleware.forEach(mw => mw(app))
      app.get('/', ({ requestId }: any) => rootGET({ requestId }))
      
      const response = await app.handle(
        new Request('http://localhost/', { method: 'GET' })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.message).toBe('Welcome to bev-fs API')
      expect(body.requestId).toBeDefined()
      expect(body.timestamp).toBeDefined()
    })

    it('should handle POST request through middleware chain', async () => {
      const app = new Elysia()
      
      rootMiddleware.forEach(mw => mw(app))
      app.post('/', ({ requestId, body }: any) => rootPOST({ requestId, body }))
      
      const testBody = { data: 'test' }
      const response = await app.handle(
        new Request('http://localhost/', {
          method: 'POST',
          body: JSON.stringify(testBody),
          headers: { 'Content-Type': 'application/json' },
        })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.requestId).toBeDefined()
    })

    it('should handle nested route with inherited middleware', async () => {
      const app = new Elysia()
      
      rootMiddleware.forEach(mw => mw(app))
      
      app.group('/api', (api) => {
        uploadMiddleware.forEach(mw => mw(api))
        
        api.post('/upload', ({ body, requestId, filesCount }: any) =>
          uploadPOST({ body, requestId, filesCount })
        )
        
        return api
      })
      
      const response = await app.handle(
        new Request('http://localhost/api/upload', {
          method: 'POST',
          body: JSON.stringify({ file: 'document.pdf' }),
          headers: { 'Content-Type': 'application/json' },
        })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.requestId).toBeDefined()
      expect(body.filesCount).toBe(1)
    })
  })

  describe('Middleware Error Handling', () => {
    it('should handle empty body gracefully in upload middleware', async () => {
      const app = new Elysia()
      
      rootMiddleware.forEach(mw => mw(app))
      
      app.group('/api', (api) => {
        uploadMiddleware.forEach(mw => mw(api))
        
        api.post('/upload', ({ body, requestId, filesCount }: any) =>
          uploadPOST({ body, requestId, filesCount })
        )
        
        return api
      })
      
      const response = await app.handle(
        new Request('http://localhost/api/upload', {
          method: 'POST',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        })
      )
      
      // Middleware should throw on empty body
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('RequestId Generation Coverage', () => {
    it('should generate unique requestIds for each request', async () => {
      const app = new Elysia()
      
      rootMiddleware.forEach(mw => mw(app))
      
      const requestIds = new Set<string>()
      
      app.get('/', ({ requestId }: any) => {
        requestIds.add(requestId)
        return { requestId }
      })
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await app.handle(
          new Request('http://localhost/', { method: 'GET' })
        )
      }
      
      // Should have 5 unique IDs (covers line 10 derive callback execution)
      expect(requestIds.size).toBe(5)
    })
  })

  describe('Upload Middleware Validation Coverage', () => {
    it('should validate and count files in body', async () => {
      const app = new Elysia()
      
      rootMiddleware.forEach(mw => mw(app))
      
      app.group('/api', (api) => {
        uploadMiddleware.forEach(mw => mw(api))
        
        api.post('/upload', ({ filesCount }: any) => ({
          success: true,
          filesCount,
          files: [],
        }))
        
        return api
      })
      
      // Test with multiple files
      const fileBody = {
        file1: 'content1',
        file2: 'content2',
        file3: 'content3',
      }
      
      const response = await app.handle(
        new Request('http://localhost/api/upload', {
          method: 'POST',
          body: JSON.stringify(fileBody),
          headers: { 'Content-Type': 'application/json' },
        })
      )
      
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.filesCount).toBe(3)
    })
  })
})
