import type { InitConfigParams } from '../index.js';
import type { ZodSchema } from 'zod';
import type { BaseConfig, ConfigProvider } from './config-provider.js';
import { getJsonFileConfigProvider } from './config-providers/json-file.js';
import { getEnvironmentConfigProvider } from './config-providers/environment.js';
import { getZodConfigValidator } from './config-validators/zod.js';
import * as path from 'node:path';

export interface GetConfigDefaultSetupParams<TConfig extends BaseConfig> {
  schema: ZodSchema<TConfig>;
  environmentName: string;
  prefix?: string;
  env?: NodeJS.ProcessEnv;
  configDir?: string;
  providers?: ConfigProvider[];
}

export function getConfigDefaultSetup<TConfig extends BaseConfig>(
  params: GetConfigDefaultSetupParams<TConfig>,
): InitConfigParams<TConfig> {
  const {
    schema,
    environmentName,
    prefix,
    env,
    configDir = 'config',
    providers = [],
  } = params;
  return {
    providers: [
      getJsonFileConfigProvider({
        path: path.join(configDir, `config.${environmentName}.json`),
      }),
      getJsonFileConfigProvider({
        path: path.join(configDir, 'config.local.json'),
      }),
      getEnvironmentConfigProvider({ env, prefix }),
      ...providers
    ],
    validate: getZodConfigValidator({ schema }),
  };
}
