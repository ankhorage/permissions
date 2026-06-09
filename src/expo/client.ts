import type { PermissionClient } from '../client/types';
import { Permission } from '../registry/permissions';
import type { PermissionState } from '../state/permissionState';
import { cameraAdapter } from './adapters/camera';
import { clipboardAdapter } from './adapters/clipboard';
import { locationAdapter } from './adapters/location';
import { mediaLibraryAdapter } from './adapters/mediaLibrary';
import { microphoneAdapter } from './adapters/microphone';
import { notificationsAdapter } from './adapters/notifications';
import { EXPO_PERMISSION_SUPPORT } from './manifest';

// Interface for per-permission Expo adapters
export interface ExpoPermissionAdapter {
  getStatus(permission: Permission): Promise<PermissionState>;
  request(permission: Permission): Promise<PermissionState>;
}

// Map of permissions to their corresponding adapters
const adapters: Partial<Record<Permission, ExpoPermissionAdapter>> = {
  [Permission.Camera]: cameraAdapter,
  [Permission.MediaLibrary]: mediaLibraryAdapter,
  [Permission.MediaLibraryWrite]: mediaLibraryAdapter,
  [Permission.Microphone]: microphoneAdapter,
  [Permission.LocationForeground]: locationAdapter,
  [Permission.LocationBackground]: locationAdapter,
  [Permission.Notifications]: notificationsAdapter,
  [Permission.Clipboard]: clipboardAdapter,
};

export function createPermissionClient(): PermissionClient {
  return {
    async getStatus(permission: Permission): Promise<PermissionState> {
      const metadata = EXPO_PERMISSION_SUPPORT[permission];
      if (metadata.support === 'unsupported' || metadata.support === 'notImplemented') {
        return {
          permission,
          status: 'unavailable',
          granted: false,
          reason: `Permission ${permission} is not implemented or supported on Expo.`,
        };
      }

      const adapter = adapters[permission];
      if (!adapter) {
        throw new Error(`No adapter registered for permission: ${permission}`);
      }

      return adapter.getStatus(permission);
    },

    async request(permission: Permission): Promise<PermissionState> {
      const metadata = EXPO_PERMISSION_SUPPORT[permission];
      if (metadata.support === 'unsupported' || metadata.support === 'notImplemented') {
        return {
          permission,
          status: 'unavailable',
          granted: false,
          reason: `Permission ${permission} is not implemented or supported on Expo.`,
        };
      }

      if (metadata.support === 'notRequired') {
        return {
          permission,
          status: 'granted',
          granted: true,
        };
      }

      const adapter = adapters[permission];
      if (!adapter) {
        throw new Error(`No adapter registered for permission: ${permission}`);
      }

      return adapter.request(permission);
    },
  };
}
