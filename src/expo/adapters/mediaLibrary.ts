import type { Permission } from '../../registry/permissions';
import { Permission as KnownPermission } from '../../registry/permissions';
import { createPermissionState, type PermissionState } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';
import {
  createExpoPermissionState,
  createExpoUnavailableState,
  type ExpoPermissionResponse,
} from '../permissionResponse';

interface ExpoMediaLibraryPermissionResponse extends ExpoPermissionResponse {
  readonly accessPrivileges?: 'all' | 'limited' | 'none';
}

export const mediaLibraryAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-media-library');
      const result = await mod.getPermissionsAsync(isWriteOnlyPermission(permission));

      return createMediaLibraryPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },

  async request(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-media-library');
      const result = await mod.requestPermissionsAsync(isWriteOnlyPermission(permission));

      return createMediaLibraryPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },
};

function createMediaLibraryPermissionState(
  permission: Permission,
  response: ExpoMediaLibraryPermissionResponse,
): PermissionState {
  if (response.accessPrivileges !== 'limited') {
    return createExpoPermissionState(permission, response);
  }

  return createPermissionState({
    permission,
    status: 'limited',
    canAskAgain: response.canAskAgain,
    reason: 'Media library access is limited to user-selected assets.',
  });
}

function isWriteOnlyPermission(permission: Permission): boolean {
  return permission === KnownPermission.MediaLibraryWrite;
}
