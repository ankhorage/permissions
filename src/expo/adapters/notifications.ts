import type { Permission } from '../../registry/permissions';
import { createPermissionState, type PermissionState } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';
import {
  createExpoPermissionState,
  createExpoUnavailableState,
  type ExpoPermissionResponse,
} from '../permissionResponse';

interface ExpoNotificationPermissionResponse extends ExpoPermissionResponse {
  readonly ios?: {
    readonly status?: number;
  };
}

export const notificationsAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-notifications');
      const result = await mod.getPermissionsAsync();

      return createNotificationPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },

  async request(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-notifications');
      const result = await mod.requestPermissionsAsync();

      return createNotificationPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },
};

function createNotificationPermissionState(
  permission: Permission,
  response: ExpoNotificationPermissionResponse,
): PermissionState {
  switch (response.ios?.status) {
    case 0:
      return createNotificationState(
        permission,
        response,
        'unknown',
        'iOS notification authorization has not been determined.',
      );
    case 1:
      return createNotificationState(
        permission,
        response,
        'denied',
        'iOS notification authorization is denied.',
      );
    case 2:
      return createNotificationState(permission, response, 'granted');
    case 3:
      return createNotificationState(
        permission,
        response,
        'limited',
        'iOS notification authorization is provisional.',
      );
    case 4:
      return createNotificationState(
        permission,
        response,
        'limited',
        'iOS notification authorization is ephemeral.',
      );
    default:
      return createExpoPermissionState(permission, response);
  }
}

function createNotificationState(
  permission: Permission,
  response: ExpoNotificationPermissionResponse,
  status: PermissionState['status'],
  reason?: string,
): PermissionState {
  const state = createExpoPermissionState(permission, {
    status,
    canAskAgain: response.canAskAgain,
  });

  return createPermissionState({
    permission,
    status: state.status,
    canAskAgain: state.canAskAgain,
    reason: state.reason ?? reason,
  });
}
