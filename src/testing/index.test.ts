import { describe, expect, test } from 'bun:test';

import { Permission, PERMISSIONS } from '../registry/permissions';
import { createFakePermissionClient } from './index';

describe('createFakePermissionClient', () => {
  test('defaults every permission to unknown', async () => {
    const client = createFakePermissionClient();

    expect(client.getSnapshot()).toHaveLength(PERMISSIONS.length);
    const state = await client.getStatus(Permission.Camera);

    expect(state).toMatchObject({
      status: 'unknown',
      granted: false,
      canAskAgain: true,
    });
  });

  test('stores status updates', async () => {
    const client = createFakePermissionClient();

    client.setStatus(Permission.Clipboard, 'blocked', {
      canAskAgain: false,
      reason: 'policy',
    });

    const state = await client.getStatus(Permission.Clipboard);

    expect(state).toMatchObject({
      status: 'blocked',
      canAskAgain: false,
      reason: 'policy',
    });
  });

  test('uses deterministic request results and clock', async () => {
    const requestedAt = new Date('2026-06-08T12:00:00.000Z');
    const client = createFakePermissionClient({
      now: () => requestedAt,
      requestStates: [
        {
          permission: Permission.Camera,
          status: 'granted',
        },
      ],
    });

    const result = await client.request(Permission.Camera);

    expect(result).toMatchObject({
      status: 'granted',
      granted: true,
      requestedAt,
    });
  });
});
