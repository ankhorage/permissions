import type { Capability } from '@ankhorage/contracts/capabilities';

/*** Define the executable permission operations published by this package. */
export const CAPABILITIES = [
  {
    id: 'permissions.inspect',
    owner: '@ankhorage/permissions',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
    label: 'Inspect permissions',
    description: 'List known permission identifiers and registry metadata.',
  },
  {
    id: 'permissions.check',
    owner: '@ankhorage/permissions',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
    label: 'Check permission',
    description: 'Check a permission state through a host-provided permission client.',
  },
  {
    id: 'permissions.request',
    owner: '@ankhorage/permissions',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
    label: 'Request permission',
    description: 'Request a permission through a host-provided permission client.',
  },
  {
    id: 'permissions.manifest',
    owner: '@ankhorage/permissions',
    access: ['invoke'],
    binding: { kind: 'action', bindableAs: ['target'] },
    label: 'Inspect permission manifest',
    description: 'Show native and web manifest metadata required by registered permissions.',
  },
] as const satisfies readonly Capability[];
