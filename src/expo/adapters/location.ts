import { Permission } from '../../registry/permissions';
import type { PermissionState } from '../../state/permissionState';
import type { ExpoPermissionAdapter } from '../client';
import { createExpoPermissionState, createExpoUnavailableState } from '../permissionResponse';

export const locationAdapter: ExpoPermissionAdapter = {
  async getStatus(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-location');
      const isBackground = permission === Permission.LocationBackground;
      const result = isBackground
        ? await mod.getBackgroundPermissionsAsync()
        : await mod.getForegroundPermissionsAsync();

      return createExpoPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },

  async request(permission: Permission): Promise<PermissionState> {
    try {
      const mod = await import('expo-location');
      const isBackground = permission === Permission.LocationBackground;
      const result = isBackground
        ? await mod.requestBackgroundPermissionsAsync()
        : await mod.requestForegroundPermissionsAsync();

      return createExpoPermissionState(permission, result);
    } catch (error) {
      return createExpoUnavailableState(permission, error);
    }
  },
};
