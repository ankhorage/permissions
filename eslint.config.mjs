import { createConfig } from '@ankhorage/devtools/eslint';
import localConfig from './eslint.local.config.mjs';

const localEntries = Array.isArray(localConfig) ? localConfig : [localConfig];

export default [
  ...createConfig({
    files: ['examples/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: import.meta.dirname,
  }),
  ...localEntries,
];
