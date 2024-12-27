export type BaseConfig = Record<string, unknown>;

export interface ConfigProvider {
  name: string;
  read: () => BaseConfig;
}
