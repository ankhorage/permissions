import type { Permission } from '../registry/permissions';
import type { PermissionState } from '../state/permissionState';

/***
 * Adapter-neutral interface for runtime permission checks and requests.
 *
 * @usage
 * ```ts
 * const state = await client.getStatus(Permission.Camera);
 * if (!state.granted) {
 *   await client.request(Permission.Camera);
 * }
 * ```
 */
export interface PermissionClient {
  getStatus(permission: Permission): Promise<PermissionState>;
  request(permission: Permission): Promise<PermissionState>;
  openSettings?(): Promise<void>;
}
