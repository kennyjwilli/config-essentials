import type { InitConfigParams } from '../index.js';
import type { ZodType, output } from 'zod';
import type { BaseConfig, ConfigProvider } from './config-provider.js';
import { getJsonFileConfigProvider } from './config-providers/json-file.js';
import { getEnvironmentConfigProvider } from './config-providers/environment.js';
import { getZodConfigValidator } from './config-validators/zod.js';
import * as path from 'node:path';

export interface GetConfigDefaultSetupParams<
  TSchema extends ZodType<BaseConfig>,
> {
  schema: TSchema;
  environmentName?: string;
  prefix?: string;
  env?: NodeJS.ProcessEnv;
  configDir?: string;
  providers?: ConfigProvider[];
}

export function getDefaultConfigProviders<TSchema extends ZodType<BaseConfig>>(
  params: Omit<GetConfigDefaultSetupParams<TSchema>, 'schema'>,
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
    ...(environmentName
      ? [
          getJsonFileConfigProvider({
            path: path.join(configDir, `config.${environmentName}.json`),
          }),
        ]
      : []),
    getJsonFileConfigProvider({
      path: path.join(configDir, 'config.local.json'),
    }),
    getEnvironmentConfigProvider({ env, prefix }),
    ...providers,
  ];
}

export function getConfigDefaultSetup<TSchema extends ZodType<BaseConfig>>(
  params: GetConfigDefaultSetupParams<TSchema>,
): InitConfigParams<output<TSchema>> {
  const { schema, providers = [] } = params;
  const defaultProviders = getDefaultConfigProviders(params);
  return {
    providers: [...defaultProviders, ...providers],
    validate: getZodConfigValidator({ schema }),
  };
}
