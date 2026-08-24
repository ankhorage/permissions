import type { Permission } from '../registry/permissions';

/***
 * Normalized permission statuses shared by adapters and UI code.
 *
 * Denial is normal control flow. Unexpected adapter failures may still throw,
 * but user denial should be represented as a permission state.
 */
export type PermissionStatus =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'limited'
  | 'unavailable';

/***
 * Stable ordered list of normalized statuses.
 */
export const PERMISSION_STATUSES = [
  'unknown',
  'granted',
  'denied',
  'blocked',
  'limited',
  'unavailable',
] as const satisfies readonly PermissionStatus[];

const PERMISSION_STATUS_SET = new Set<string>(PERMISSION_STATUSES);

/***
 * Normalized result returned by permission clients and managers.
 */
export interface PermissionState {
  readonly permission: Permission;
  readonly status: PermissionStatus;
  readonly canAskAgain?: boolean;
  readonly granted: boolean;
  readonly requestedAt?: Date;
  readonly reason?: string;
}

export interface CreatePermissionStateInput {
  readonly permission: Permission;
  readonly status: PermissionStatus;
  readonly canAskAgain?: boolean;
  readonly requestedAt?: Date;
  readonly reason?: string;
}

/***
 * Returns true when a string is one of the normalized statuses.
 */
export function isPermissionStatus(value: string): value is PermissionStatus {
  return PERMISSION_STATUS_SET.has(value);
}

/***
 * Creates a normalized state and derives the `granted` convenience flag.
 * Limited access is usable partial authorization, so both `granted` and
 * `limited` states set `granted` to true.
 */
export function createPermissionState(input: CreatePermissionStateInput): PermissionState {
  return {
    permission: input.permission,
    status: input.status,
    canAskAgain: input.canAskAgain,
    granted: input.status === 'granted' || input.status === 'limited',
    requestedAt: input.requestedAt,
    reason: input.reason,
  };
}

/***
 * Normalizes an adapter result to the requested permission and status shape.
 */
export function normalizePermissionState(
  permission: Permission,
  state: PermissionState,
): PermissionState {
  return createPermissionState({
    permission,
    status: state.status,
    canAskAgain: state.canAskAgain,
    requestedAt: state.requestedAt,
    reason: state.reason,
  });
}
