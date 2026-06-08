/***
 * Common runtime permissions supported by the registry.
 *
 * @readme
 * The registry is intentionally platform-neutral. Adapters translate each
 * permission into whatever a browser, React Native app, Expo app, or test
 * environment can actually check or request.
 */
export enum Permission {
  Camera = 'camera',
  Microphone = 'microphone',
  MediaLibrary = 'mediaLibrary',
  MediaLibraryWrite = 'mediaLibraryWrite',
  LocationForeground = 'locationForeground',
  LocationBackground = 'locationBackground',
  Notifications = 'notifications',
  Clipboard = 'clipboard',
}

/***
 * Broad environment categories where a permission can be meaningful.
 */
export type PermissionEnvironment = 'web' | 'native' | 'test';

/***
 * Describes a known permission without coupling the registry to a platform SDK.
 */
export interface PermissionDefinition {
  readonly permission: Permission;
  readonly label: string;
  readonly description: string;
  readonly environments: readonly PermissionEnvironment[];
}

/***
 * Stable ordered list of known permissions.
 */
export const PERMISSIONS = [
  Permission.Camera,
  Permission.Microphone,
  Permission.MediaLibrary,
  Permission.MediaLibraryWrite,
  Permission.LocationForeground,
  Permission.LocationBackground,
  Permission.Notifications,
  Permission.Clipboard,
] as const;

const PERMISSION_SET = new Set<string>(PERMISSIONS);

/***
 * Metadata for known permissions.
 */
export const PERMISSION_REGISTRY: Readonly<Record<Permission, PermissionDefinition>> = {
  [Permission.Camera]: {
    permission: Permission.Camera,
    label: 'Camera',
    description: 'Access to a device camera for capture or scanning workflows.',
    environments: ['web', 'native', 'test'],
  },
  [Permission.Microphone]: {
    permission: Permission.Microphone,
    label: 'Microphone',
    description: 'Access to a device microphone for audio recording or calls.',
    environments: ['web', 'native', 'test'],
  },
  [Permission.MediaLibrary]: {
    permission: Permission.MediaLibrary,
    label: 'Media library',
    description: 'Read access to photos, videos, or other local media assets.',
    environments: ['native', 'test'],
  },
  [Permission.MediaLibraryWrite]: {
    permission: Permission.MediaLibraryWrite,
    label: 'Media library write',
    description: 'Write access for saving media to a local library.',
    environments: ['native', 'test'],
  },
  [Permission.LocationForeground]: {
    permission: Permission.LocationForeground,
    label: 'Foreground location',
    description: 'Location access while the app or page is actively in use.',
    environments: ['web', 'native', 'test'],
  },
  [Permission.LocationBackground]: {
    permission: Permission.LocationBackground,
    label: 'Background location',
    description: 'Location access while the app is not actively in use.',
    environments: ['native', 'test'],
  },
  [Permission.Notifications]: {
    permission: Permission.Notifications,
    label: 'Notifications',
    description: 'Permission to show user-visible notifications.',
    environments: ['web', 'native', 'test'],
  },
  [Permission.Clipboard]: {
    permission: Permission.Clipboard,
    label: 'Clipboard',
    description: 'Read or write access to clipboard contents.',
    environments: ['web', 'native', 'test'],
  },
};

/***
 * Returns true when a string is a registered permission identifier.
 */
export function isPermission(value: string): value is Permission {
  return PERMISSION_SET.has(value);
}

/***
 * Throws for programmer errors where an invalid permission reaches runtime.
 */
export function assertKnownPermission(permission: string): Permission {
  if (!isPermission(permission)) {
    throw new TypeError(`Unknown permission: ${permission}`);
  }

  return permission;
}

/***
 * Reads registry metadata for a known permission.
 */
export function getPermissionDefinition(permission: Permission): PermissionDefinition {
  return PERMISSION_REGISTRY[assertKnownPermission(permission)];
}
