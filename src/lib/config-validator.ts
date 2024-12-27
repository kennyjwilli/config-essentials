export type ConfigValidator<
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> = (value: unknown) => TConfig;
