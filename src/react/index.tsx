import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { PermissionClient } from '../client/types';
import {
  createPermissionManager,
  type PermissionManager,
} from '../manager/createPermissionManager';
import type { Permission } from '../registry/permissions';
import {
  createPermissionState,
  normalizePermissionState,
  type PermissionState,
  type PermissionStatus,
} from '../state/permissionState';

const PermissionsContext = createContext<PermissionManager | undefined>(undefined);

/***
 * Props accepted by `PermissionsProvider`.
 */
export interface PermissionsProviderProps {
  readonly children: ReactNode;
  readonly client?: PermissionClient;
  readonly manager?: PermissionManager;
}

/***
 * Options for `usePermission`.
 */
export interface UsePermissionOptions {
  readonly initialState?: PermissionState;
  readonly refreshOnMount?: boolean;
}

/***
 * Result returned by `usePermission`.
 */
export interface PermissionHookResult {
  readonly permission: Permission;
  readonly status: PermissionStatus;
  readonly canAskAgain?: boolean;
  readonly granted: boolean;
  readonly requestedAt?: Date;
  readonly reason?: string;
  readonly state: PermissionState;
  readonly refresh: () => Promise<PermissionState>;
  readonly request: () => Promise<PermissionState>;
  readonly openSettings?: () => Promise<void>;
}

/***
 * Provides a permission manager to React hooks.
 *
 * @readme
 * React helpers are framework-neutral. They depend on React only and do not
 * import browser, Expo, or React Native permission APIs.
 */
export function PermissionsProvider({
  children,
  client,
  manager,
}: PermissionsProviderProps): ReactNode {
  const resolvedManager = useMemo(() => {
    if (manager !== undefined) {
      return manager;
    }

    if (client !== undefined) {
      return createPermissionManager(client);
    }

    throw new Error('PermissionsProvider requires a client or manager.');
  }, [client, manager]);

  return createElement(PermissionsContext.Provider, { value: resolvedManager }, children);
}

/***
 * Reads the current permission manager from context.
 */
export function usePermissions(): PermissionManager {
  const manager = useContext(PermissionsContext);

  if (manager === undefined) {
    throw new Error('usePermissions must be used within PermissionsProvider.');
  }

  return manager;
}

/***
 * Tracks a single permission and exposes explicit refresh/request actions.
 *
 * @usage
 * ```tsx
 * const camera = usePermission(Permission.Camera, { refreshOnMount: true });
 *
 * return (
 *   <Button
 *     disabled={camera.granted}
 *     onPress={() => {
 *       void camera.request();
 *     }}
 *   />
 * );
 * ```
 */
export function usePermission(
  permission: Permission,
  options: UsePermissionOptions = {},
): PermissionHookResult {
  const manager = usePermissions();
  const [state, setState] = useState<PermissionState>(
    () =>
      (options.initialState === undefined
        ? undefined
        : normalizePermissionState(permission, options.initialState)) ??
      createPermissionState({
        permission,
        status: 'unknown',
      }),
  );

  const refresh = useCallback(async () => {
    const nextState = await manager.getStatus(permission);
    setState(nextState);

    return nextState;
  }, [manager, permission]);

  const request = useCallback(async () => {
    const nextState = await manager.request(permission);
    setState(nextState);

    return nextState;
  }, [manager, permission]);

  useEffect(() => {
    if (options.refreshOnMount === true) {
      void refresh();
    }
  }, [options.refreshOnMount, refresh]);

  const openSettings =
    manager.openSettings === undefined
      ? undefined
      : () => manager.openSettings?.() ?? Promise.resolve();

  return {
    permission: state.permission,
    status: state.status,
    canAskAgain: state.canAskAgain,
    granted: state.granted,
    requestedAt: state.requestedAt,
    reason: state.reason,
    state,
    refresh,
    request,
    openSettings,
  };
}
