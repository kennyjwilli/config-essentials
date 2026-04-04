import type { ZodType, output } from 'zod';
import type { ConfigValidator } from '../config-validator.js';
import type { BaseConfig } from '../config-provider.js';

export interface GetZodConfigValidatorParams<
  TSchema extends ZodType<BaseConfig>,
> {
  schema: TSchema;
}

export function getZodConfigValidator<TSchema extends ZodType<BaseConfig>>(
  params: GetZodConfigValidatorParams<TSchema>,
): ConfigValidator<output<TSchema>> {
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
