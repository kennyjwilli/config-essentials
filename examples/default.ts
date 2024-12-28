import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { initConfig } from '../src/index.js';
import { getConfigDefaultSetup } from '../src/lib/default-setup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ExampleConfigSchema = z.object({
  server: z.object({
    port: z.coerce.number(),
    // Example showing zod transforms type support
    timeout: z.string().transform(s => parseInt(s))
  }),
  logging: z
    .object({
      level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    })
    .optional(),
});

const { config } = initConfig(
  getConfigDefaultSetup({
    schema: ExampleConfigSchema,
    environmentName: 'dev',
    prefix: 'ACME',
    env: { ACME_SERVER__PORT: '8080' },
    configDir: path.join(__dirname, 'default-configs'),
  }),
);

console.log(config);
