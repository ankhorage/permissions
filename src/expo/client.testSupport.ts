import { mock } from 'bun:test';

export interface MockPermissionResponse {
  readonly status: string;
  readonly canAskAgain?: boolean;
  readonly accessPrivileges?: 'all' | 'limited' | 'none';
  readonly ios?: { readonly status?: number };
}

type CameraMockMode = 'topLevel' | 'cameraNamespace' | 'missingExports';
type AudioMockMode = 'topLevel' | 'audioModule' | 'missingExports';

export function permissionResponse(status: string, canAskAgain = true): MockPermissionResponse {
  return { status, canAskAgain };
}

export const cameraMock = {
  mode: 'topLevel' as CameraMockMode,
  getResponse: permissionResponse('granted'),
  requestResponse: permissionResponse('granted'),
  getError: undefined as string | undefined,
  requestError: undefined as string | undefined,
};
export const audioMock = {
  mode: 'topLevel' as AudioMockMode,
  getResponse: permissionResponse('granted'),
  requestResponse: permissionResponse('granted'),
  getError: undefined as string | undefined,
  requestError: undefined as string | undefined,
};
export const mediaLibraryMock = {
  getResponse: permissionResponse('granted'),
  requestResponse: permissionResponse('granted'),
  getError: undefined as string | undefined,
  requestError: undefined as string | undefined,
  getCalls: [] as boolean[],
  requestCalls: [] as boolean[],
};
export const locationMock = {
  foregroundGetResponse: permissionResponse('granted'),
  foregroundRequestResponse: permissionResponse('granted'),
  backgroundGetResponse: permissionResponse('granted'),
  backgroundRequestResponse: permissionResponse('granted'),
  getCalls: [] as string[],
  requestCalls: [] as string[],
};
export const notificationsMock = {
  getResponse: permissionResponse('granted'),
  requestResponse: permissionResponse('granted'),
  getError: undefined as string | undefined,
  requestError: undefined as string | undefined,
};
export const linkingMock = { calls: 0, error: undefined as Error | undefined };

void mock.module('expo-camera', () => ({
  get getCameraPermissionsAsync() {
    if (cameraMock.mode !== 'topLevel') return undefined;
    return () => {
      if (cameraMock.getError !== undefined) throw new Error(cameraMock.getError);
      return Promise.resolve(cameraMock.getResponse);
    };
  },
  get requestCameraPermissionsAsync() {
    if (cameraMock.mode !== 'topLevel') return undefined;
    return () => {
      if (cameraMock.requestError !== undefined) throw new Error(cameraMock.requestError);
      return Promise.resolve(cameraMock.requestResponse);
    };
  },
  get Camera() {
    if (cameraMock.mode !== 'cameraNamespace') return undefined;
    return {
      getCameraPermissionsAsync: () => Promise.resolve(cameraMock.getResponse),
      requestCameraPermissionsAsync: () => Promise.resolve(cameraMock.requestResponse),
    };
  },
}));

void mock.module('expo-audio', () => ({
  get getRecordingPermissionsAsync() {
    if (audioMock.mode !== 'topLevel') return undefined;
    return () => {
      if (audioMock.getError !== undefined) throw new Error(audioMock.getError);
      return Promise.resolve(audioMock.getResponse);
    };
  },
  get requestRecordingPermissionsAsync() {
    if (audioMock.mode !== 'topLevel') return undefined;
    return () => {
      if (audioMock.requestError !== undefined) throw new Error(audioMock.requestError);
      return Promise.resolve(audioMock.requestResponse);
    };
  },
  get AudioModule() {
    if (audioMock.mode !== 'audioModule') return undefined;
    return {
      getRecordingPermissionsAsync: () => Promise.resolve(audioMock.getResponse),
      requestRecordingPermissionsAsync: () => Promise.resolve(audioMock.requestResponse),
    };
  },
}));

void mock.module('expo-media-library', () => ({
  getPermissionsAsync: (writeOnly?: boolean) => {
    mediaLibraryMock.getCalls.push(writeOnly === true);
    if (mediaLibraryMock.getError !== undefined) throw new Error(mediaLibraryMock.getError);
    return Promise.resolve(mediaLibraryMock.getResponse);
  },
  requestPermissionsAsync: (writeOnly?: boolean) => {
    mediaLibraryMock.requestCalls.push(writeOnly === true);
    if (mediaLibraryMock.requestError !== undefined) throw new Error(mediaLibraryMock.requestError);
    return Promise.resolve(mediaLibraryMock.requestResponse);
  },
}));

void mock.module('expo-location', () => ({
  getForegroundPermissionsAsync: () => {
    locationMock.getCalls.push('foreground');
    return Promise.resolve(locationMock.foregroundGetResponse);
  },
  requestForegroundPermissionsAsync: () => {
    locationMock.requestCalls.push('foreground');
    return Promise.resolve(locationMock.foregroundRequestResponse);
  },
  getBackgroundPermissionsAsync: () => {
    locationMock.getCalls.push('background');
    return Promise.resolve(locationMock.backgroundGetResponse);
  },
  requestBackgroundPermissionsAsync: () => {
    locationMock.requestCalls.push('background');
    return Promise.resolve(locationMock.backgroundRequestResponse);
  },
}));

void mock.module('expo-notifications', () => ({
  getPermissionsAsync: () => {
    if (notificationsMock.getError !== undefined) throw new Error(notificationsMock.getError);
    return Promise.resolve(notificationsMock.getResponse);
  },
  requestPermissionsAsync: () => {
    if (notificationsMock.requestError !== undefined)
      throw new Error(notificationsMock.requestError);
    return Promise.resolve(notificationsMock.requestResponse);
  },
}));

void mock.module('expo-linking', () => ({
  openSettings: () => {
    linkingMock.calls += 1;
    if (linkingMock.error !== undefined) throw linkingMock.error;
    return Promise.resolve();
  },
}));

export function resetExpoMocks(): void {
  cameraMock.mode = 'topLevel';
  cameraMock.getResponse = permissionResponse('granted');
  cameraMock.requestResponse = permissionResponse('granted');
  cameraMock.getError = undefined;
  cameraMock.requestError = undefined;
  audioMock.mode = 'topLevel';
  audioMock.getResponse = permissionResponse('granted');
  audioMock.requestResponse = permissionResponse('granted');
  audioMock.getError = undefined;
  audioMock.requestError = undefined;
  resetCollectionMocks();
  notificationsMock.getResponse = permissionResponse('granted');
  notificationsMock.requestResponse = permissionResponse('granted');
  notificationsMock.getError = undefined;
  notificationsMock.requestError = undefined;
  linkingMock.calls = 0;
  linkingMock.error = undefined;
}

function resetCollectionMocks(): void {
  mediaLibraryMock.getResponse = permissionResponse('granted');
  mediaLibraryMock.requestResponse = permissionResponse('granted');
  mediaLibraryMock.getError = undefined;
  mediaLibraryMock.requestError = undefined;
  mediaLibraryMock.getCalls.length = 0;
  mediaLibraryMock.requestCalls.length = 0;
  locationMock.foregroundGetResponse = permissionResponse('granted');
  locationMock.foregroundRequestResponse = permissionResponse('granted');
  locationMock.backgroundGetResponse = permissionResponse('granted');
  locationMock.backgroundRequestResponse = permissionResponse('granted');
  locationMock.getCalls.length = 0;
  locationMock.requestCalls.length = 0;
}
