import type { Permission } from '../registry/permissions';
import {
  createPermissionState,
  type PermissionState,
  type PermissionStatus,
} from '../state/permissionState';

export type BrowserPermissionState = 'granted' | 'denied' | 'prompt';
export type NotificationPermissionState = 'default' | 'denied' | 'granted';

export function stateFromMediaError(permission: Permission, error: unknown): PermissionState {
  const errorName = getErrorName(error);
  const unavailableErrorNames = new Set([
    'AbortError',
    'NotFoundError',
    'NotReadableError',
    'OverconstrainedError',
    'SecurityError',
  ]);
  if (errorName !== undefined && unavailableErrorNames.has(errorName)) {
    return createPermissionState({
      permission,
      status: 'unavailable',
      canAskAgain: false,
      requestedAt: new Date(),
      reason: `Media permission request failed: ${errorName}.`,
    });
  }
  return createPermissionState({
    permission,
    status: 'denied',
    canAskAgain: false,
    requestedAt: new Date(),
    reason:
      errorName === undefined
        ? 'Media permission request was denied.'
        : `Media permission request was denied: ${errorName}.`,
  });
}

export function stateFromNotificationPermission(
  permission: Permission,
  status: NotificationPermissionState,
): PermissionState {
  if (status === 'granted') {
    return createPermissionState({ permission, status: 'granted', canAskAgain: true });
  }
  if (status === 'denied') {
    return createPermissionState({ permission, status: 'denied', canAskAgain: false });
  }
  return createPermissionState({ permission, status: 'unknown', canAskAgain: true });
}

export function stateFromBrowserPermission(
  permission: Permission,
  status: BrowserPermissionState,
): PermissionState {
  const normalizedStatus: PermissionStatus = status === 'prompt' ? 'unknown' : status;
  return createPermissionState({
    permission,
    status: normalizedStatus,
    canAskAgain: status === 'prompt' || status === 'granted',
  });
}

export function unavailable(permission: Permission, reason: string): PermissionState {
  return createPermissionState({
    permission,
    status: 'unavailable',
    canAskAgain: false,
    reason,
  });
}

export function formatErrorName(error: unknown): string {
  const errorName = getErrorName(error);
  return errorName === undefined ? '' : `: ${errorName}`;
}

function getErrorName(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('name' in error)) return undefined;
  return typeof error.name === 'string' && error.name.length > 0 ? error.name : undefined;
}
