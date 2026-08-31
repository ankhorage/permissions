import type { PermissionClient } from '../client/types';
import type { Permission } from '../registry/permissions';
import { assertKnownPermission, PERMISSIONS } from '../registry/permissions';
import {
  createPermissionState,
  type PermissionState,
  type PermissionStatus,
} from '../state/permissionState';

/***
 * Seed format accepted by the fake client.
 */
export type FakePermissionStateSeed =
  | PermissionState
  | {
      readonly permission: Permission;
      readonly status: PermissionStatus;
      readonly canAskAgain?: boolean;
      readonly reason?: string;
    };

/***
 * Options for deterministic fake clients.
 */
export interface FakePermissionClientOptions {
  readonly initialStates?: readonly FakePermissionStateSeed[];
  readonly requestStates?: readonly FakePermissionStateSeed[];
  readonly now?: () => Date;
  readonly openSettings?: () => Promise<void>;
}

/***
 * Test client that stores permission states in memory.
 */
export interface FakePermissionClient extends PermissionClient {
  setState(state: FakePermissionStateSeed): void;
  setStatus(
    permission: Permission,
    status: PermissionStatus,
    options?: {
      readonly canAskAgain?: boolean;
      readonly reason?: string;
    },
  ): void;
  getSnapshot(): readonly PermissionState[];
}

interface FakePermissionContext {
  readonly now: () => Date;
  readonly requestStates: Map<Permission, PermissionState>;
  readonly states: Map<Permission, PermissionState>;
}

/***
 * Creates a deterministic in-memory client for tests and examples.
 *
 * @readme
 * Fake clients make permission flows testable without native devices, browser
 * prompts, simulators, or network access.
 */
export function createFakePermissionClient(
  options: FakePermissionClientOptions = {},
): FakePermissionClient {
  const context = createFakePermissionContext(options);
  const client = createFakePermissionOperations(context, options.openSettings);
  if (options.openSettings === undefined) delete client.openSettings;
  return client;
}

function createFakePermissionContext(options: FakePermissionClientOptions): FakePermissionContext {
  const context: FakePermissionContext = {
    now: options.now ?? (() => new Date()),
    states: new Map<Permission, PermissionState>(),
    requestStates: new Map<Permission, PermissionState>(),
  };

  for (const permission of PERMISSIONS) {
    context.states.set(
      permission,
      createPermissionState({
        permission,
        status: 'unknown',
        canAskAgain: true,
      }),
    );
  }

  for (const state of options.initialStates ?? []) {
    context.states.set(state.permission, normalizeSeed(state));
  }

  for (const state of options.requestStates ?? []) {
    context.requestStates.set(state.permission, normalizeSeed(state));
  }
  return context;
}

function createFakePermissionOperations(
  context: FakePermissionContext,
  openSettings: (() => Promise<void>) | undefined,
): FakePermissionClient {
  const client: FakePermissionClient = {
    getStatus(permission) {
      return Promise.resolve(getStoredState(context.states, assertKnownPermission(permission)));
    },
    request(permission) {
      const knownPermission = assertKnownPermission(permission);
      const requestState =
        context.requestStates.get(knownPermission) ??
        getStoredState(context.states, knownPermission);
      const nextState = createPermissionState({
        permission: knownPermission,
        status: requestState.status,
        canAskAgain: requestState.canAskAgain,
        requestedAt: context.now(),
        reason: requestState.reason,
      });

      context.states.set(knownPermission, nextState);
      return Promise.resolve(nextState);
    },
    openSettings,
    setState(state) {
      const normalizedState = normalizeSeed(state);
      context.states.set(normalizedState.permission, normalizedState);
    },
    setStatus(permission, status, statusOptions = {}) {
      const knownPermission = assertKnownPermission(permission);
      context.states.set(
        knownPermission,
        createPermissionState({
          permission: knownPermission,
          status,
          canAskAgain: statusOptions.canAskAgain,
          reason: statusOptions.reason,
        }),
      );
    },
    getSnapshot() {
      return PERMISSIONS.map((permission) => getStoredState(context.states, permission));
    },
  };
  return client;
}

function normalizeSeed(seed: FakePermissionStateSeed): PermissionState {
  return createPermissionState({
    permission: assertKnownPermission(seed.permission),
    status: seed.status,
    canAskAgain: seed.canAskAgain,
    requestedAt: 'requestedAt' in seed ? seed.requestedAt : undefined,
    reason: seed.reason,
  });
}

function getStoredState(
  states: ReadonlyMap<Permission, PermissionState>,
  permission: Permission,
): PermissionState {
  const state = states.get(permission);

  if (state === undefined) {
    return createPermissionState({
      permission,
      status: 'unknown',
      canAskAgain: true,
    });
  }

  return state;
}
