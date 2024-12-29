import test from 'node:test';
import * as assert from 'node:assert';
import {
  camelCase,
  deepMerge,
  parseEnvKey,
  readProcessEnv,
  setObject,
} from './utils.ts';

test('deepMerge function', async (t) => {
  await t.test('merges flat objects correctly', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 });
    assert.deepStrictEqual(result, { a: 1, b: 3, c: 4 });
  });

  await t.test('handles nested objects', () => {
    assert.deepStrictEqual(
      deepMerge(
        {
          a: 1,
          nested: { x: 1, y: 2 },
        },
        {
          nested: { y: 3, z: 4 },
        },
      ),
      {
        a: 1,
        nested: { x: 1, y: 3, z: 4 },
      },
    );
  });

  await t.test('merges arrays correctly', () => {
    assert.deepStrictEqual(deepMerge({ arr: [1, 2] }, { arr: [3, 4] }), {
      arr: [1, 2, 3, 4],
    });
  });

  await t.test('handles deeply nested structures', () => {
    assert.deepStrictEqual(
      deepMerge(
        {
          a: {
            b: {
              c: [1, 2],
              d: { x: 1 },
            },
          },
        },
        {
          a: {
            b: {
              c: [3, 4],
              d: { y: 2 },
            },
          },
        },
      ),
      {
        a: {
          b: {
            c: [1, 2, 3, 4],
            d: { x: 1, y: 2 },
          },
        },
      },
    );
  });

  await t.test('handles undefined and null values', () => {
    assert.deepStrictEqual(
      deepMerge({ a: 1, b: 2, c: 3 }, { a: undefined, b: null }),
      { a: 1, b: null, c: 3 },
    );
  });

  await t.test('handles empty objects', () => {
    assert.deepStrictEqual(deepMerge({ a: 1 }, {}), { a: 1 });
  });

  await t.test('handles non-object inputs', () => {
    assert.deepStrictEqual(deepMerge({ a: 1 }, null), { a: 1 });
  });
});

test('setObject function', async (t) => {
  await t.test('sets value in a simple object', () => {
    const obj = { a: 1 };
    const result = setObject(obj, ['b'], 2);

    assert.deepStrictEqual(result, { a: 1, b: 2 });
    // Verify it modifies the original object
    assert.strictEqual(obj, result);
  });

  await t.test('sets nested object value', () => {
    const obj = { a: { b: 1 } };
    const result = setObject(obj, ['a', 'c'], 2);

    assert.deepStrictEqual(result, {
      a: {
        b: 1,
        c: 2,
      },
    });
  });

  await t.test('creates nested path if it does not exist', () => {
    const obj = {};
    const result = setObject(obj, ['a', 'b', 'c'], 1);

    assert.deepStrictEqual(result, {
      a: {
        b: {
          c: 1,
        },
      },
    });
  });

  await t.test('handles array paths correctly', () => {
    const obj = { users: [] };
    const result = setObject(obj, ['users', '0', 'name'], 'John');

    assert.deepStrictEqual(result, {
      users: [
        {
          name: 'John',
        },
      ],
    });
  });

  await t.test('handles mixed object and array paths', () => {
    const obj = { data: { users: [] } };
    const result = setObject(obj, ['data', 'users', '1', 'details', 'age'], 25);

    assert.deepStrictEqual(result, {
      data: {
        users: [
          ,
          {
            details: {
              age: 25,
            },
          },
        ],
      },
    });
  });

  await t.test('overwrites existing values', () => {
    const obj = { a: { b: 1 } };
    const result = setObject(obj, ['a', 'b'], 2);

    assert.deepStrictEqual(result, {
      a: {
        b: 2,
      },
    });
  });

  await t.test('handles empty path array', () => {
    const obj = { a: 1 };
    const result = setObject(obj, [], 'value');

    assert.deepStrictEqual(result, { a: 1 });
  });

  await t.test('handles non-object input', () => {
    const input = null as any;
    const result = setObject(input, ['a'], 1);

    assert.strictEqual(result, null);
  });

  await t.test('creates arrays for numeric paths', () => {
    const obj = {};
    const result = setObject(obj, ['users', '0', 'scores', '0'], 100);

    assert.deepStrictEqual(result, {
      users: [
        {
          scores: [100],
        },
      ],
    });
    assert.ok(Array.isArray(result.users));
    assert.ok(Array.isArray(result.users?.[0]?.scores));
  });

  await t.test('preserves existing array elements', () => {
    const obj = {
      users: [{ name: 'John' }, { name: 'Jane' }],
    };
    const result = setObject(obj, ['users', '1', 'age'], 25);

    assert.deepStrictEqual(result, {
      users: [{ name: 'John' }, { name: 'Jane', age: 25 }],
    });
  });

  await t.test('handles deeply nested array paths', () => {
    const obj = {};
    const result = setObject(obj, ['a', '0', 'b', '0', 'c', '0'], 'value');

    assert.deepStrictEqual(result, {
      a: [
        {
          b: [
            {
              c: ['value'],
            },
          ],
        },
      ],
    });
  });
});

test('camelCase function', async (t) => {
  // Test basic functionality
  await t.test(
    'should convert simple space-separated string to camelCase',
    () => {
      assert.deepStrictEqual(camelCase('hello world'), 'helloWorld');
      assert.deepStrictEqual(camelCase('foo bar baz'), 'fooBarBaz');
    },
  );

  // Test handling of special characters
  await t.test('should handle strings with special characters', () => {
    assert.deepStrictEqual(camelCase('hello@world'), 'helloWorld');
    assert.deepStrictEqual(camelCase('hello!!!world'), 'helloWorld');
    assert.deepStrictEqual(camelCase('hello#$%world'), 'helloWorld');
  });

  // Test different word separators
  await t.test('should handle different word separators', () => {
    assert.deepStrictEqual(camelCase('hello-world'), 'helloWorld');
    assert.deepStrictEqual(camelCase('hello_world'), 'helloWorld');
    assert.deepStrictEqual(camelCase('hello--world'), 'helloWorld');
    assert.deepStrictEqual(camelCase('hello__world'), 'helloWorld');
  });

  // Test case handling
  await t.test('should handle mixed case input', () => {
    assert.deepStrictEqual(camelCase('HELLO WORLD'), 'helloWorld');
    assert.deepStrictEqual(camelCase('Hello World'), 'helloWorld');
    assert.deepStrictEqual(camelCase('hElLo WoRlD'), 'helloWorld');
  });

  // Test edge cases
  await t.test('should handle edge cases', () => {
    // Empty string
    assert.deepStrictEqual(camelCase(''), '');

    // Single word
    assert.deepStrictEqual(camelCase('hello'), 'hello');

    // Multiple spaces
    assert.deepStrictEqual(camelCase('hello   world'), 'helloWorld');

    // Leading/trailing spaces
    assert.deepStrictEqual(camelCase('  hello world  '), 'helloWorld');

    // All spaces
    assert.deepStrictEqual(camelCase('   '), '');
  });

  // Test mixed separators
  await t.test('should handle mixed separators', () => {
    assert.deepStrictEqual(
      camelCase('hello-world_foo bar'),
      'helloWorldFooBar',
    );
    assert.deepStrictEqual(
      camelCase('hello_world-foo@bar'),
      'helloWorldFooBar',
    );
  });

  // Test numbers
  await t.test('should handle strings with numbers', () => {
    assert.deepStrictEqual(camelCase('hello123 world'), 'hello123World');
    assert.deepStrictEqual(camelCase('123 hello world'), '123HelloWorld');
    assert.deepStrictEqual(camelCase('hello 123'), 'hello123');
  });
});

test('parseEnvKey function', async (t) => {
  // Test basic functionality with varying segments
  await t.test(
    'should split on double underscore and convert parts to camelCase',
    () => {
      assert.deepStrictEqual(parseEnvKey('HELLO_WORLD__FOO_BAR__DB_HOST'), [
        'helloWorld',
        'fooBar',
        'dbHost',
      ]);
      assert.deepStrictEqual(parseEnvKey('SINGLE'), ['single']);
    },
  );
});

test('readProcessEnv function', async (t) => {
  await t.test('should process env vars without prefix', () => {
    const mockEnv = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      APP__NAME: 'myapp',
      APP__CONFIG__DEBUG: 'true',
    };

    const expected = {
      dbHost: 'localhost',
      dbPort: '5432',
      app: {
        name: 'myapp',
        config: {
          debug: 'true',
        },
      },
    };

    const result = readProcessEnv({ env: mockEnv });
    assert.deepStrictEqual(result, expected);
  });

  await t.test(
    'should process env vars with prefix and handle empty values',
    () => {
      const mockEnv = {
        APP_DB_HOST: 'localhost',
        APP_DB_PORT: '5432',
        APP_CONFIG__DEBUG: 'true',
        APP_EMPTY_VALUE: '',
        OTHER_VALUE: 'ignored',
        APP_NESTED__KEY1__KEY2: 'nested-value',
      };

      const expected = {
        dbHost: 'localhost',
        dbPort: '5432',
        config: {
          debug: 'true',
        },
        nested: {
          key1: {
            key2: 'nested-value',
          },
        },
      };

      const result = readProcessEnv({ env: mockEnv, prefix: 'APP' });
      assert.deepStrictEqual(result, expected);
    },
  );
});
