# Components

## PermissionsProvider

Source: `src/react/index.tsx:66:1`

Provides a permission manager to React hooks.

React helpers are framework-neutral. They depend on React only and do not
import browser, Expo, or React Native permission APIs.

Export paths: `src/index.ts`, `src/react/index.tsx`

| Prop     | Type                             | Required | Default | Description |
| -------- | -------------------------------- | -------- | ------- | ----------- |
| children | `ReactNode \| undefined`         | no       | —       |             |
| client   | `PermissionClient \| undefined`  | no       | —       |             |
| manager  | `PermissionManager \| undefined` | no       | —       |             |
