import { PERMISSIONS } from './registry/permissions';

const PERMISSIONS_PACKAGE_NAME = '@ankhorage/permissions';
const PERMISSIONS_PACKAGE_VERSION = '0.2.0';
const PERMISSIONS_COMMAND_CATEGORY = 'permissions';

const PERMISSIONS_CAPABILITIES = [
  'permissions.inspect',
  'permissions.check',
  'permissions.request',
  'permissions.manifest',
] as const;

const commands = [
  {
    path: ['list'],
    summary: 'List known permission identifiers and registry metadata.',
    capability: 'permissions.inspect',
    aliases: ['registry'],
    examples: ['ankh permissions list'],
  },
  {
    path: ['check'],
    summary: 'Check a permission state through a host-provided permission client.',
    capability: 'permissions.check',
    examples: ['ankh permissions check camera'],
  },
  {
    path: ['request'],
    summary: 'Request a permission through a host-provided permission client.',
    capability: 'permissions.request',
    examples: ['ankh permissions request camera'],
  },
  {
    path: ['manifest'],
    summary: 'Show native/web manifest metadata required by registered permissions.',
    capability: 'permissions.manifest',
    examples: ['ankh permissions manifest camera'],
  },
] as const;

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
  capabilities: PERMISSIONS_CAPABILITIES,
  commands,
  handlers,
};

export default provider;
