import type { PermissionClient } from '../client/types';
import { assertKnownPermission, type Permission } from '../registry/permissions';
import { normalizePermissionState, type PermissionState } from '../state/permissionState';

/***
 * Public manager returned by `createPermissionManager`.
 */
export interface PermissionManager {
  getStatus(permission: Permission): Promise<PermissionState>;
  request(permission: Permission): Promise<PermissionState>;
  openSettings?(): Promise<void>;
}

/***
 * Wraps a client with registry validation and normalized results.
 *
 * @readme
 * Runtime permissions and build-time native configuration are separate concerns.
 * This manager checks or requests permissions through a client, but it does not
 * generate iOS usage descriptions, Android manifest entries, or Expo config
 * plugins.
 *
 * @usage
 * ```ts
 * const permissions = createPermissionManager(client);
 * const camera = await permissions.getStatus(Permission.Camera);
 * const requested = camera.granted
 *   ? camera
 *   : await permissions.request(Permission.Camera);
 * ```
 */
export function createPermissionManager(client: PermissionClient): PermissionManager {
  const manager: PermissionManager = {
    async getStatus(permission) {
      const knownPermission = assertKnownPermission(permission);
      const state = await client.getStatus(knownPermission);

      return normalizePermissionState(knownPermission, state);
    },

    async request(permission) {
      const knownPermission = assertKnownPermission(permission);
      const state = await client.request(knownPermission);

      return normalizePermissionState(knownPermission, state);
    },
  };

  if (client.openSettings !== undefined) {
    manager.openSettings = () => client.openSettings?.() ?? Promise.resolve();
  }

  return manager;
}
