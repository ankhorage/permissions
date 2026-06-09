# Ankhorage Agent Guide for `@ankhorage/permissions`

This repository is a strict TypeScript Bun package for a standalone cross-platform permission registry and runtime helper library.

`@ankhorage/permissions` must remain usable outside Ankhorage-generated apps. It provides permission identifiers, normalized permission state, adapter-neutral clients, permission managers, React helpers, web/runtime adapters, and deterministic test utilities for TypeScript, React, React Native, React Native Web, Expo, and browser-based apps.

All coding agents must follow the rules below.

## Non-negotiables

- Do not introduce `any`, `as any`, `unknown as any`, or broad casts to silence errors.
- Do not add `@ts-ignore` / `@ts-expect-error` unless explicitly requested.
- Do not add `eslint-disable` or weaken lint rules/config to “make it pass”.
- Do not weaken tsconfig strictness or change module resolution settings.
- Do not perform large refactors unless explicitly requested.
- Do not make the package Ankhorage-app-specific.
- Do not import from `@ankhorage/contracts`, `@ankhorage/zora`, generated apps, Studio, runtime, CLI, templates, orchestrator, or API packages.
- Do not import Expo, React Native permission packages, browser globals, or native SDKs from the root entrypoint unless explicitly designed as a safe optional runtime boundary.
- Do not put build-time native config generation into the first runtime implementation unless explicitly requested.
- If you cannot proceed without violating these rules: STOP and propose 2–3 options with tradeoffs.

## Required verification

Before concluding any code task, run from repo root:

- `bun install` when dependencies or lockfile can change
- `bun run build`
- `bun run knip`
- `bun run lint:fix`
- `bun run format`
- `bun run test`

For release or packaging-related work, also run:

- `npm pack --dry-run`

If any command fails: STOP and report the failure plus the minimal fix.

## Package responsibility

This package owns standalone permission runtime primitives:

- a stable registry of known permissions/capabilities, for example camera, microphone, media library, location, notifications, and clipboard
- normalized permission status and state models
- adapter-neutral `PermissionClient` APIs
- `createPermissionManager` and related runtime helpers
- React provider/hooks for permission state
- web/browser permission adapters where practical
- fake/test clients for deterministic tests
- documentation explaining runtime permissions versus build-time native configuration

This package does not own:

- Ankhorage app manifests
- generated app runtime interpretation
- ZORA scanner UI
- app templates
- Studio authoring behavior
- API gateway behavior
- Expo config plugins, unless added later as an isolated optional entrypoint or package
- native localization generation for iOS/Android permission strings, unless explicitly requested as a follow-up feature

## Dependency boundaries

Allowed dependency direction:

- Core may depend on TypeScript runtime primitives only.
- React helpers may use `react` if it is already added as a dependency/peer dependency and exported through an explicit React-focused module or root API approved by the implementation plan.
- Web adapter code may reference browser APIs defensively through `globalThis` and feature detection.
- Test utilities may live in the package when they are useful for downstream consumers.

Forbidden root/core dependencies:

- `@ankhorage/contracts`
- `@ankhorage/zora`
- `@ankhorage/runtime`
- `@ankhorage/studio`
- `@ankhorage/templates`
- `@ankhorage/cli`
- `@ankhorage/orchestrator`
- generated app code
- Expo modules such as `expo-camera`, `expo-location`, `expo-notifications`, or `expo-media-library`
- React Native native modules that force native linking from the root entrypoint

Optional adapters must be isolated. Preferred future shape:

```ts
import { Permission, createPermissionManager } from '@ankhorage/permissions';
import { createExpoPermissionClient } from '@ankhorage/permissions/expo';
import { createWebPermissionClient } from '@ankhorage/permissions/web';
```

The root entrypoint must stay safe to import in plain TypeScript, Node, browser, React DOM, React Native, React Native Web, and Expo projects.

## Layering rules

Architecture:

```txt
src/registry/*   → permission identifiers and metadata
src/state/*      → normalized status and state helpers
src/client/*     → PermissionClient interfaces and adapters
src/manager/*    → createPermissionManager and runtime orchestration
src/react/*      → provider/hooks, no platform-specific APIs
src/web/*        → browser adapter with defensive feature detection
src/testing/*    → fake/test clients and deterministic helpers
src/metadata/*   → package metadata for generated docs
```

Rules:

- Registry modules must not depend on adapters.
- State normalization must not depend on React.
- Manager modules may depend on registry, state, and client interfaces.
- React modules may depend on manager/client interfaces, but not on web or native APIs directly.
- Web modules may depend on registry/state/client interfaces, but must feature-detect browser APIs.
- Testing modules may depend on public state/client types and should remain deterministic.
- Keep native build-time config separate from runtime permission requests.

## Public API expectations

Public APIs should be:

- standalone-first
- additive unless a breaking change is explicitly requested
- typed without escape hatches
- adapter-neutral by default
- predictable on React DOM, React Native, React Native Web, Expo, and plain TypeScript
- documented with useful Paradox comments
- deterministic in tests

Start from this conceptual API unless the issue says otherwise:

```ts
export enum Permission {
  Camera = 'camera',
  Microphone = 'microphone',
  MediaLibrary = 'mediaLibrary',
  MediaLibraryWrite = 'mediaLibraryWrite',
  LocationForeground = 'locationForeground',
  LocationBackground = 'locationBackground',
  Notifications = 'notifications',
  Clipboard = 'clipboard',
}

export type PermissionStatus =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'limited'
  | 'unavailable';

export interface PermissionState {
  permission: Permission;
  status: PermissionStatus;
  canAskAgain?: boolean;
  granted: boolean;
  requestedAt?: Date;
  reason?: string;
}

export interface PermissionClient {
  getStatus(permission: Permission): Promise<PermissionState>;
  request(permission: Permission): Promise<PermissionState>;
  openSettings?(): Promise<void>;
}
```

Denial is normal control flow. Do not throw for a normal user denial. Use `status: 'denied'`, `status: 'blocked'`, or `status: 'unavailable'` as appropriate.

Throwing is reserved for programmer errors or unexpected adapter failures that cannot be represented as a permission state.

## Adapter rules

Adapters convert platform-specific APIs into normalized `PermissionState` values.

Adapters must:

- validate requested permissions against the registry
- return `status: 'unavailable'` for unsupported permissions/APIs
- avoid crashing when platform APIs are absent
- handle secure-context limitations on web
- preserve `canAskAgain` when the platform exposes it
- avoid prompting from `getStatus`; prompting belongs in `request`
- not silently request broader permissions than the caller asked for

Web adapter expectations:

- notifications should use the browser Notification API when available
- geolocation should use browser geolocation / Permissions API where available
- camera/microphone should use `navigator.mediaDevices.getUserMedia` where available
- unsupported APIs should return `unavailable`
- browser APIs must be accessed through defensive feature detection

Expo / React Native adapter expectations:

- Do not add Expo to the root entrypoint.
- Prefer a follow-up optional entrypoint/package for Expo adapters.
- Runtime adapters may request permissions, but build-time native permission strings/config are a separate follow-up concern.

## React rules

React helpers should be framework-neutral and work in React DOM, React Native, React Native Web, and Expo.

Expected exports include:

- `PermissionsProvider`
- `usePermissions`
- `usePermission`

Hook behavior expectations:

- `usePermission(permission)` exposes current `status`, `granted`, `canAskAgain`, `request`, `refresh`, and `openSettings` where available.
- Hooks must not request permission on mount by default.
- Hooks should refresh status on mount if this is explicit, safe, and documented.
- Provider errors should be helpful when hooks are used without a provider.

## Paradox documentation rules

Respect Paradox documentation generation.

Use useful doc comments on public exports. Prefer comments that explain behavior and boundaries, not obvious restatements of names.

Use Paradox-aware tags only in Paradox documentation comments.

Paradox documentation comments use the repo's established triple-star form:

```ts
/***
 * @readme
 */
```

- `@readme` for key package concepts that should appear in generated README output

Document at least:

- how to create a permission manager
- how to check permission status
- how to request a permission
- how to use React hooks
- how fake clients work in tests
- how web adapters represent unavailable APIs
- why the core package does not import Expo directly
- why native permission text/config is separate from runtime requests

Do not add shallow comments just to increase docs output.

Do not add code snippets into comments.
Usage examples belong in `examples/`.

## Testing rules

Tests must be deterministic and runnable offline.

Add or update tests for:

- registry contents
- registry validation
- status normalization
- `createPermissionManager`
- fake/test client behavior
- granted, denied, blocked, limited, unknown, and unavailable flows
- unsupported permission handling
- React provider/hook behavior where feasible
- web adapter behavior with mocked browser APIs where feasible

Do not perform real permission prompts in tests.
Do not perform real browser, OS, or native API calls in tests.
Do not require a simulator, browser, device, or network connection for tests.

## File and export conventions

Prefer explicit exports from `src/index.ts`.

Example:

```ts
export type { PermissionClient, PermissionState, PermissionStatus } from './client/types';
export { Permission, PERMISSION_REGISTRY } from './registry/permissions';
export { createPermissionManager } from './manager/createPermissionManager';
```

Avoid broad wildcard exports unless the repository already establishes that convention.

Build outputs must go to `dist/`. Never write build artifacts into `src/`.

## README and examples

README/Paradox docs should describe the package as a standalone cross-platform permission runtime.

README wording should:

- avoid Ankhorage-generated-app assumptions
- avoid ZORA/template/runtime-specific language
- explain adapter boundaries clearly
- show generic TypeScript usage
- show generic React usage
- mention web adapter behavior
- mention future native build-time config as separate from runtime requests

## Package metadata

Keep `package.json` aligned with the package identity.

Description:

```json
{
  "description": "Cross-platform permission registry and runtime helpers for TypeScript apps."
}
```

Keywords should include useful discovery terms such as:

```json
[
  "permissions",
  "permission-management",
  "capabilities",
  "typescript",
  "react",
  "react-native",
  "react-native-web",
  "expo",
  "web",
  "camera",
  "notifications",
  "location",
  "media-library",
  "microphone",
  "privacy",
  "cross-platform"
]
```

## Changesets

If a completed task changes the published package API, behavior, docs, or package metadata in a release-relevant way, create or update a `.changeset/*.md` file before committing that work.

Use a minor changeset for the initial runtime implementation:

```md
---
'@ankhorage/permissions': minor
---

Implement the initial standalone cross-platform permission runtime.
```

Repo-doc/tooling-only changes do not need a changeset unless they affect package release behavior.

## Mandatory workflow

1. Plan first: list the exact files you will touch and why.
2. Keep changes PR-sized and focused.
3. Do not edit files during planning.
4. Apply changes only after the plan is clear.
5. After edits: show `git diff --stat` and briefly explain changes.
6. Roll back to the last checkpoint if a step goes sideways instead of trial-and-error edits.
7. If a completed task changes the published package, create or update a `.changeset/*.md` file before committing that work.
8. After verification, commit the completed unit of work unless the user explicitly says not to.
9. If verification cannot be run in the current environment, state exactly which commands the user should run.

## Current initiative

The immediate initiative is the initial standalone runtime foundation for `@ankhorage/permissions`.

High-level goals:

- stable permission registry
- normalized permission state
- adapter-neutral client interface
- permission manager
- React provider/hooks
- fake/test client
- web adapter where practical
- useful Paradox docs
- package metadata update
- changeset
- no Ankhorage/ZORA/Expo dependency in root/core
