import type { Permission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';

export const clipboardAdapter: ExpoPermissionAdapter = {
  getStatus(_permission: Permission): Promise<PermissionState> {
    return Promise.resolve({
      permission: _permission,
      status: 'granted',
      granted: true,
    });
  },

  request(_permission: Permission): Promise<PermissionState> {
    return Promise.resolve({
      permission: _permission,
      status: 'granted',
      granted: true,
    });
  },
};
