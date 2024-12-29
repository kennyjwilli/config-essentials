import type { InitConfigParams } from '../index.js';
import type { ZodSchema, ZodTypeDef } from 'zod';
import type { BaseConfig, ConfigProvider } from './config-provider.js';
import { getJsonFileConfigProvider } from './config-providers/json-file.js';
import { getEnvironmentConfigProvider } from './config-providers/environment.js';
import { getZodConfigValidator } from './config-validators/zod.js';
import * as path from 'node:path';

export interface GetConfigDefaultSetupParams<TConfig extends BaseConfig> {
  schema: ZodSchema<TConfig, ZodTypeDef, unknown>;
  environmentName: string;
  prefix?: string;
  env?: NodeJS.ProcessEnv;
  configDir?: string;
  providers?: ConfigProvider[];
}

export function getDefaultConfigProviders<TConfig extends BaseConfig>(
  params: Omit<GetConfigDefaultSetupParams<TConfig>, 'schema'>,
): ConfigProvider[] {
  const {
    environmentName,
    prefix,
    env,
    configDir = 'config',
    providers = [],
  } = params;

  return [
    getJsonFileConfigProvider({
      path: path.join(configDir, 'config.json'),
    }),
    getJsonFileConfigProvider({
      path: path.join(configDir, `config.${environmentName}.json`),
    }),
    getJsonFileConfigProvider({
      path: path.join(configDir, 'config.local.json'),
    }),
    getEnvironmentConfigProvider({ env, prefix }),
    ...providers,
  ];
}

export function getConfigDefaultSetup<TConfig extends BaseConfig>(
  params: GetConfigDefaultSetupParams<TConfig>,
): InitConfigParams<TConfig> {
  const { schema, providers = [] } = params;
  const defaultProviders = getDefaultConfigProviders(params);
  return {
    providers: [...defaultProviders, ...providers],
    validate: getZodConfigValidator({ schema }),
  };
}
