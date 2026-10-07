import { describe, expect, test } from 'bun:test';

import packageJson from '../package.json';
import provider from './ankh.provider';
import { CAPABILITIES } from './capabilities/index';

describe('provider', () => {
  test('declares permission command metadata', () => {
    expect(provider.category).toBe('permissions');
    expect(provider.commands).toHaveLength(4);
    expect(provider.handlers.map((entry) => entry.path.join(' '))).toEqual(
      provider.commands.map((entry) => entry.path.join(' ')),
    );
  });

  test('keeps package metadata, provider metadata, and catalog aligned', () => {
    expect(packageJson.ankh.capabilities).toEqual(
      CAPABILITIES.map((capability) => ({
        ...capability,
        access: [...capability.access],
        binding: {
          ...capability.binding,
          bindableAs: [...capability.binding.bindableAs],
        },
      })),
    );
    expect(provider.capabilities).toEqual(CAPABILITIES);
    expect(provider.version).toBe(packageJson.version);
  });

  test('maps every command to its canonical capability by ID', () => {
    expect(provider.commands.map(({ path, capability }) => ({ path, capability }))).toEqual([
      { path: ['list'], capability: 'permissions.inspect' },
      { path: ['check'], capability: 'permissions.check' },
      { path: ['request'], capability: 'permissions.request' },
      { path: ['manifest'], capability: 'permissions.manifest' },
    ]);

    expect(
      provider.commands.every(({ capability }) =>
        CAPABILITIES.some((catalogCapability) => catalogCapability.id === capability),
      ),
    ).toBeTrue();
  });
});
