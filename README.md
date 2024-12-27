# config-essentials

[![npm version](https://img.shields.io/npm/v/config-essentials.svg)](https://www.npmjs.com/package/config-essentials)

A lightweight, TypeScript-first configuration library with zero dependencies.
Built from battle-tested patterns in service configuration, config-essentials strips away complexity to provide just what you need.
It offers a minimal, flexible foundation in plain JavaScript/TypeScript, with clean extension points for custom configuration sources.

## Usage

Config-essentials provides opinionated defaults for simple application configuration.

```typescript
const ConfigSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
  }),
  logging: z
    .object({
      level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    })
    .optional(),
});

const { config } = initConfig(
  getConfigDefaultSetup({
    schema: ConfigSchema,
    environmentName: 'dev',
    prefix: 'ACME',
    configDir: 'config',
  }),
);
```

Configuration values are read in the following priority order:

1. Environment variables (e.g., ACME_SERVER\_\_PORT)
2. Local override file (config/config.local.json)
3. Environment-specific file (config/config.dev.json)

The loaded configuration is validated against ConfigSchema and returned as a fully type-safe object.

## Motivation

Application configuration should be straightforward but often isn't.
We need to read values from multiple sources, parse them, validate them, and make them available to our runtime code.
Every team has their preferred approach, but all need to support common scenarios: local development, CI, production, and hybrid environments.
JSON and environment variables form a natural foundation - JSON for structured data, environment variables for secrets and deployment settings.
By combining these fundamentals with clear conventions, we can create a robust yet simple configuration system.

## Extensibility

Config-essentials is built around two extensible components: `ConfigProvider` and `ConfigValidator`.

### ConfigProvider

A `ConfigProvider` is responsible for reading configuration from a single source. It consists of:

- A `name` to identify the provider
- A `read` function that returns a partial configuration object

For example, a JSON file provider's `read` function would load and parse a JSON file from disk.
While providers can include their own validation, it's conventional to handle validation separately through a `ConfigValidator`.

Multiple `ConfigProvider`s can be chained together, with later providers taking precedence over earlier ones.

### ConfigValidator

The `ConfigValidator` receives the merged configuration from all providers.
Its role is to:

- Coerce values into their correct types
- Validate the configuration structure
- Return a fully validated configuration object

A Zod-based validator, for instance, would use a schema's `.parse` method to perform these operations.
