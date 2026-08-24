import type { Permission } from '../registry/permissions';
import {
  createPermissionState,
  isPermissionStatus,
  type PermissionState,
  type PermissionStatus,
} from '../state/permissionState';

export interface ExpoPermissionResponse {
  readonly status: string;
  readonly canAskAgain?: boolean;
}

export type ExpoPermissionMethod = () => Promise<ExpoPermissionResponse>;

export function createExpoPermissionState(
  permission: Permission,
  response: ExpoPermissionResponse,
): PermissionState {
  const status = isPermissionStatus(response.status) ? response.status : 'unknown';

  return createNormalizedExpoPermissionState(permission, response, status);
}

export function createExpoUnavailableState(
  permission: Permission,
  error: unknown,
): PermissionState {
  return createPermissionState({
    permission,
    status: 'unavailable',
    reason: getExpoPermissionErrorMessage(error),
  });
}

export function findExpoPermissionMethod(
  source: unknown,
  methodName: string,
  containerNames: readonly string[] = [],
): ExpoPermissionMethod | undefined {
  if (hasExpoPermissionMethod(source, methodName)) {
    return source[methodName];
  }

  if (!isRecord(source)) {
    return undefined;
  }

  for (const containerName of containerNames) {
    const container = source[containerName];

    if (hasExpoPermissionMethod(container, methodName)) {
      return container[methodName];
    }
  }

  return undefined;
}

function getExpoPermissionErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.length > 0) {
    return error;
  }

  return 'Expo permission operation failed.';
}

function createNormalizedExpoPermissionState(
  permission: Permission,
  response: ExpoPermissionResponse,
  status: PermissionStatus,
  reason?: string,
): PermissionState {
  const normalizedStatus =
    status === 'denied' && response.canAskAgain === false ? 'blocked' : status;

  return createPermissionState({
    permission,
    status: normalizedStatus,
    canAskAgain: response.canAskAgain,
    reason:
      normalizedStatus === 'blocked'
        ? 'Permission is blocked. Open system settings to change it.'
        : reason,
  });
}

function hasExpoPermissionMethod(
  value: unknown,
  methodName: string,
): value is Record<string, ExpoPermissionMethod> {
  return isRecord(value) && typeof value[methodName] === 'function';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
