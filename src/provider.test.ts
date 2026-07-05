import { describe, expect, test } from 'bun:test';

import provider from './ankh.provider';

describe('provider', () => {
  test('declares permission command metadata', () => {
    expect(provider.category).toBe('permissions');
    expect(provider.commands).toHaveLength(4);
    expect(provider.handlers.map((entry) => entry.path.join(' '))).toEqual(
      provider.commands.map((entry) => entry.path.join(' ')),
    );
  });
});
