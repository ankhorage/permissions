import { isCapability } from '@ankhorage/contracts/capabilities';
import { describe, expect, test } from 'bun:test';

import { CAPABILITIES } from './index';

describe('CAPABILITIES', () => {
  test('publishes canonical executable action targets', () => {
    expect(CAPABILITIES).toHaveLength(4);
    for (const capability of CAPABILITIES) {
      expect(isCapability(capability)).toBeTrue();
      expect(capability.access).toEqual(['invoke']);
      expect(capability.binding).toEqual({ kind: 'action', bindableAs: ['target'] });
    }
  });
});
