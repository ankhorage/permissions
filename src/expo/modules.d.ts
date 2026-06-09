interface ExpoPermissionResult {
  status: string;
  canAskAgain: boolean;
}

declare module 'expo-camera' {
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
  export function getPermissionsAsync(): Promise<ExpoPermissionResult>;
  export function requestPermissionsAsync(): Promise<ExpoPermissionResult>;
}

declare module 'expo-audio' {
  export const Audio: {
    getPermissionsAsync(): Promise<ExpoPermissionResult>;
    requestPermissionsAsync(): Promise<ExpoPermissionResult>;
  };
}

declare module 'expo-notifications' {
  export function getPermissionsAsync(): Promise<ExpoPermissionResult>;
  export function requestPermissionsAsync(): Promise<ExpoPermissionResult>;
}
