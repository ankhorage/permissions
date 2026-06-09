# Public API

## assertKnownPermission

Kind: `function`
Module: `src/registry/permissions.ts`
Source: `src/registry/permissions.ts:115:1`

Throws for programmer errors where an invalid permission reaches runtime.

### Signatures

- `(permission: string) => Permission`
  - permission: `string`
  - returns: `Permission`

## createFakePermissionClient

Kind: `function`
Module: `src/testing/index.ts`
Source: `src/testing/index.ts:55:1`

Creates a deterministic in-memory client for tests and examples.

Fake clients make permission flows testable without native devices, browser
prompts, simulators, or network access.

### Signatures

- `(options?: FakePermissionClientOptions) => FakePermissionClient`
  - options: `FakePermissionClientOptions` (optional)
  - returns: `FakePermissionClient`

## createPermissionManager

Kind: `function`
Module: `src/manager/createPermissionManager.ts`
Source: `src/manager/createPermissionManager.ts:21:1`

Creates a permission manager from a runtime-specific client.

The manager validates permission names and normalizes client results.
Native app configuration remains a separate build-time concern.

### Signatures

- `(client: PermissionClient) => PermissionManager`
  - client: `PermissionClient`
  - returns: `PermissionManager`

## createPermissionState

Kind: `function`
Module: `src/state/permissionState.ts`
Source: `src/state/permissionState.ts:61:1`

Creates a normalized state and derives the `granted` convenience flag.

### Signatures

- `(input: CreatePermissionStateInput) => PermissionState`
  - input: `CreatePermissionStateInput`
  - returns: `PermissionState`

## createWebPermissionClient

Kind: `function`
Module: `src/web/index.ts`
Source: `src/web/index.ts:78:1`

Creates a browser permission client using guarded structural globals.

Unsupported web APIs resolve to `status: 'unavailable'`. The adapter does not
import DOM types and does not assume it is running in a browser.

### Signatures

- `(options?: WebPermissionClientOptions) => PermissionClient`
  - options: `WebPermissionClientOptions` (optional)
  - returns: `PermissionClient`

## FakePermissionClient

Kind: `type`
Module: `src/testing/index.ts`
Source: `src/testing/index.ts:35:1`

Test client that stores permission states in memory.

### Members

| Name         | Kind   | Type                                                                                                                                  | Required | Description |
| ------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| getSnapshot  | method | `() => readonly PermissionState[]`                                                                                                    | yes      |             |
| getStatus    | method | `(permission: Permission) => Promise<PermissionState>`                                                                                | yes      |             |
| openSettings | method | `(() => Promise<void>) \| undefined`                                                                                                  | no       |             |
| request      | method | `(permission: Permission) => Promise<PermissionState>`                                                                                | yes      |             |
| setState     | method | `(state: FakePermissionStateSeed) => void`                                                                                            | yes      |             |
| setStatus    | method | `(permission: Permission, status: PermissionStatus, options?: { readonly canAskAgain?: boolean; readonly reason?: string; }) => void` | yes      |             |

## FakePermissionClientOptions

Kind: `type`
Module: `src/testing/index.ts`
Source: `src/testing/index.ts:25:1`

Options for deterministic fake clients.

### Members

| Name          | Kind     | Type                                              | Required | Description |
| ------------- | -------- | ------------------------------------------------- | -------- | ----------- |
| initialStates | property | `readonly FakePermissionStateSeed[] \| undefined` | no       |             |
| now           | property | `(() => Date) \| undefined`                       | no       |             |
| openSettings  | property | `(() => Promise<void>) \| undefined`              | no       |             |
| requestStates | property | `readonly FakePermissionStateSeed[] \| undefined` | no       |             |

## FakePermissionStateSeed

Kind: `unknown`
Module: `src/testing/index.ts`
Source: `src/testing/index.ts:13:1`

Seed format accepted by the fake client.

## getPermissionDefinition

Kind: `function`
Module: `src/registry/permissions.ts`
Source: `src/registry/permissions.ts:126:1`

Reads registry metadata for a known permission.

### Signatures

- `(permission: Permission) => PermissionDefinition`
  - permission: `Permission`
  - returns: `PermissionDefinition`

## isPermission

Kind: `function`
Module: `src/registry/permissions.ts`
Source: `src/registry/permissions.ts:108:1`

Returns true when a string is a registered permission identifier.

### Signatures

- `(value: string) => boolean`
  - value: `string`
  - returns: `boolean`

## isPermissionStatus

Kind: `function`
Module: `src/state/permissionState.ts`
Source: `src/state/permissionState.ts:54:1`

Returns true when a string is one of the normalized statuses.

### Signatures

- `(value: string) => boolean`
  - value: `string`
  - returns: `boolean`

## normalizePermissionState

Kind: `function`
Module: `src/state/permissionState.ts`
Source: `src/state/permissionState.ts:75:1`

Normalizes an adapter result to the requested permission and status shape.

### Signatures

- `(permission: Permission, state: PermissionState) => PermissionState`
  - permission: `Permission`
  - state: `PermissionState`
  - returns: `PermissionState`

## Permission

Kind: `type`
Module: `src/registry/permissions.ts`
Source: `src/registry/permissions.ts:9:1`

Common runtime permissions supported by the registry.

The registry is intentionally platform-neutral. Adapters translate each
permission into whatever a browser, React Native app, Expo app, or test
environment can actually check or request.

## PERMISSION_REGISTRY

Kind: `value`
Module: `src/registry/permissions.ts`
Source: `src/registry/permissions.ts:54:14`

Metadata for known permissions.

## PERMISSION_STATUSES

Kind: `value`
Module: `src/state/permissionState.ts`
Source: `src/state/permissionState.ts:20:14`

Stable ordered list of normalized statuses.

## PermissionClient

Kind: `type`
Module: `src/client/types.ts`
Source: `src/client/types.ts:9:1`

Adapter-neutral contract for checking and requesting permissions.

Implementations provide permission state and permission requests for a runtime environment.

### Members

| Name         | Kind   | Type                                                   | Required | Description |
| ------------ | ------ | ------------------------------------------------------ | -------- | ----------- |
| getStatus    | method | `(permission: Permission) => Promise<PermissionState>` | yes      |             |
| openSettings | method | `(() => Promise<void>) \| undefined`                   | no       |             |
| request      | method | `(permission: Permission) => Promise<PermissionState>` | yes      |             |

## PermissionDefinition

Kind: `type`
Module: `src/registry/permissions.ts`
Source: `src/registry/permissions.ts:28:1`

Describes a known permission without coupling the registry to a platform SDK.

### Members

| Name         | Kind     | Type                               | Required | Description |
| ------------ | -------- | ---------------------------------- | -------- | ----------- |
| description  | property | `string`                           | yes      |             |
| environments | property | `readonly PermissionEnvironment[]` | yes      |             |
| label        | property | `string`                           | yes      |             |
| permission   | property | `Permission`                       | yes      |             |

## PermissionEnvironment

Kind: `unknown`
Module: `src/registry/permissions.ts`
Source: `src/registry/permissions.ts:23:1`

Broad environment categories where a permission can be meaningful.

## PermissionHookResult

Kind: `type`
Module: `src/react/index.tsx`
Source: `src/react/index.tsx:47:1`

Result returned by `usePermission`.

### Members

| Name         | Kind     | Type                                 | Required | Description |
| ------------ | -------- | ------------------------------------ | -------- | ----------- |
| canAskAgain  | property | `boolean \| undefined`               | no       |             |
| granted      | property | `boolean`                            | yes      |             |
| openSettings | property | `(() => Promise<void>) \| undefined` | no       |             |
| permission   | property | `Permission`                         | yes      |             |
| reason       | property | `string \| undefined`                | no       |             |
| refresh      | property | `() => Promise<PermissionState>`     | yes      |             |
| request      | property | `() => Promise<PermissionState>`     | yes      |             |
| requestedAt  | property | `Date \| undefined`                  | no       |             |
| state        | property | `PermissionState`                    | yes      |             |
| status       | property | `PermissionStatus`                   | yes      |             |

## PermissionManager

Kind: `type`
Module: `src/manager/createPermissionManager.ts`
Source: `src/manager/createPermissionManager.ts:8:1`

Public facade for checking and requesting normalized permission state.

### Members

| Name         | Kind   | Type                                                   | Required | Description |
| ------------ | ------ | ------------------------------------------------------ | -------- | ----------- |
| getStatus    | method | `(permission: Permission) => Promise<PermissionState>` | yes      |             |
| openSettings | method | `(() => Promise<void>) \| undefined`                   | no       |             |
| request      | method | `(permission: Permission) => Promise<PermissionState>` | yes      |             |

## PERMISSIONS

Kind: `value`
Module: `src/registry/permissions.ts`
Source: `src/registry/permissions.ts:38:14`

Stable ordered list of known permissions.

## permissionsPackageMetadata

Kind: `value`
Module: `src/metadata/index.ts`
Source: `src/metadata/index.ts:4:14`

Public package metadata used by generated documentation and tooling.

## PermissionsProvider

Kind: `function`
Module: `src/react/index.tsx`
Source: `src/react/index.tsx:67:1`

Provides a permission manager to React hooks.

React helpers are framework-neutral. They depend on React only and do not
import browser, Expo, or React Native permission APIs.

### Signatures

- `({
  children,
  client,
  manager,
}: PermissionsProviderProps) => ReactNode`
  - {
    children,
    client,
    manager,
    }: `PermissionsProviderProps`
  - returns: `ReactNode`

## PermissionsProviderProps

Kind: `type`
Module: `src/react/index.tsx`
Source: `src/react/index.tsx:30:1`

Props accepted by `PermissionsProvider`.

### Members

| Name     | Kind     | Type                             | Required | Description |
| -------- | -------- | -------------------------------- | -------- | ----------- |
| children | property | `ReactNode`                      | yes      |             |
| client   | property | `PermissionClient \| undefined`  | no       |             |
| manager  | property | `PermissionManager \| undefined` | no       |             |

## PermissionState

Kind: `type`
Module: `src/state/permissionState.ts`
Source: `src/state/permissionState.ts:34:1`

Normalized result returned by permission clients and managers.

### Members

| Name        | Kind     | Type                   | Required | Description |
| ----------- | -------- | ---------------------- | -------- | ----------- |
| canAskAgain | property | `boolean \| undefined` | no       |             |
| granted     | property | `boolean`              | yes      |             |
| permission  | property | `Permission`           | yes      |             |
| reason      | property | `string \| undefined`  | no       |             |
| requestedAt | property | `Date \| undefined`    | no       |             |
| status      | property | `PermissionStatus`     | yes      |             |

## PermissionStatus

Kind: `unknown`
Module: `src/state/permissionState.ts`
Source: `src/state/permissionState.ts:9:1`

Normalized permission statuses shared by adapters and UI code.

Denial is normal control flow. Unexpected adapter failures may still throw,
but user denial should be represented as a permission state.

## usePermission

Kind: `function`
Module: `src/react/index.tsx`
Source: `src/react/index.tsx:103:1`

Tracks a single permission and exposes explicit refresh/request actions.

### Signatures

- `(permission: Permission, options?: UsePermissionOptions) => PermissionHookResult`
  - options: `UsePermissionOptions` (optional)
  - permission: `Permission`
  - returns: `PermissionHookResult`

## UsePermissionOptions

Kind: `type`
Module: `src/react/index.tsx`
Source: `src/react/index.tsx:39:1`

Options for `usePermission`.

### Members

| Name           | Kind     | Type                           | Required | Description |
| -------------- | -------- | ------------------------------ | -------- | ----------- |
| initialState   | property | `PermissionState \| undefined` | no       |             |
| refreshOnMount | property | `boolean \| undefined`         | no       |             |

## usePermissions

Kind: `function`
Module: `src/react/index.tsx`
Source: `src/react/index.tsx:90:1`

Reads the current permission manager from context.

### Signatures

- `() => PermissionManager`
  - returns: `PermissionManager`

## WebPermissionClientOptions

Kind: `type`
Module: `src/web/index.ts`
Source: `src/web/index.ts:67:1`

Options for the browser permission adapter.

### Members

| Name   | Kind     | Type                         | Required | Description |
| ------ | -------- | ---------------------------- | -------- | ----------- |
| global | property | `WebGlobalLike \| undefined` | no       |             |
