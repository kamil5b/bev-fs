import { describe, it, expect, beforeEach } from 'bun:test'
import {
  validateServerConfig,
  validateEnvConfig,
  ServerConfig,
} from '../config/validator'
import { ConfigurationError } from '../errors/ConfigurationError'

describe('validateServerConfig', () => {
  it('should pass validation for valid config', () => {
    const config: ServerConfig = {
      port: 3000,
      routerDir: 'src/server/router',
      staticDir: 'dist/client',
    }
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should pass validation for partial config', () => {
    const config: ServerConfig = { port: 3000 }
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should pass validation for empty config', () => {
    const config: ServerConfig = {}
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should accept port as string', () => {
    const config: ServerConfig = { port: '3000' }
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should accept port as number', () => {
    const config: ServerConfig = { port: 8080 }
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should reject port outside valid range (too low)', () => {
    const config: ServerConfig = { port: 0 }
    expect(() => validateServerConfig(config)).toThrow(ConfigurationError)
  })

  it('should reject port outside valid range (too high)', () => {
    const config: ServerConfig = { port: 65536 }
    expect(() => validateServerConfig(config)).toThrow(ConfigurationError)
  })

  it('should reject invalid port string', () => {
    const config: ServerConfig = { port: 'invalid' }
    expect(() => validateServerConfig(config)).toThrow(ConfigurationError)
  })

  it('should reject negative port', () => {
    const config: ServerConfig = { port: -1 }
    expect(() => validateServerConfig(config)).toThrow(ConfigurationError)
  })

  it('should accept minimum valid port', () => {
    const config: ServerConfig = { port: 1 }
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should accept maximum valid port', () => {
    const config: ServerConfig = { port: 65535 }
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should reject non-string routerDir', () => {
    const config: ServerConfig = { routerDir: 123 as any }
    expect(() => validateServerConfig(config)).toThrow(ConfigurationError)
  })

  it('should accept string routerDir', () => {
    const config: ServerConfig = { routerDir: 'src/server/router' }
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should reject non-string staticDir', () => {
    const config: ServerConfig = { staticDir: true as any }
    expect(() => validateServerConfig(config)).toThrow(ConfigurationError)
  })

  it('should accept string staticDir', () => {
    const config: ServerConfig = { staticDir: 'dist/client' }
    expect(() => validateServerConfig(config)).not.toThrow()
  })

  it('should throw ConfigurationError with correct configKey', () => {
    const config: ServerConfig = { port: 70000 }
    try {
      validateServerConfig(config)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError)
      expect((error as ConfigurationError).configKey).toBe('SERVER_PORT')
    }
  })

  it('should throw ConfigurationError for invalid routerDir type', () => {
    const config: ServerConfig = { routerDir: {} as any }
    try {
      validateServerConfig(config)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError)
      expect((error as ConfigurationError).configKey).toBe('SERVER_ROUTER_DIR')
    }
  })
})

describe('validateEnvConfig', () => {
  it('should pass validation for valid env config', () => {
    const env = { SERVER_PORT: '3000' }
    expect(() => validateEnvConfig(env)).not.toThrow()
  })

  it('should pass validation for empty env config', () => {
    const env = {}
    expect(() => validateEnvConfig(env)).not.toThrow()
  })

  it('should pass validation when SERVER_PORT is undefined', () => {
    const env = { SERVER_PORT: undefined }
    expect(() => validateEnvConfig(env)).not.toThrow()
  })

  it('should reject invalid port number', () => {
    const env = { SERVER_PORT: 'invalid' }
    expect(() => validateEnvConfig(env)).toThrow(ConfigurationError)
  })

  it('should reject port outside valid range', () => {
    const env = { SERVER_PORT: '70000' }
    expect(() => validateEnvConfig(env)).toThrow(ConfigurationError)
  })

  it('should accept minimum valid port', () => {
    const env = { SERVER_PORT: '1' }
    expect(() => validateEnvConfig(env)).not.toThrow()
  })

  it('should accept maximum valid port', () => {
    const env = { SERVER_PORT: '65535' }
    expect(() => validateEnvConfig(env)).not.toThrow()
  })

  it('should throw ConfigurationError with correct configKey', () => {
    const env = { SERVER_PORT: '0' }
    try {
      validateEnvConfig(env)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError)
      expect((error as ConfigurationError).configKey).toBe('SERVER_PORT')
    }
  })

  it('should include helpful error message', () => {
    const env = { SERVER_PORT: 'invalid' }
    try {
      validateEnvConfig(env)
      expect.unreachable()
    } catch (error) {
      const message = (error as ConfigurationError).message
      expect(message).toContain('SERVER_PORT')
      expect(message).toContain('invalid')
    }
  })
})
