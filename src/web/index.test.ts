import { describe, expect, test } from 'bun:test';

import { Permission } from '../registry/permissions';
import { createWebPermissionClient, type WebPermissionClientOptions } from './index';

describe('createWebPermissionClient', () => {
  test('returns unavailable for unsupported web permissions', async () => {
    const client = createWebPermissionClient({ global: {} });

    const state = await client.getStatus(Permission.MediaLibrary);

    expect(state).toMatchObject({
      status: 'unavailable',
      canAskAgain: false,
    });
  });

  test('reads notification permission structurally', async () => {
    const client = createWebPermissionClient({
      global: {
        Notification: {
          permission: 'granted',
          requestPermission: () => 'granted',
        },
      },
    });

    const state = await client.getStatus(Permission.Notifications);

    expect(state).toMatchObject({
      status: 'granted',
      granted: true,
    });
  });

  test('requests notifications without throwing on denial', async () => {
    const client = createWebPermissionClient({
      global: {
        Notification: {
          permission: 'default',
          requestPermission: () => Promise.resolve('denied'),
        },
      },
    });

    const state = await client.request(Permission.Notifications);

    expect(state).toMatchObject({
      status: 'denied',
      granted: false,
    });
  });

  test('uses Permissions API for location status when available', async () => {
    const client = createWebPermissionClient({
      global: {
        navigator: {
          permissions: {
            query: () => Promise.resolve({ state: 'prompt' }),
          },
        },
      },
    });

    const state = await client.getStatus(Permission.LocationForeground);

    expect(state).toMatchObject({
      status: 'unknown',
      canAskAgain: true,
    });
  });

  test('returns blocked for media in insecure contexts', async () => {
    const client = createWebPermissionClient({
      global: {
        isSecureContext: false,
      },
    });

    const state = await client.getStatus(Permission.Camera);

    expect(state).toMatchObject({
      status: 'blocked',
      canAskAgain: false,
    });
  });

  test('requests media with getUserMedia and stops tracks', async () => {
    let stopped = false;
    const global: WebPermissionClientOptions['global'] = {
      navigator: {
        mediaDevices: {
          getUserMedia: () =>
            Promise.resolve({
              getTracks: () => [
                {
                  stop: () => {
                    stopped = true;
                  },
                },
              ],
            }),
        },
      },
    };
    const client = createWebPermissionClient({ global });

    const state = await client.request(Permission.Microphone);

    expect(state).toMatchObject({
      status: 'granted',
      granted: true,
    });
    expect(stopped).toBe(true);
  });
});
