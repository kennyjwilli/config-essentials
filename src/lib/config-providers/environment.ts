import type { ConfigProvider } from '../config-provider.js';
import { readProcessEnv } from '../../utils.js';

export interface GetEnvironmentConfigProviderParams {
  env?: NodeJS.ProcessEnv;
  prefix?: string;
}

export function getEnvironmentConfigProvider(
  params: GetEnvironmentConfigProviderParams,
): ConfigProvider {
  const { env = process.env, prefix } = params;
  return {
    name: 'EnvironmentConfigProvider',
    read: () => readProcessEnv({ env, prefix }),
  };
}
