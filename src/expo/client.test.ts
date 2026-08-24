import { beforeEach, describe, expect, mock, test } from 'bun:test';

import { Permission, PERMISSIONS } from '../registry/permissions';
import { createPermissionClient } from './client';

interface MockPermissionResponse {
  readonly status: string;
  readonly canAskAgain?: boolean;
  readonly accessPrivileges?: 'all' | 'limited' | 'none';
  readonly ios?: {
    readonly status?: number;
  };
}

type CameraMockMode = 'topLevel' | 'cameraNamespace' | 'missingExports';
type AudioMockMode = 'topLevel' | 'audioModule' | 'missingExports';

function permissionResponse(status: string, canAskAgain = true): MockPermissionResponse {
  return { status, canAskAgain };
}

const cameraMock = {
  mode: 'topLevel' as CameraMockMode,
  getResponse: permissionResponse('granted'),
  requestResponse: permissionResponse('granted'),
  getError: undefined as string | undefined,
  requestError: undefined as string | undefined,
};

const audioMock = {
  mode: 'topLevel' as AudioMockMode,
  getResponse: permissionResponse('granted'),
  requestResponse: permissionResponse('granted'),
  getError: undefined as string | undefined,
  requestError: undefined as string | undefined,
};

const mediaLibraryMock = {
  getResponse: permissionResponse('granted'),
  requestResponse: permissionResponse('granted'),
  getError: undefined as string | undefined,
  requestError: undefined as string | undefined,
  getCalls: [] as boolean[],
  requestCalls: [] as boolean[],
};

const locationMock = {
  foregroundGetResponse: permissionResponse('granted'),
  foregroundRequestResponse: permissionResponse('granted'),
  backgroundGetResponse: permissionResponse('granted'),
  backgroundRequestResponse: permissionResponse('granted'),
  getCalls: [] as string[],
  requestCalls: [] as string[],
};

const notificationsMock = {
  getResponse: permissionResponse('granted'),
  requestResponse: permissionResponse('granted'),
  getError: undefined as string | undefined,
  requestError: undefined as string | undefined,
};

const linkingMock = {
  calls: 0,
  error: undefined as string | undefined,
};

void mock.module('expo-camera', () => ({
  get getCameraPermissionsAsync() {
    if (cameraMock.mode !== 'topLevel') {
      return undefined;
    }

    return () => {
      if (cameraMock.getError !== undefined) {
        throw new Error(cameraMock.getError);
      }

      return Promise.resolve(cameraMock.getResponse);
    };
  },
  get requestCameraPermissionsAsync() {
    if (cameraMock.mode !== 'topLevel') {
      return undefined;
    }

    return () => {
      if (cameraMock.requestError !== undefined) {
        throw new Error(cameraMock.requestError);
      }

      return Promise.resolve(cameraMock.requestResponse);
    };
  },
  get Camera() {
    if (cameraMock.mode !== 'cameraNamespace') {
      return undefined;
    }

    return {
      getCameraPermissionsAsync: () => Promise.resolve(cameraMock.getResponse),
      requestCameraPermissionsAsync: () => Promise.resolve(cameraMock.requestResponse),
    };
  },
}));

void mock.module('expo-audio', () => ({
  get getRecordingPermissionsAsync() {
    if (audioMock.mode !== 'topLevel') {
      return undefined;
    }

    return () => {
      if (audioMock.getError !== undefined) {
        throw new Error(audioMock.getError);
      }

      return Promise.resolve(audioMock.getResponse);
    };
  },
  get requestRecordingPermissionsAsync() {
    if (audioMock.mode !== 'topLevel') {
      return undefined;
    }

    return () => {
      if (audioMock.requestError !== undefined) {
        throw new Error(audioMock.requestError);
      }

      return Promise.resolve(audioMock.requestResponse);
    };
  },
  get AudioModule() {
    if (audioMock.mode !== 'audioModule') {
      return undefined;
    }

    return {
      getRecordingPermissionsAsync: () => Promise.resolve(audioMock.getResponse),
      requestRecordingPermissionsAsync: () => Promise.resolve(audioMock.requestResponse),
    };
  },
}));

void mock.module('expo-media-library', () => ({
  getPermissionsAsync: (writeOnly?: boolean) => {
    mediaLibraryMock.getCalls.push(writeOnly === true);

    if (mediaLibraryMock.getError !== undefined) {
      throw new Error(mediaLibraryMock.getError);
    }

    return Promise.resolve(mediaLibraryMock.getResponse);
  },
  requestPermissionsAsync: (writeOnly?: boolean) => {
    mediaLibraryMock.requestCalls.push(writeOnly === true);

    if (mediaLibraryMock.requestError !== undefined) {
      throw new Error(mediaLibraryMock.requestError);
    }

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
    if (notificationsMock.getError !== undefined) {
      throw new Error(notificationsMock.getError);
    }

    return Promise.resolve(notificationsMock.getResponse);
  },
  requestPermissionsAsync: () => {
    if (notificationsMock.requestError !== undefined) {
      throw new Error(notificationsMock.requestError);
    }

    return Promise.resolve(notificationsMock.requestResponse);
  },
}));

void mock.module('expo-linking', () => ({
  openSettings: () => {
    linkingMock.calls += 1;

    if (linkingMock.error !== undefined) {
      throw new Error(linkingMock.error);
    }

    return Promise.resolve();
  },
}));

describe('createPermissionClient', () => {
  beforeEach(() => {
    resetExpoMocks();
  });

  test('covers getStatus and request for every known permission', async () => {
    const client = createPermissionClient();

    for (const permission of PERMISSIONS) {
      const statusState = await client.getStatus(permission);
      const requestState = await client.request(permission);

      expect(statusState.permission).toBe(permission);
      expect(statusState.status).toBe('granted');
      expect(statusState.granted).toBe(true);

      expect(requestState.permission).toBe(permission);
      expect(requestState.status).toBe('granted');
      expect(requestState.granted).toBe(true);
    }

    expect(mediaLibraryMock.getCalls).toEqual([false, true]);
    expect(mediaLibraryMock.requestCalls).toEqual([false, true]);
    expect(locationMock.getCalls).toEqual(['foreground', 'background']);
    expect(locationMock.requestCalls).toEqual(['foreground', 'background']);
  });

  test('treats clipboard as not requiring a native Expo permission module', async () => {
    const client = createPermissionClient();

    const statusState = await client.getStatus(Permission.Clipboard);
    const requestState = await client.request(Permission.Clipboard);

    expect(statusState).toMatchObject({
      permission: Permission.Clipboard,
      status: 'granted',
      granted: true,
    });
    expect(requestState).toMatchObject({
      permission: Permission.Clipboard,
      status: 'granted',
      granted: true,
    });
  });

  test('falls back to the Camera namespace when camera permission functions are nested', async () => {
    cameraMock.mode = 'cameraNamespace';
    cameraMock.getResponse = permissionResponse('denied', false);
    cameraMock.requestResponse = permissionResponse('granted');

    const client = createPermissionClient();

    expect(await client.getStatus(Permission.Camera)).toMatchObject({
      permission: Permission.Camera,
      status: 'blocked',
      granted: false,
      canAskAgain: false,
      reason: 'Permission is blocked. Open system settings to change it.',
    });
    expect(await client.request(Permission.Camera)).toMatchObject({
      permission: Permission.Camera,
      status: 'granted',
      granted: true,
    });
  });

  test('falls back to AudioModule recording permission functions when top-level exports are absent', async () => {
    audioMock.mode = 'audioModule';
    audioMock.getResponse = permissionResponse('denied', false);
    audioMock.requestResponse = permissionResponse('granted');

    const client = createPermissionClient();

    expect(await client.getStatus(Permission.Microphone)).toMatchObject({
      permission: Permission.Microphone,
      status: 'blocked',
      granted: false,
      canAskAgain: false,
      reason: 'Permission is blocked. Open system settings to change it.',
    });
    expect(await client.request(Permission.Microphone)).toMatchObject({
      permission: Permission.Microphone,
      status: 'granted',
      granted: true,
    });
  });

  test('normalizes unknown adapter statuses to unknown', async () => {
    notificationsMock.getResponse = permissionResponse('mystery-status', false);
    notificationsMock.requestResponse = permissionResponse('denied', false);

    const client = createPermissionClient();
    const state = await client.getStatus(Permission.Notifications);

    expect(state).toMatchObject({
      permission: Permission.Notifications,
      status: 'unknown',
      granted: false,
      canAskAgain: false,
    });
  });

  test('normalizes non-requestable denials to blocked for getStatus and request', async () => {
    notificationsMock.getResponse = permissionResponse('denied', false);
    notificationsMock.requestResponse = permissionResponse('denied', false);

    const client = createPermissionClient();

    for (const state of [
      await client.getStatus(Permission.Notifications),
      await client.request(Permission.Notifications),
    ]) {
      expect(state).toMatchObject({
        permission: Permission.Notifications,
        status: 'blocked',
        granted: false,
        canAskAgain: false,
        reason: 'Permission is blocked. Open system settings to change it.',
      });
    }
  });

  test('normalizes limited media-library access as usable partial authorization', async () => {
    mediaLibraryMock.getResponse = {
      status: 'granted',
      canAskAgain: false,
      accessPrivileges: 'limited',
    };
    mediaLibraryMock.requestResponse = {
      status: 'granted',
      canAskAgain: false,
      accessPrivileges: 'limited',
    };

    const client = createPermissionClient();

    for (const state of [
      await client.getStatus(Permission.MediaLibrary),
      await client.request(Permission.MediaLibrary),
    ]) {
      expect(state).toMatchObject({
        permission: Permission.MediaLibrary,
        status: 'limited',
        granted: true,
        canAskAgain: false,
        reason: 'Media library access is limited to user-selected assets.',
      });
    }
  });

  test('uses granular iOS notification authorization for getStatus and request', async () => {
    const cases = [
      {
        iosStatus: 0,
        canAskAgain: true,
        expectedStatus: 'unknown',
        expectedGranted: false,
        expectedReason: 'iOS notification authorization has not been determined.',
      },
      {
        iosStatus: 1,
        canAskAgain: true,
        expectedStatus: 'denied',
        expectedGranted: false,
        expectedReason: 'iOS notification authorization is denied.',
      },
      {
        iosStatus: 1,
        canAskAgain: false,
        expectedStatus: 'blocked',
        expectedGranted: false,
        expectedReason: 'Permission is blocked. Open system settings to change it.',
      },
      {
        iosStatus: 2,
        canAskAgain: false,
        expectedStatus: 'granted',
        expectedGranted: true,
        expectedReason: undefined,
      },
      {
        iosStatus: 3,
        canAskAgain: false,
        expectedStatus: 'limited',
        expectedGranted: true,
        expectedReason: 'iOS notification authorization is provisional.',
      },
      {
        iosStatus: 4,
        canAskAgain: false,
        expectedStatus: 'limited',
        expectedGranted: true,
        expectedReason: 'iOS notification authorization is ephemeral.',
      },
    ] as const;

    const client = createPermissionClient();

    for (const testCase of cases) {
      const response: MockPermissionResponse = {
        status: testCase.iosStatus === 2 ? 'denied' : 'granted',
        canAskAgain: testCase.canAskAgain,
        ios: { status: testCase.iosStatus },
      };
      notificationsMock.getResponse = response;
      notificationsMock.requestResponse = response;

      for (const state of [
        await client.getStatus(Permission.Notifications),
        await client.request(Permission.Notifications),
      ]) {
        expect(state).toMatchObject({
          permission: Permission.Notifications,
          status: testCase.expectedStatus,
          granted: testCase.expectedGranted,
          canAskAgain: testCase.canAskAgain,
          reason: testCase.expectedReason,
        });
      }
    }
  });

  test('opens native application settings through Expo Linking', async () => {
    const client = createPermissionClient();

    if (client.openSettings === undefined) {
      throw new Error('Expo permission client must expose openSettings.');
    }

    await client.openSettings();

    expect(linkingMock.calls).toBe(1);
  });

  test('rejects with a stable error when Expo Linking cannot open settings', async () => {
    linkingMock.error = 'settings unavailable';
    const client = createPermissionClient();

    if (client.openSettings === undefined) {
      throw new Error('Expo permission client must expose openSettings.');
    }

    let caughtError: unknown;

    try {
      await client.openSettings();
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(Error);

    if (!(caughtError instanceof Error)) {
      throw new Error('Opening settings must reject with an Error instance.');
    }

    expect(caughtError.message).toBe('Unable to open application settings: settings unavailable');
  });

  test('returns unavailable when a camera permission call fails at runtime', async () => {
    cameraMock.getError = 'camera bridge unavailable';

    const client = createPermissionClient();
    const state = await client.getStatus(Permission.Camera);

    expect(state).toMatchObject({
      permission: Permission.Camera,
      status: 'unavailable',
      granted: false,
      reason: 'camera bridge unavailable',
    });
  });

  test('returns unavailable when a request call throws at runtime', async () => {
    audioMock.requestError = 'microphone bridge unavailable';

    const client = createPermissionClient();
    const state = await client.request(Permission.Microphone);

    expect(state).toMatchObject({
      permission: Permission.Microphone,
      status: 'unavailable',
      granted: false,
      reason: 'microphone bridge unavailable',
    });
  });
});

function resetExpoMocks(): void {
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

  notificationsMock.getResponse = permissionResponse('granted');
  notificationsMock.requestResponse = permissionResponse('granted');
  notificationsMock.getError = undefined;
  notificationsMock.requestError = undefined;

  linkingMock.calls = 0;
  linkingMock.error = undefined;
}
