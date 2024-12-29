/**
 * Deeply merges two objects or arrays, handling nested structures
 * @param obj1 The target object to merge into
 * @param obj2 The source object to merge from
 * @returns A new object with merged properties
 */
export function deepMerge(obj1: unknown, obj2: unknown): unknown {
  // If either input is not an object, return source if it exists, otherwise target
  if (!isObject(obj1) || !isObject(obj2)) {
    return obj2 ?? obj1;
  }

  const output = { ...obj1 };

  // Iterate through all properties in source
  Object.keys(obj2).forEach((key) => {
    const targetValue = (output as any)[key];
    const sourceValue = (obj2 as any)[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      // If both values are arrays, merge them
      (output as any)[key] = [...targetValue, ...sourceValue];
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      // If both values are objects, recursively merge them
      (output as any)[key] = deepMerge(targetValue, sourceValue);
    } else if (sourceValue !== undefined) {
      // For all other cases, use the source value if it exists
      (output as any)[key] = sourceValue;
    }
  });

  return output;
}

/**
 * Type guard to check if a value is a non-null object
 * @param item The value to check
 * @returns boolean indicating if the value is an object
 */
function isObject(item: unknown): item is object {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

export function setObject<T extends Record<string, any>>(
  object: T,
  path: string[],
  value: any,
): T {
  if (object === null || !isObject(object)) {
    return object;
  }

  let current: any = object;
  const lastIndex = path.length - 1;

  path.slice(0, -1).forEach((key, i) => {
    const nextKey = path[i + 1];
    const isNextKeyNumeric = nextKey && /^\d+$/.test(nextKey);

    if (!(key in current)) {
      current[key] = isNextKeyNumeric ? [] : {};
    }

    current = current[key];
  });

  const pathK = path[lastIndex];
  if (pathK) {
    current[pathK] = value;
  }

  return object;
}

export function camelCase(string: string): string {
  // Handle empty strings
  if (!string) {
    return '';
  }

  // Step 1: Convert the string to lowercase
  string = string.toLowerCase().trim();

  // Step 2: Replace special characters with spaces
  string = string.replace(/[^\w\s]/g, ' ');

  // Step 3: Split into words (handling multiple spaces, hyphens, and underscores)
  const words = string.split(/[\s_-]+/);

  // Step 4: Capitalize first letter of each word except the first one
  return words
    .map((word, index) => {
      if (!word) return ''; // Handle empty words
      if (index === 0) {
        // First word should be all lowercase
        return word.toLowerCase();
      }
      // Capitalize first letter of other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

export function parseEnvKey(envKey: string): string[] {
  return envKey.split('__').map(camelCase);
}

export function readProcessEnv(params: {
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
