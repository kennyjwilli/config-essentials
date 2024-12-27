export class ConfigProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigProviderError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigProviderError);
    }
  }
}
