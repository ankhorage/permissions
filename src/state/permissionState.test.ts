import { describe, expect, test } from 'bun:test';

import { Permission } from '../registry/permissions';
import {
  createPermissionState,
  isPermissionStatus,
  normalizePermissionState,
  PERMISSION_STATUSES,
} from './permissionState';

describe('permission state', () => {
  test('recognizes normalized statuses', () => {
    for (const status of PERMISSION_STATUSES) {
      expect(isPermissionStatus(status)).toBe(true);
    }

    expect(isPermissionStatus('prompt')).toBe(false);
  });

  test('derives granted from status', () => {
    expect(
      createPermissionState({
        permission: Permission.Camera,
        status: 'granted',
      }).granted,
    ).toBe(true);

    expect(
      createPermissionState({
        permission: Permission.Camera,
        status: 'denied',
      }).granted,
    ).toBe(false);
  });

  test('normalizes adapter results to the requested permission', () => {
    const state = normalizePermissionState(Permission.Camera, {
      permission: Permission.Microphone,
      status: 'limited',
      granted: false,
      canAskAgain: true,
      reason: 'library-limited',
    });

    expect(state).toEqual({
      permission: Permission.Camera,
      status: 'limited',
      granted: false,
      canAskAgain: true,
      requestedAt: undefined,
      reason: 'library-limited',
    });
  });
});
