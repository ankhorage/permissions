import { describe, expect, test } from 'bun:test';

import { PermissionsProvider, usePermission, usePermissions } from './index';

describe('react exports', () => {
  test('exposes provider and hooks without rendering dependencies', () => {
    expect(typeof PermissionsProvider).toBe('function');
    expect(typeof usePermissions).toBe('function');
    expect(typeof usePermission).toBe('function');
  });
});
