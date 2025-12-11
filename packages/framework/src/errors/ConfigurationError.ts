/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends Error {
  constructor(
    public readonly configKey: string,
    message: string,
  ) {
    super(message)
    this.name = 'ConfigurationError'
  }
}
