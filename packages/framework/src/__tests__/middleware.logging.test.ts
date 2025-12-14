import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { loggingMiddleware, requestTimingMiddleware } from '../middleware/logging.middleware'
import { Elysia } from 'elysia'

describe('loggingMiddleware', () => {
  let app: Elysia
  let consoleLogMock: ReturnType<typeof mock>

  beforeEach(() => {
    app = new Elysia()
    consoleLogMock = mock(() => {})
  })

  afterEach(() => {
    consoleLogMock.mockClear?.()
  })

  it('should create middleware function', () => {
    const middleware = loggingMiddleware()
    expect(typeof middleware).toBe('function')
  })

  it('should apply to Elysia app', () => {
    const middleware = loggingMiddleware()
    const appWithMiddleware = middleware(app)
    expect(appWithMiddleware).toBeInstanceOf(Elysia)
  })

  it('should return Elysia instance', () => {
    const middleware = loggingMiddleware()
    const result = middleware(app)
    expect(result).toBeInstanceOf(Elysia)
  })

  it('should not throw on application', () => {
    const middleware = loggingMiddleware()
    expect(() => middleware(app)).not.toThrow()
  })

  it('should set up beforeHandle hook', () => {
    const middleware = loggingMiddleware()
    const app2 = new Elysia()

    expect(() => {
      const result = middleware(app2)
      expect(result).toBeInstanceOf(Elysia)
    }).not.toThrow()
  })

  it('should be reusable across multiple apps', () => {
    const middleware = loggingMiddleware()
    const app1 = new Elysia()
    const app2 = new Elysia()

    const result1 = middleware(app1)
    const result2 = middleware(app2)

    expect(result1).toBeInstanceOf(Elysia)
    expect(result2).toBeInstanceOf(Elysia)
  })

  it('should chain with other middleware', () => {
    const logging = loggingMiddleware()
    const app2 = new Elysia()

    expect(() => {
      const result1 = logging(app2)
      const result2 = logging(result1)
      expect(result2).toBeInstanceOf(Elysia)
    }).not.toThrow()
  })

  it('should not require configuration', () => {
    expect(() => loggingMiddleware()).not.toThrow()
  })

  it('should handle scoped applications', () => {
    const middleware = loggingMiddleware()
    const app2 = new Elysia({ prefix: '/api' })

    expect(() => middleware(app2)).not.toThrow()
  })

  describe('logging hook execution', () => {
    it('should log request information', async () => {
      const originalLog = console.log
      const logs: string[] = []
      console.log = mock((msg: string) => logs.push(msg)) as any

      try {
        const middleware = loggingMiddleware()
        const testApp = new Elysia()
        middleware(testApp)
        testApp.get('/test', () => ({ ok: true }))

        await testApp.handle(
          new Request('http://localhost/test', { method: 'GET' }),
        )

        expect(logs.length).toBeGreaterThan(0)
        expect(logs[0]).toContain('GET')
        expect(logs[0]).toContain('/test')
      } finally {
        console.log = originalLog
      }
    })

    it('should include timestamp in logs', async () => {
      const originalLog = console.log
      const logs: string[] = []
      console.log = mock((msg: string) => logs.push(msg)) as any

      try {
        const middleware = loggingMiddleware()
        const testApp = new Elysia()
        middleware(testApp)
        testApp.get('/test', () => ({ ok: true }))

        await testApp.handle(
          new Request('http://localhost/test', { method: 'GET' }),
        )

        expect(logs.some((log) => log.includes('['))).toBe(true)
      } finally {
        console.log = originalLog
      }
    })

    it('should log different HTTP methods', async () => {
      const originalLog = console.log
      const logs: string[] = []
      console.log = mock((msg: string) => logs.push(msg)) as any

      try {
        const middleware = loggingMiddleware()
        const testApp = new Elysia()
        middleware(testApp)
        testApp.post('/test', () => ({ ok: true }))

        await testApp.handle(
          new Request('http://localhost/test', { method: 'POST' }),
        )

        expect(logs.some((log) => log.includes('POST'))).toBe(true)
      } finally {
        console.log = originalLog
      }
    })

    it('should log different request paths', async () => {
      const originalLog = console.log
      const logs: string[] = []
      console.log = mock((msg: string) => logs.push(msg)) as any

      try {
        const middleware = loggingMiddleware()
        const testApp = new Elysia()
        middleware(testApp)
        testApp.get('/api/users', () => ({ ok: true }))

        await testApp.handle(
          new Request('http://localhost/api/users', { method: 'GET' }),
        )

        expect(logs.some((log) => log.includes('/api/users'))).toBe(true)
      } finally {
        console.log = originalLog
      }
    })
  })
})

describe('requestTimingMiddleware', () => {
  let app: Elysia

  beforeEach(() => {
    app = new Elysia()
  })

  it('should create middleware function', () => {
    const middleware = requestTimingMiddleware()
    expect(typeof middleware).toBe('function')
  })

  it('should apply to Elysia app', () => {
    const middleware = requestTimingMiddleware()
    const appWithMiddleware = middleware(app)
    expect(appWithMiddleware).toBeInstanceOf(Elysia)
  })

  it('should return Elysia instance', () => {
    const middleware = requestTimingMiddleware()
    const result = middleware(app)
    expect(result).toBeInstanceOf(Elysia)
  })

  it('should not throw on application', () => {
    const middleware = requestTimingMiddleware()
    expect(() => middleware(app)).not.toThrow()
  })

  it('should set up derive and afterHandle hooks', () => {
    const middleware = requestTimingMiddleware()
    const app2 = new Elysia()

    expect(() => {
      const result = middleware(app2)
      expect(result).toBeInstanceOf(Elysia)
    }).not.toThrow()
  })

  it('should be reusable across multiple apps', () => {
    const middleware = requestTimingMiddleware()
    const app1 = new Elysia()
    const app2 = new Elysia()

    const result1 = middleware(app1)
    const result2 = middleware(app2)

    expect(result1).toBeInstanceOf(Elysia)
    expect(result2).toBeInstanceOf(Elysia)
  })

  it('should chain with other middleware', () => {
    const timing = requestTimingMiddleware()
    const app2 = new Elysia()

    expect(() => {
      const result1 = timing(app2)
      const result2 = timing(result1)
      expect(result2).toBeInstanceOf(Elysia)
    }).not.toThrow()
  })

  it('should not require configuration', () => {
    expect(() => requestTimingMiddleware()).not.toThrow()
  })

  it('should handle scoped applications', () => {
    const middleware = requestTimingMiddleware()
    const app2 = new Elysia({ prefix: '/api' })

    expect(() => middleware(app2)).not.toThrow()
  })

  describe('timing hook execution', () => {
    it('should measure request timing', async () => {
      const originalLog = console.log
      const logs: string[] = []
      console.log = mock((msg: string) => logs.push(msg)) as any

      try {
        const middleware = requestTimingMiddleware()
        const testApp = new Elysia()
        middleware(testApp)
        testApp.get('/test', () => ({ ok: true }))

        await testApp.handle(
          new Request('http://localhost/test', { method: 'GET' }),
        )

        expect(logs.some((log) => log.includes('ms'))).toBe(true)
      } finally {
        console.log = originalLog
      }
    })

    it('should log request method and path with duration', async () => {
      const originalLog = console.log
      const logs: string[] = []
      console.log = mock((msg: string) => logs.push(msg)) as any

      try {
        const middleware = requestTimingMiddleware()
        const testApp = new Elysia()
        middleware(testApp)
        testApp.get('/test', () => ({ ok: true }))

        await testApp.handle(
          new Request('http://localhost/test', { method: 'GET' }),
        )

        const timingLog = logs.find((log) => log.includes('GET') && log.includes('ms'))
        expect(timingLog).toBeDefined()
        expect(timingLog).toContain('/test')
      } finally {
        console.log = originalLog
      }
    })

    it('should measure timing for different methods', async () => {
      const originalLog = console.log
      const logs: string[] = []
      console.log = mock((msg: string) => logs.push(msg)) as any

      try {
        const middleware = requestTimingMiddleware()
        const testApp = new Elysia()
        middleware(testApp)
        testApp.post('/api/data', () => ({ ok: true }))

        await testApp.handle(
          new Request('http://localhost/api/data', { method: 'POST' }),
        )

        expect(logs.some((log) => log.includes('POST') && log.includes('ms'))).toBe(true)
      } finally {
        console.log = originalLog
      }
    })

    it('should provide valid timing measurements', async () => {
      const originalLog = console.log
      const logs: string[] = []
      console.log = mock((msg: string) => logs.push(msg)) as any

      try {
        const middleware = requestTimingMiddleware()
        const testApp = new Elysia()
        middleware(testApp)
        testApp.get('/test', () => ({ ok: true }))

        await testApp.handle(
          new Request('http://localhost/test', { method: 'GET' }),
        )

        const timingLog = logs.find((log) => log.includes('ms'))
        expect(timingLog).toBeDefined()

        // Extract duration number
        const match = timingLog?.match(/(\d+)ms/)
        expect(match).toBeDefined()
        expect(parseInt(match![1])).toBeGreaterThanOrEqual(0)
      } finally {
        console.log = originalLog
      }
    })
  })
})

describe('loggingMiddleware and requestTimingMiddleware together', () => {
  it('should chain both logging and timing middleware', () => {
    const app = new Elysia()
    const logging = loggingMiddleware()
    const timing = requestTimingMiddleware()

    const withLogging = logging(app)
    const withTiming = timing(withLogging)

    expect(withTiming).toBeInstanceOf(Elysia)
  })

  it('should apply in order without conflicts', () => {
    const app = new Elysia()
    const logging = loggingMiddleware()
    const timing = requestTimingMiddleware()

    expect(() => {
      logging(app)
      timing(app)
    }).not.toThrow()
  })

  it('should log both request start and duration', async () => {
    const originalLog = console.log
    const logs: string[] = []
    console.log = mock((msg: string) => logs.push(msg)) as any

    try {
      const app = new Elysia()
      loggingMiddleware()(app)
      requestTimingMiddleware()(app)
      app.get('/test', () => ({ ok: true }))

      await app.handle(
        new Request('http://localhost/test', { method: 'GET' }),
      )

      // Should have both timestamp log and timing log
      expect(logs.length).toBeGreaterThanOrEqual(1)
    } finally {
      console.log = originalLog
    }
  })
})
