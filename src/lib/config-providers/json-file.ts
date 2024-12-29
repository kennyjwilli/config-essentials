import type { BaseConfig, ConfigProvider } from '../config-provider.js';
import * as fs from 'node:fs';
import { ConfigProviderError } from '../config-provider-error.js';

function readJsonFile(path: string): BaseConfig {
  if (!fs.existsSync(path)) {
    return {};
  }

  let fileContent: string;
  try {
    fileContent = fs.readFileSync(path, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    throw new ConfigProviderError(`Failed to read file: ${message}`);
  }

  try {
    return JSON.parse(fileContent);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    throw new Error(`Invalid JSON format: ${message}`);
  }
}

interface GetJsonFileConfigProviderParams {
  path: string;
}

export function getJsonFileConfigProvider(
  params: GetJsonFileConfigProviderParams,
): ConfigProvider {
  const { path } = params;
  return {
    name: `JsonFileConfigProvider(path=${path})`,
    read: () => readJsonFile(path),
  };
}
