import type { Permission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';
import {
  createExpoNotificationPermissionState,
  createExpoUnavailableState,
} from '../permissionResponse';

export const notificationsAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-notifications');
      const result = await mod.getPermissionsAsync();

      return createExpoNotificationPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },

  async request(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-notifications');
      const result = await mod.requestPermissionsAsync();

      return createExpoNotificationPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },
};
