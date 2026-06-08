import { describe, expect, test } from 'bun:test';

import {
  getPermissionDefinition,
  isPermission,
  Permission,
  PERMISSION_REGISTRY,
  PERMISSIONS,
} from './permissions';

describe('permission registry', () => {
  test('contains the initial stable permissions', () => {
    expect(PERMISSIONS).toEqual([
      Permission.Camera,
      Permission.Microphone,
      Permission.MediaLibrary,
      Permission.MediaLibraryWrite,
      Permission.LocationForeground,
      Permission.LocationBackground,
      Permission.Notifications,
      Permission.Clipboard,
    ]);
  });

  test('exposes metadata for every permission', () => {
    for (const permission of PERMISSIONS) {
      expect(PERMISSION_REGISTRY[permission].permission).toBe(permission);
      expect(PERMISSION_REGISTRY[permission].label.length).toBeGreaterThan(0);
      expect(getPermissionDefinition(permission)).toEqual(PERMISSION_REGISTRY[permission]);
    }
  });

  test('validates permission strings', () => {
    expect(isPermission('camera')).toBe(true);
    expect(isPermission('not-a-permission')).toBe(false);
  });
});
