/**
 * Deeply merges two objects or arrays, handling nested structures
 * @param target The target object to merge into
 * @param source The source object to merge from
 * @returns A new object with merged properties
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  // Create a new object to avoid modifying the original
  const output = { ...target };

  // If either input is not an object, return source if it exists, otherwise target
  if (!isObject(target) || !isObject(source)) {
    return (source as T) ?? target;
  }

  // Iterate through all properties in source
  Object.keys(source).forEach((key) => {
    const targetValue = (output as any)[key];
    const sourceValue = (source as any)[key];

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

  current[path[lastIndex] ?? ''] = value;
  return object;
}

export function camelCase(string: string): string {
  // Handle empty strings
  if (!string) {
    return '';
  }

  // Step 1: Convert the string to lowercase
  string = string.toLowerCase();

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
