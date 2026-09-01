import { expect, test } from 'bun:test';

import { Permission } from '../registry/permissions';
import { createFakePermissionClient } from '../testing/index';
import { createPermissionManager } from './createPermissionManager';

test('normalizes getStatus results', async () => {
  const manager = createPermissionManager(
    createFakePermissionClient({
      initialStates: [
        {
          permission: Permission.Camera,
          status: 'granted',
        },
      ],
    }),
  );

  const state = await manager.getStatus(Permission.Camera);

  expect(state).toMatchObject({
    permission: Permission.Camera,
    status: 'granted',
    granted: true,
  });
});

test('does not throw for normal denial', async () => {
  const manager = createPermissionManager(
    createFakePermissionClient({
      requestStates: [
        {
          permission: Permission.Notifications,
          status: 'denied',
          canAskAgain: false,
        },
      ],
    }),
  );

  const state = await manager.request(Permission.Notifications);

  expect(state).toMatchObject({
    status: 'denied',
    granted: false,
    canAskAgain: false,
  });
});

test('exposes openSettings only when the client supports it', async () => {
  let opened = false;
  const manager = createPermissionManager(
    createFakePermissionClient({
      openSettings: () => {
        opened = true;

        return Promise.resolve();
      },
    }),
  );

  await manager.openSettings?.();

  expect(opened).toBe(true);
});
