import type { Permission } from '../../registry/permissions';
import { Permission as KnownPermission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';
import {
  createExpoMediaLibraryPermissionState,
  createExpoUnavailableState,
} from '../permissionResponse';

export const mediaLibraryAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-media-library');
      const result = await mod.getPermissionsAsync(isWriteOnlyPermission(permission));

      return createExpoMediaLibraryPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },

  async request(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-media-library');
      const result = await mod.requestPermissionsAsync(isWriteOnlyPermission(permission));

      return createExpoMediaLibraryPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },
};

function isWriteOnlyPermission(permission: Permission): boolean {
  return permission === KnownPermission.MediaLibraryWrite;
}
