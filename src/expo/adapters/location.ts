import { Permission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import { isPermissionStatus } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';

interface ExpoPermissionResult {
  status: string;
  canAskAgain: boolean;
}

interface ExpoLocationModule {
  getBackgroundPermissionsAsync(): Promise<ExpoPermissionResult>;
  getForegroundPermissionsAsync(): Promise<ExpoPermissionResult>;
  requestBackgroundPermissionsAsync(): Promise<ExpoPermissionResult>;
  requestForegroundPermissionsAsync(): Promise<ExpoPermissionResult>;
}

export const locationAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const mod = (await import('expo-location')) as ExpoLocationModule;
      const isBackground = permission === Permission.LocationBackground;
      const result = isBackground
        ? await mod.getBackgroundPermissionsAsync()
        : await mod.getForegroundPermissionsAsync();

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
      const mod = (await import('expo-location')) as ExpoLocationModule;
      const isBackground = permission === Permission.LocationBackground;
      const result = isBackground
        ? await mod.requestBackgroundPermissionsAsync()
        : await mod.requestForegroundPermissionsAsync();

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
