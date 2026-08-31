import type { PermissionClient } from '../client/types';
import { assertKnownPermission, Permission } from '../registry/permissions';
import { createPermissionState, type PermissionState } from '../state/permissionState';
import {
  type BrowserPermissionState,
  formatErrorName,
  type NotificationPermissionState,
  stateFromBrowserPermission,
  stateFromMediaError,
  stateFromNotificationPermission,
  unavailable,
} from './permissionStates';

type BrowserPermissionName = 'camera' | 'microphone' | 'geolocation' | 'notifications';
interface BrowserPermissionStatus {
  readonly state: BrowserPermissionState;
}

interface BrowserPermissions {
  query(descriptor: { readonly name: BrowserPermissionName }): Promise<BrowserPermissionStatus>;
}

interface MediaStreamTrackLike {
  stop(): void;
}

interface MediaStreamLike {
  getTracks(): readonly MediaStreamTrackLike[];
}

interface MediaDevicesLike {
  getUserMedia(constraints: {
    readonly audio?: boolean;
    readonly video?: boolean;
  }): Promise<MediaStreamLike>;
}

interface GeolocationLike {
  getCurrentPosition(
    success: () => void,
    error: () => void,
    options?: {
      readonly maximumAge?: number;
      readonly timeout?: number;
    },
  ): void;
}

interface NavigatorLike {
  readonly permissions?: BrowserPermissions;
  readonly mediaDevices?: MediaDevicesLike;
  readonly geolocation?: GeolocationLike;
}

interface NotificationLike {
  readonly permission: NotificationPermissionState;
  requestPermission(): Promise<NotificationPermissionState> | NotificationPermissionState;
}

interface WebGlobalLike {
  readonly isSecureContext?: boolean;
  readonly navigator?: NavigatorLike;
  readonly Notification?: NotificationLike;
}

/***
 * Options for the browser permission adapter.
 */
export interface WebPermissionClientOptions {
  readonly global?: WebGlobalLike;
}

/***
 * Creates a browser permission client using guarded structural globals.
 *
 * @readme
 * Unsupported web APIs resolve to `status: 'unavailable'`. The adapter does not
 * import DOM types and does not assume it is running in a browser.
 */
export function createWebPermissionClient(
  options: WebPermissionClientOptions = {},
): PermissionClient {
  const global = options.global ?? getDefaultGlobal();

  return {
    async getStatus(permission) {
      const knownPermission = assertKnownPermission(permission);

      switch (knownPermission) {
        case Permission.Notifications:
          return getNotificationStatus(knownPermission, global);
        case Permission.LocationForeground:
          return getPermissionApiStatus(
            knownPermission,
            global,
            'geolocation',
            'Geolocation is unavailable in this environment.',
          );
        case Permission.Camera:
          return getMediaStatus(knownPermission, global, 'camera');
        case Permission.Microphone:
          return getMediaStatus(knownPermission, global, 'microphone');
        default:
          return unavailable(
            knownPermission,
            'This permission is not supported by the web adapter.',
          );
      }
    },

    async request(permission) {
      const knownPermission = assertKnownPermission(permission);

      switch (knownPermission) {
        case Permission.Notifications:
          return requestNotifications(knownPermission, global);
        case Permission.LocationForeground:
          return requestGeolocation(knownPermission, global);
        case Permission.Camera:
          return requestMedia(knownPermission, global, { video: true });
        case Permission.Microphone:
          return requestMedia(knownPermission, global, { audio: true });
        default:
          return unavailable(
            knownPermission,
            'This permission is not supported by the web adapter.',
          );
      }
    },
  };
}

function getDefaultGlobal(): WebGlobalLike {
  return globalThis as WebGlobalLike;
}

function getNotificationStatus(permission: Permission, global: WebGlobalLike): PermissionState {
  if (global.Notification === undefined) {
    return unavailable(permission, 'Notification API is unavailable.');
  }

  return stateFromNotificationPermission(permission, global.Notification.permission);
}

async function requestNotifications(
  permission: Permission,
  global: WebGlobalLike,
): Promise<PermissionState> {
  if (global.Notification === undefined) {
    return unavailable(permission, 'Notification API is unavailable.');
  }

  try {
    const result = await global.Notification.requestPermission();

    return stateFromNotificationPermission(permission, result);
  } catch (error) {
    return unavailable(
      permission,
      `Notification permission request failed${formatErrorName(error)}.`,
    );
  }
}

async function getPermissionApiStatus(
  permission: Permission,
  global: WebGlobalLike,
  name: BrowserPermissionName,
  unavailableReason: string,
): Promise<PermissionState> {
  if (global.navigator?.permissions === undefined) {
    return unavailable(permission, unavailableReason);
  }

  try {
    const status = await global.navigator.permissions.query({ name });

    return stateFromBrowserPermission(permission, status.state);
  } catch {
    return unavailable(permission, unavailableReason);
  }
}

async function getMediaStatus(
  permission: Permission,
  global: WebGlobalLike,
  name: BrowserPermissionName,
): Promise<PermissionState> {
  if (global.navigator?.permissions !== undefined) {
    try {
      const status = await global.navigator.permissions.query({ name });

      return stateFromBrowserPermission(permission, status.state);
    } catch {
      return getMediaAvailability(permission, global);
    }
  }

  return getMediaAvailability(permission, global);
}

function getMediaAvailability(permission: Permission, global: WebGlobalLike): PermissionState {
  if (global.isSecureContext === false) {
    return createPermissionState({
      permission,
      status: 'blocked',
      canAskAgain: false,
      reason: 'Media permissions require a secure context.',
    });
  }

  if (global.navigator?.mediaDevices?.getUserMedia === undefined) {
    return unavailable(permission, 'Media devices API is unavailable.');
  }

  return createPermissionState({
    permission,
    status: 'unknown',
    canAskAgain: true,
  });
}

async function requestGeolocation(
  permission: Permission,
  global: WebGlobalLike,
): Promise<PermissionState> {
  if (global.isSecureContext === false) {
    return createPermissionState({
      permission,
      status: 'blocked',
      canAskAgain: false,
      reason: 'Geolocation requires a secure context.',
    });
  }

  if (global.navigator?.geolocation === undefined) {
    return unavailable(permission, 'Geolocation API is unavailable.');
  }

  return new Promise((resolve) => {
    global.navigator?.geolocation?.getCurrentPosition(
      () => {
        resolve(
          createPermissionState({
            permission,
            status: 'granted',
            canAskAgain: true,
            requestedAt: new Date(),
          }),
        );
      },
      () => {
        resolve(
          createPermissionState({
            permission,
            status: 'denied',
            canAskAgain: false,
            requestedAt: new Date(),
          }),
        );
      },
      { maximumAge: 0 },
    );
  });
}

async function requestMedia(
  permission: Permission,
  global: WebGlobalLike,
  constraints: {
    readonly audio?: boolean;
    readonly video?: boolean;
  },
): Promise<PermissionState> {
  const availability = getMediaAvailability(permission, global);

  if (availability.status !== 'unknown') {
    return availability;
  }

  try {
    const stream = await global.navigator?.mediaDevices?.getUserMedia(constraints);

    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }

    return createPermissionState({
      permission,
      status: 'granted',
      canAskAgain: true,
      requestedAt: new Date(),
    });
  } catch (error) {
    return stateFromMediaError(permission, error);
  }
}
