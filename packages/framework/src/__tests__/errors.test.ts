import { describe, it, expect } from 'bun:test'
import { ConfigurationError } from '../errors/ConfigurationError'
import { RouteDiscoveryError } from '../errors/RouteDiscoveryError'

describe('ConfigurationError', () => {
  it('should create error with configKey and message', () => {
    const error = new ConfigurationError('SERVER_PORT', 'Invalid port number')
    expect(error.configKey).toBe('SERVER_PORT')
    expect(error.message).toBe('Invalid port number')
  })

  it('should have correct name property', () => {
    const error = new ConfigurationError('SERVER_PORT', 'Invalid port')
    expect(error.name).toBe('ConfigurationError')
  })

  it('should be instanceof Error', () => {
    const error = new ConfigurationError('SERVER_PORT', 'Invalid port')
    expect(error instanceof Error).toBe(true)
  })

  it('should have stack trace', () => {
    const error = new ConfigurationError('SERVER_PORT', 'Invalid port')
    expect(error.stack).toBeDefined()
  })

  it('should handle different config keys', () => {
    const error1 = new ConfigurationError(
      'SERVER_ROUTER_DIR',
      'Router directory not found',
    )
    const error2 = new ConfigurationError(
      'SERVER_STATIC_DIR',
      'Static directory not found',
    )

    expect(error1.configKey).toBe('SERVER_ROUTER_DIR')
    expect(error2.configKey).toBe('SERVER_STATIC_DIR')
  })
})

describe('RouteDiscoveryError', () => {
  it('should create error with routerDir and message', () => {
    const error = new RouteDiscoveryError('src/router', 'Failed to load route')
    expect(error.routerDir).toBe('src/router')
    expect(error.message).toBe('Failed to load route')
  })

  it('should have correct name property', () => {
    const error = new RouteDiscoveryError('src/router', 'Failed to load route')
    expect(error.name).toBe('RouteDiscoveryError')
  })

  it('should be instanceof Error', () => {
    const error = new RouteDiscoveryError('src/router', 'Failed to load route')
    expect(error instanceof Error).toBe(true)
  })

  it('should capture original error', () => {
    const originalError = new Error('Original error')
    const error = new RouteDiscoveryError(
      'src/router',
      'Failed to load route',
      originalError,
    )
    expect(error.originalError).toBe(originalError)
  })

  it('should handle undefined originalError', () => {
    const error = new RouteDiscoveryError('src/router', 'Failed to load route')
    expect(error.originalError).toBeUndefined()
  })

  it('should have stack trace', () => {
    const error = new RouteDiscoveryError('src/router', 'Failed to load route')
    expect(error.stack).toBeDefined()
  })

  it('should capture non-Error originalError', () => {
    const originalError = 'String error'
    const error = new RouteDiscoveryError(
      'src/router',
      'Failed to load route',
      originalError,
    )
    expect(error.originalError).toBe(originalError)
  })
})
