import { describe, expect, test } from 'bun:test';

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

  test('keeps package metadata, provider metadata, and catalog aligned', async () => {
    const packageJson = (await Bun.file(new URL('../package.json', import.meta.url)).json()) as {
      readonly ankh: { readonly capabilities: unknown };
    };

    expect(packageJson.ankh.capabilities).toEqual(CAPABILITIES);
    expect(provider.capabilities).toEqual(CAPABILITIES);
  });
});
