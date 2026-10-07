import type { AnkhRuntimeCommandProvider } from '@ankhorage/ankh';
import type { Capability } from '@ankhorage/contracts';
import type { AnkhCommandDescriptor } from '@ankhorage/contracts/cli';

import { CAPABILITIES } from './capabilities/index';
import { PERMISSIONS } from './registry/permissions';

const PERMISSIONS_PACKAGE_NAME = '@ankhorage/permissions';
const PERMISSIONS_PACKAGE_VERSION = '0.2.0';
const PERMISSIONS_COMMAND_CATEGORY = 'permissions';

const commands = [
  {
    path: ['list'],
    summary: 'List known permission identifiers and registry metadata.',
    capability: CAPABILITIES[0].id,
    aliases: ['registry'],
    examples: ['ankh permissions list'],
  },
  {
    path: ['check'],
    summary: 'Check a permission state through a host-provided permission client.',
    capability: CAPABILITIES[1].id,
    examples: ['ankh permissions check camera'],
  },
  {
    path: ['request'],
    summary: 'Request a permission through a host-provided permission client.',
    capability: CAPABILITIES[2].id,
    examples: ['ankh permissions request camera'],
  },
  {
    path: ['manifest'],
    summary: 'Show native/web manifest metadata required by registered permissions.',
    capability: CAPABILITIES[3].id,
    examples: ['ankh permissions manifest camera'],
  },
] as const satisfies readonly (AnkhCommandDescriptor & {
  readonly capability: Capability['id'];
})[];

const handlers = commands.map((command) => ({
  path: command.path,
  handler(request: {
    readonly context: {
      writeStdout(text: string): void;
    };
  }) {
    request.context.writeStdout(
      `${command.path.join(' ')} is provided by ${PERMISSIONS_PACKAGE_NAME}. ` +
        `Known permissions: ${PERMISSIONS.join(', ')}.\n`,
    );
    return { exitCode: 0 };
  },
}));

const provider = {
  id: PERMISSIONS_PACKAGE_NAME,
  category: PERMISSIONS_COMMAND_CATEGORY,
  version: PERMISSIONS_PACKAGE_VERSION,
  capabilities: CAPABILITIES,
  commands,
  handlers,
} as const satisfies AnkhRuntimeCommandProvider;

export default provider;
