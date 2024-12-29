import { deepMerge } from './utils.js';
import type { BaseConfig, ConfigProvider } from './lib/config-provider.js';
import type { ConfigValidator } from './lib/config-validator.js';

export function defaultConfigValidate<TConfig>(value: unknown): TConfig {
  return value as TConfig;
}

export interface InitConfigParams<TConfig extends BaseConfig = BaseConfig> {
  providers: ConfigProvider[];
  prefix?: string;
  validate?: ConfigValidator<TConfig>;
}

interface InitConfigResult<TConfig extends BaseConfig = BaseConfig> {
  config: TConfig;
}

export function initConfig<TConfig extends BaseConfig = BaseConfig>(
  params: InitConfigParams<TConfig>,
): InitConfigResult<TConfig> {
  const { providers, validate = defaultConfigValidate } = params;

  const unsafeConfig = providers.reduce((configAcc, provider) => {
    const configPart = provider.read();
    return deepMerge(configAcc, configPart);
  }, {} as unknown);

  const config = validate(unsafeConfig);

  return { config };
}
