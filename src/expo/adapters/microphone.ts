import type { Permission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import { isPermissionStatus } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';

interface ExpoPermissionResult {
  status: string;
  canAskAgain: boolean;
}

interface ExpoAudioModule {
  Audio: {
    getPermissionsAsync(): Promise<ExpoPermissionResult>;
    requestPermissionsAsync(): Promise<ExpoPermissionResult>;
  };
}

export const microphoneAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const mod = (await import('expo-audio')) as ExpoAudioModule;
      const result = await mod.Audio.getPermissionsAsync();
      const status = isPermissionStatus(result.status) ? result.status : 'unknown';

      return {
        permission,
        status,
        granted: status === 'granted',
        canAskAgain: result.canAskAgain,
      };
    } catch (error) {
      return {
        permission,
        status: 'unavailable',
        granted: false,
        reason: (error as Error).message,
      };
    }
  },

  async request(permission: Permission): Promise<PermissionState> {
    try {
      const mod = (await import('expo-audio')) as ExpoAudioModule;
      const result = await mod.Audio.requestPermissionsAsync();
      const status = isPermissionStatus(result.status) ? result.status : 'unknown';

      return {
        permission,
        status,
        granted: status === 'granted',
        canAskAgain: result.canAskAgain,
      };
    } catch (error) {
      return {
        permission,
        status: 'unavailable',
        granted: false,
        reason: (error as Error).message,
      };
    }
  },
};
