# config-essentials

[![npm version](https://img.shields.io/npm/v/config-essentials.svg)](https://www.npmjs.com/package/config-essentials)

A lightweight, TypeScript-first configuration library with zero dependencies.
Built from battle-tested patterns in service configuration, config-essentials strips away complexity to provide just what you need.
It offers a minimal, flexible foundation in plain JavaScript/TypeScript, with clean extension points for custom configuration sources.

## Usage

Config-essentials provides opinionated defaults for simple application configuration.
The recommended pattern uses a combination of JSON files and environment variables to handle different deployment scenarios.

### Basic Setup

First, define your configuration schema:

```typescript
const ConfigSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
    host: z.string().default('localhost'),
  }),
  database: z.object({
    url: z.string(),
    maxConnections: z.number().default(5),
  }),
  logging: z
    .object({
      level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    })
    .optional(),
});
```

### File Structure

Create a `config` directory in your project root with the following files:

```
project-root/
├── config/
│   ├── config.json           # Base configuration with defaults
│   ├── config.local.json     # Local overrides and secrets (gitignored)
│   ├── config.staging.json   # Staging environment configuration
│   └── config.prod.json      # Production environment configuration
└── .gitignore
```

#### Base Configuration (config.json)

The base configuration file contains reasonable defaults and non-sensitive configuration:

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "database": {
    "maxConnections": 5
  },
  "logging": {
    "level": "info"
  }
}
```

#### Local Development (config.local.json)

Create a `config.local.json` file for local development secrets and overrides. Add `*.local*` to your `.gitignore`:

```json
{
  "database": {
    "url": "postgresql://user:password@localhost:5432/mydb"
  }
}
```

#### Environment-Specific Configuration (config.{env}.json)

Create environment-specific files for staging, production, or other environments:

```json
// config.staging.json
{
  "server": {
    "host": "staging.example.com"
  },
  "logging": {
    "level": "debug"
  }
}
```

### Initialization

Initialize the configuration with the appropriate environment:

```typescript
const { config } = initConfig(
  getConfigDefaultSetup({
    schema: ConfigSchema,
    environmentName: process.env.ACME_ENV,
    prefix: 'ACME',
    configDir: 'config',
  }),
);
```

### Environment Variables

Use environment variables to override configuration values in deployment environments:

```bash
# Override database URL in production
export ACME_DATABASE__URL="postgresql://user:password@prod-db:5432/mydb"

# Override server port
export ACME_SERVER__PORT="8080"
```

Remember that environment variables take precedence over file-based configuration.

### Value Resolution

Configuration values are resolved in the following order (highest to lowest precedence):

1. Environment variables (e.g., `ACME_SERVER__PORT`)
2. Local override file (`config/config.local.json`)
3. Environment-specific file (`config/config.{env}.json`)
4. Base configuration file (`config/config.json`)

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
