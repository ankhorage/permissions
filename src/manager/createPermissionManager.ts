import type { PermissionClient } from '../client/types';
import { assertKnownPermission, type Permission } from '../registry/permissions';
import { normalizePermissionState, type PermissionState } from '../state/permissionState';

/***
 * Public facade for checking and requesting normalized permission state.
 */
export interface PermissionManager {
  getStatus(permission: Permission): Promise<PermissionState>;
  request(permission: Permission): Promise<PermissionState>;
  openSettings?(): Promise<void>;
}

/***
 * Creates a permission manager from a runtime-specific client.
 *
 * @readme
 * The manager validates permission names and normalizes client results.
 * Native app configuration remains a separate build-time concern.
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
