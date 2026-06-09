import type { Permission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import { isPermissionStatus } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';

// Define explicit interface for Expo Camera to satisfy linter
interface ExpoCameraModule {
  getCameraPermissionsAsync(): Promise<{ status: string; canAskAgain: boolean }>;
  requestCameraPermissionsAsync(): Promise<{ status: string; canAskAgain: boolean }>;
}

export const cameraAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const { Camera } = (await import('expo-camera')) as { Camera: ExpoCameraModule };
      const result = await Camera.getCameraPermissionsAsync();

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
      const { Camera } = (await import('expo-camera')) as { Camera: ExpoCameraModule };
      const result = await Camera.requestCameraPermissionsAsync();

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
