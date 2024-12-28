import type { ZodSchema, ZodTypeDef } from 'zod';
import type { ConfigValidator } from '../config-validator.js';

export interface GetZodConfigValidatorParams<TConfig> {
  schema: ZodSchema<TConfig, ZodTypeDef, unknown>;
}

export function getZodConfigValidator<TConfig extends Record<string, unknown>>(
  params: GetZodConfigValidatorParams<TConfig>,
): ConfigValidator<TConfig> {
  const { schema } = params;
  return (value) => {
    const result = schema.safeParse(value);

    if (result.success) {
      return result.data;
    } else {
      // TODO: add specialized error
      // throw new Error(`Invalid config. ${result.error.format()}`)
      throw result.error;
    }
  };
}
