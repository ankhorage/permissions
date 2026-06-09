import type { PermissionClient } from '../client/types';
import { Permission } from '../registry/permissions';
import { createPermissionState, type PermissionState } from '../state/permissionState';
import { cameraAdapter } from './adapters/camera';
import { locationAdapter } from './adapters/location';
import { mediaLibraryAdapter } from './adapters/mediaLibrary';
import { microphoneAdapter } from './adapters/microphone';
import { notificationsAdapter } from './adapters/notifications';
import { EXPO_PERMISSION_SUPPORT } from './manifest';

export interface ExpoPermissionAdapter {
  getStatus(permission: Permission): Promise<PermissionState>;
  request(permission: Permission): Promise<PermissionState>;
}

const adapters: Partial<Record<Permission, ExpoPermissionAdapter>> = {
  [Permission.Camera]: cameraAdapter,
  [Permission.MediaLibrary]: mediaLibraryAdapter,
  [Permission.MediaLibraryWrite]: mediaLibraryAdapter,
  [Permission.Microphone]: microphoneAdapter,
  [Permission.LocationForeground]: locationAdapter,
  [Permission.LocationBackground]: locationAdapter,
  [Permission.Notifications]: notificationsAdapter,
};

export function createPermissionClient(): PermissionClient {
  return {
    async getStatus(permission: Permission): Promise<PermissionState> {
      const metadata = EXPO_PERMISSION_SUPPORT[permission];
      if (metadata.support === 'unsupported' || metadata.support === 'notImplemented') {
        return createUnavailableSupportState(permission);
      }

      if (metadata.support === 'notRequired') {
        return createNotRequiredState(permission);
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
        return createUnavailableSupportState(permission);
      }

      if (metadata.support === 'notRequired') {
        return createNotRequiredState(permission);
      }

      const adapter = adapters[permission];
      if (!adapter) {
        throw new Error(`No adapter registered for permission: ${permission}`);
      }

      return adapter.request(permission);
    },
  };
}

function createUnavailableSupportState(permission: Permission): PermissionState {
  return createPermissionState({
    permission,
    status: 'unavailable',
    reason: `Permission ${permission} is not implemented or supported on Expo.`,
  });
}

function createNotRequiredState(permission: Permission): PermissionState {
  return createPermissionState({
    permission,
    status: 'granted',
  });
}
