import { beforeEach, expect, test } from 'bun:test';

import { Permission, PERMISSIONS } from '../registry/permissions';
import { createPermissionClient } from './client';
import {
  audioMock,
  cameraMock,
  locationMock,
  mediaLibraryMock,
  notificationsMock,
  permissionResponse,
  resetExpoMocks,
} from './client.testSupport';

beforeEach(resetExpoMocks);

test('Expo client covers getStatus and request for every known permission', async () => {
  const client = createPermissionClient();
  for (const permission of PERMISSIONS) {
    const statusState = await client.getStatus(permission);
    const requestState = await client.request(permission);
    expect(statusState).toMatchObject({ permission, status: 'granted', granted: true });
    expect(requestState).toMatchObject({ permission, status: 'granted', granted: true });
  }
  expect(mediaLibraryMock.getCalls).toEqual([false, true]);
  expect(mediaLibraryMock.requestCalls).toEqual([false, true]);
  expect(locationMock.getCalls).toEqual(['foreground', 'background']);
  expect(locationMock.requestCalls).toEqual(['foreground', 'background']);
});

test('Expo client treats clipboard as not requiring a native module', async () => {
  const client = createPermissionClient();
  expect(await client.getStatus(Permission.Clipboard)).toMatchObject({
    permission: Permission.Clipboard,
    status: 'granted',
    granted: true,
  });
  expect(await client.request(Permission.Clipboard)).toMatchObject({
    permission: Permission.Clipboard,
    status: 'granted',
    granted: true,
  });
});

test('Expo client falls back to the Camera namespace', async () => {
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

test('Expo client falls back to AudioModule recording permissions', async () => {
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

test('Expo client normalizes unknown adapter statuses', async () => {
  notificationsMock.getResponse = permissionResponse('mystery-status', false);
  const state = await createPermissionClient().getStatus(Permission.Notifications);
  expect(state).toMatchObject({
    permission: Permission.Notifications,
    status: 'unknown',
    granted: false,
    canAskAgain: false,
  });
});

test('Expo client normalizes non-requestable denials to blocked', async () => {
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

test('Expo client normalizes limited media-library access', async () => {
  mediaLibraryMock.getResponse = {
    status: 'granted',
    canAskAgain: false,
    accessPrivileges: 'limited',
  };
  mediaLibraryMock.requestResponse = mediaLibraryMock.getResponse;
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
