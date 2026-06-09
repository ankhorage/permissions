import type { Permission } from '../registry/permissions';
import type { PermissionState } from '../state/permissionState';

/***
 * Adapter-neutral contract for checking and requesting permissions.
 *
 * Implementations provide permission state and permission requests for a runtime environment.
 */
export interface PermissionClient {
  getStatus(permission: Permission): Promise<PermissionState>;
  request(permission: Permission): Promise<PermissionState>;
  openSettings?(): Promise<void>;
}
