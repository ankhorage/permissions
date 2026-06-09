import { describe, expect, it, mock } from 'bun:test';

import { Permission } from '../registry/permissions';
import { createPermissionClient } from './client';

// Mocks using bun:mock
void mock.module('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
    requestCameraPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
  },
}));

void mock.module('expo-media-library', () => ({
  getPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
  requestPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
}));

void mock.module('expo-audio', () => ({
  Audio: {
    getPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
    requestPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
  },
}));

void mock.module('expo-location', () => ({
  getForegroundPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
  requestForegroundPermissionsAsync: () =>
    Promise.resolve({ status: 'granted', canAskAgain: true }),
  getBackgroundPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
  requestBackgroundPermissionsAsync: () =>
    Promise.resolve({ status: 'granted', canAskAgain: true }),
}));

void mock.module('expo-notifications', () => ({
  getPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
  requestPermissionsAsync: () => Promise.resolve({ status: 'granted', canAskAgain: true }),
}));

describe('Expo Permission Client', () => {
  const client = createPermissionClient();

  it('should handle Camera', async () => {
    const state = await client.getStatus(Permission.Camera);
    expect(state.status).toBe('granted');
  });

  it('should handle MediaLibrary', async () => {
    const state = await client.getStatus(Permission.MediaLibrary);
    expect(state.status).toBe('granted');
  });

  it('should handle Microphone', async () => {
    const state = await client.getStatus(Permission.Microphone);
    expect(state.status).toBe('granted');
  });

  it('should handle LocationForeground', async () => {
    const state = await client.getStatus(Permission.LocationForeground);
    expect(state.status).toBe('granted');
  });

  it('should handle Notifications', async () => {
    const state = await client.getStatus(Permission.Notifications);
    expect(state.status).toBe('granted');
  });

  it('should handle Clipboard', async () => {
    const state = await client.getStatus(Permission.Clipboard);
    expect(state.status).toBe('granted');
  });
});
