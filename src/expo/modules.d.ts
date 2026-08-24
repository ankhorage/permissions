interface ExpoPermissionResult {
  status: string;
  canAskAgain?: boolean;
}

interface ExpoMediaLibraryPermissionResult extends ExpoPermissionResult {
  accessPrivileges?: 'all' | 'limited' | 'none';
}

interface ExpoNotificationPermissionResult extends ExpoPermissionResult {
  ios?: {
    status?: number;
  };
}

declare module 'expo-linking' {
  export function openSettings(): Promise<void>;
}

declare module 'expo-camera' {
  export function getCameraPermissionsAsync(): Promise<ExpoPermissionResult>;
  export function requestCameraPermissionsAsync(): Promise<ExpoPermissionResult>;
  export const CameraNativeModule: {
    getCameraPermissionsAsync(): Promise<ExpoPermissionResult>;
    requestCameraPermissionsAsync(): Promise<ExpoPermissionResult>;
  };
  export const Camera: {
    getCameraPermissionsAsync(): Promise<ExpoPermissionResult>;
    requestCameraPermissionsAsync(): Promise<ExpoPermissionResult>;
  };
}

declare module 'expo-location' {
  export function getBackgroundPermissionsAsync(): Promise<ExpoPermissionResult>;
  export function getForegroundPermissionsAsync(): Promise<ExpoPermissionResult>;
  export function requestBackgroundPermissionsAsync(): Promise<ExpoPermissionResult>;
  export function requestForegroundPermissionsAsync(): Promise<ExpoPermissionResult>;
}

declare module 'expo-media-library' {
  export function getPermissionsAsync(
    writeOnly?: boolean,
    granularPermissions?: readonly string[],
  ): Promise<ExpoMediaLibraryPermissionResult>;
  export function requestPermissionsAsync(
    writeOnly?: boolean,
    granularPermissions?: readonly string[],
  ): Promise<ExpoMediaLibraryPermissionResult>;
}

declare module 'expo-audio' {
  export function getRecordingPermissionsAsync(): Promise<ExpoPermissionResult>;
  export function requestRecordingPermissionsAsync(): Promise<ExpoPermissionResult>;
  export const AudioModule: {
    getRecordingPermissionsAsync(): Promise<ExpoPermissionResult>;
    requestRecordingPermissionsAsync(): Promise<ExpoPermissionResult>;
  };
  export const Audio: {
    getRecordingPermissionsAsync(): Promise<ExpoPermissionResult>;
    requestRecordingPermissionsAsync(): Promise<ExpoPermissionResult>;
  };
}

declare module 'expo-notifications' {
  export function getPermissionsAsync(): Promise<ExpoNotificationPermissionResult>;
  export function requestPermissionsAsync(): Promise<ExpoNotificationPermissionResult>;
}
