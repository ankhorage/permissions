import type { Permission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';
import {
  createExpoPermissionState,
  createExpoUnavailableState,
  type ExpoPermissionMethod,
  findExpoPermissionMethod,
} from '../permissionResponse';

const CAMERA_PERMISSION_CONTAINER_NAMES = ['CameraNativeModule', 'Camera'] as const;

export const cameraAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const result = await resolveCameraPermissionMethod(
        await import('expo-camera'),
        'getCameraPermissionsAsync',
      )();

      return createExpoPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },

  async request(permission: Permission): Promise<PermissionState> {
    try {
      const result = await resolveCameraPermissionMethod(
        await import('expo-camera'),
        'requestCameraPermissionsAsync',
      )();

      return createExpoPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },
};

function resolveCameraPermissionMethod(
  source: unknown,
  methodName: 'getCameraPermissionsAsync' | 'requestCameraPermissionsAsync',
): ExpoPermissionMethod {
  const method = findExpoPermissionMethod(source, methodName, CAMERA_PERMISSION_CONTAINER_NAMES);

  if (method === undefined) {
    throw new Error(`expo-camera does not export ${methodName}.`);
  }

  return method;
}
