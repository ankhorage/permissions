import type { Permission } from '../registry/permissions';
import type { PermissionState } from '../state/permissionState';

export interface ExpoPermissionAdapter {
  getStatus(permission: Permission): Promise<PermissionState>;
  request(permission: Permission): Promise<PermissionState>;
}
