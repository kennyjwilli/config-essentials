import type { ConfigProvider } from '../config-provider.js';
import { camelCase, setObject } from '../../utils.js';

function parseEnvKey(envKey: string): string[] {
  return envKey.split('__').map(camelCase);
}

function readProcessEnv(params: {
  env: NodeJS.ProcessEnv;
  prefix?: string;
}): Record<string, unknown> {
  const { env, prefix } = params;
  return Object.entries(env)
    .filter(([k]) => (prefix ? k.startsWith(prefix) : true))
    .map(([k, v]): [string, string | undefined] => [
      prefix ? k.substring(prefix.length + 1) : k,
      v,
    ])
    .reduce((acc, [k, v]) => {
      if (v && v.length > 0) {
        return setObject(acc, parseEnvKey(k), v);
      } else {
        return acc;
      }
    }, {});
}

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
    read: () => {
      return readProcessEnv({ env, prefix });
    },
  };
}
