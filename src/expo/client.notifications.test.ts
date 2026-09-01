import { beforeEach, expect, test } from 'bun:test';

import { Permission } from '../registry/permissions';
import { createPermissionClient } from './client';
import {
  audioMock,
  cameraMock,
  linkingMock,
  type MockPermissionResponse,
  notificationsMock,
  resetExpoMocks,
} from './client.testSupport';

const IOS_AUTHORIZATION_CASES = [
  [0, true, 'unknown', false, 'iOS notification authorization has not been determined.'],
  [1, true, 'denied', false, 'iOS notification authorization is denied.'],
  [1, false, 'blocked', false, 'Permission is blocked. Open system settings to change it.'],
  [2, false, 'granted', true, undefined],
  [3, false, 'limited', true, 'iOS notification authorization is provisional.'],
  [4, false, 'limited', true, 'iOS notification authorization is ephemeral.'],
] as const;

beforeEach(resetExpoMocks);

test('Expo client uses granular iOS notification authorization', async () => {
  const client = createPermissionClient();
  for (const [iosStatus, canAskAgain, status, granted, reason] of IOS_AUTHORIZATION_CASES) {
    const response: MockPermissionResponse = {
      status: iosStatus === 2 ? 'denied' : 'granted',
      canAskAgain,
      ios: { status: iosStatus },
    };
    notificationsMock.getResponse = response;
    notificationsMock.requestResponse = response;
    for (const state of [
      await client.getStatus(Permission.Notifications),
      await client.request(Permission.Notifications),
    ]) {
      expect(state).toMatchObject({
        permission: Permission.Notifications,
        status,
        granted,
        canAskAgain,
        reason,
      });
    }
  }
});

test('Expo client opens native application settings', async () => {
  const client = createPermissionClient();
  if (client.openSettings === undefined) throw new Error('Expected openSettings.');
  await client.openSettings();
  expect(linkingMock.calls).toBe(1);
});

test('Expo client preserves the native settings failure cause', async () => {
  const cause = new Error('native settings unavailable');
  linkingMock.error = cause;
  const error = await captureOpenSettingsErrorAsync();
  expect(error.message).toBe('Unable to open application settings.');
  expect(error.cause).toBe(cause);
});

test('Expo client uses the stable settings error on web', async () => {
  const cause = new Error('openSettings is unavailable on web');
  cause.name = 'UnavailabilityError';
  linkingMock.error = cause;
  const error = await captureOpenSettingsErrorAsync();
  expect(error.message).toBe('Unable to open application settings.');
  expect(error.cause).toBe(cause);
});

test('Expo client returns unavailable when a camera call fails', async () => {
  cameraMock.getError = 'camera bridge unavailable';
  const state = await createPermissionClient().getStatus(Permission.Camera);
  expect(state).toMatchObject({
    permission: Permission.Camera,
    status: 'unavailable',
    granted: false,
    reason: 'camera bridge unavailable',
  });
});

test('Expo client returns unavailable when an audio request fails', async () => {
  audioMock.requestError = 'microphone bridge unavailable';
  const state = await createPermissionClient().request(Permission.Microphone);
  expect(state).toMatchObject({
    permission: Permission.Microphone,
    status: 'unavailable',
    granted: false,
    reason: 'microphone bridge unavailable',
  });
});

async function captureOpenSettingsErrorAsync(): Promise<Error> {
  const client = createPermissionClient();
  if (client.openSettings === undefined) throw new Error('Expected openSettings.');
  try {
    await client.openSettings();
  } catch (error) {
    if (error instanceof Error) return error;
    throw new Error('Opening settings must reject with an Error.', { cause: error });
  }
  throw new Error('Opening settings must reject.');
}
