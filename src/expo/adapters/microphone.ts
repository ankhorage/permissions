import type { Permission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';
import {
  createExpoPermissionState,
  createExpoUnavailableState,
  type ExpoPermissionMethod,
  findExpoPermissionMethod,
} from '../permissionResponse';

const AUDIO_PERMISSION_CONTAINER_NAMES = ['AudioModule', 'Audio'] as const;

export const microphoneAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const result = await resolveAudioPermissionMethod(
        await import('expo-audio'),
        'getRecordingPermissionsAsync',
      )();

      return createExpoPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },

  async request(permission: Permission): Promise<PermissionState> {
    try {
      const result = await resolveAudioPermissionMethod(
        await import('expo-audio'),
        'requestRecordingPermissionsAsync',
      )();

      return createExpoPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },
};

function resolveAudioPermissionMethod(
  source: unknown,
  methodName: 'getRecordingPermissionsAsync' | 'requestRecordingPermissionsAsync',
): ExpoPermissionMethod {
  const method = findExpoPermissionMethod(source, methodName, AUDIO_PERMISSION_CONTAINER_NAMES);

  if (method === undefined) {
    throw new Error(`expo-audio does not export ${methodName}.`);
  }

  return method;
}
