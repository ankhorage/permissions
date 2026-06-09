import { Permission } from '../registry/permissions';

export type PermissionSupport =
  | 'supported'
  | 'notRequired'
  | 'limited'
  | 'notImplemented'
  | 'unsupported';

export interface ExpoPermissionMetadata {
  readonly support: PermissionSupport;
  readonly requiredPackages: readonly string[];
  readonly configHints: readonly string[];
}

export const EXPO_PERMISSION_SUPPORT: Readonly<Record<Permission, ExpoPermissionMetadata>> = {
  [Permission.Camera]: {
    support: 'supported',
    requiredPackages: ['expo-camera'],
    configHints: ['cameraPermission'],
  },
  [Permission.Microphone]: {
    support: 'supported',
    requiredPackages: ['expo-audio'],
    configHints: ['microphonePermission', 'recordAudioAndroid'],
  },
  [Permission.MediaLibrary]: {
    support: 'supported',
    requiredPackages: ['expo-media-library'],
    configHints: ['mediaLibraryPermission'],
  },
  [Permission.MediaLibraryWrite]: {
    support: 'supported',
    requiredPackages: ['expo-media-library'],
    configHints: ['mediaLibraryPermission'],
  },
  [Permission.LocationForeground]: {
    support: 'supported',
    requiredPackages: ['expo-location'],
    configHints: ['locationWhenInUsePermission'],
  },
  [Permission.LocationBackground]: {
    support: 'supported',
    requiredPackages: ['expo-location'],
    configHints: ['locationAlwaysAndWhenInUsePermission'],
  },
  [Permission.Notifications]: {
    support: 'supported',
    requiredPackages: ['expo-notifications'],
    configHints: ['notificationsPermission'],
  },
  [Permission.Clipboard]: {
    support: 'notRequired', // Or 'unsupported' depending on target flow.
    requiredPackages: ['expo-clipboard'],
    configHints: [],
  },
};
