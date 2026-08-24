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
  readonly accessPrivileges?: string;
  readonly ios?: {
    readonly status?: number;
  };
}

export type ExpoPermissionMethod = () => Promise<ExpoPermissionResponse>;

export function createExpoPermissionState(
  permission: Permission,
  response: ExpoPermissionResponse,
): PermissionState {
  const status = isPermissionStatus(response.status) ? response.status : 'unknown';

  return createNormalizedExpoPermissionState(permission, response, status);
}

export function createExpoMediaLibraryPermissionState(
  permission: Permission,
  response: ExpoPermissionResponse,
): PermissionState {
  if (response.accessPrivileges !== 'limited') {
    return createExpoPermissionState(permission, response);
  }

  return createPermissionState({
    permission,
    status: 'limited',
    canAskAgain: response.canAskAgain,
    reason: 'Media library access is limited to user-selected assets.',
  });
}

export function createExpoNotificationPermissionState(
  permission: Permission,
  response: ExpoPermissionResponse,
): PermissionState {
  switch (response.ios?.status) {
    case 0:
      return createNormalizedExpoPermissionState(
        permission,
        response,
        'unknown',
        'iOS notification authorization has not been determined.',
      );
    case 1:
      return createNormalizedExpoPermissionState(
        permission,
        response,
        'denied',
        'iOS notification authorization is denied.',
      );
    case 2:
      return createNormalizedExpoPermissionState(permission, response, 'granted');
    case 3:
      return createNormalizedExpoPermissionState(
        permission,
        response,
        'limited',
        'iOS notification authorization is provisional.',
      );
    case 4:
      return createNormalizedExpoPermissionState(
        permission,
        response,
        'limited',
        'iOS notification authorization is ephemeral.',
      );
    default:
      return createExpoPermissionState(permission, response);
  }
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
