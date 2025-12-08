import { ConfigurationError } from "../errors/ConfigurationError";

export interface ServerConfig {
  port?: number | string;
  routerDir?: string;
  staticDir?: string;
}

/**
 * Validates server configuration
 * Throws ConfigurationError if validation fails
 */
export function validateServerConfig(config: ServerConfig): void {
  if (config.port !== undefined) {
    const port = typeof config.port === 'string' ? parseInt(config.port) : config.port;
    
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new ConfigurationError(
        'SERVER_PORT',
        `Invalid SERVER_PORT: must be a number between 1 and 65535, got "${config.port}"`
      );
    }
  }

  if (config.routerDir && typeof config.routerDir !== 'string') {
    throw new ConfigurationError(
      'SERVER_ROUTER_DIR',
      `Invalid SERVER_ROUTER_DIR: must be a string, got ${typeof config.routerDir}`
    );
  }

  if (config.staticDir && typeof config.staticDir !== 'string') {
    throw new ConfigurationError(
      'SERVER_STATIC_DIR',
      `Invalid SERVER_STATIC_DIR: must be a string, got ${typeof config.staticDir}`
    );
  }
}

/**
 * Validates environment variable configuration
 * Throws ConfigurationError if required env vars are invalid
 */
export function validateEnvConfig(env: Record<string, string | undefined>): void {
  const serverPort = env.SERVER_PORT;
  
  if (serverPort !== undefined) {
    const port = parseInt(serverPort);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new ConfigurationError(
        'SERVER_PORT',
        `Invalid SERVER_PORT environment variable: must be a number between 1 and 65535, got "${serverPort}"`
      );
    }
  }
}
