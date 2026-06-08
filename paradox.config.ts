import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: 'PERMISSIONS',
  },

  package: {
    root: '.',
    entrypoints: [
      'src/index.ts',
      'src/react/index.tsx',
      'src/testing/index.ts',
      'src/web/index.ts',
      'src/metadata/index.ts',
    ],
  },

  output: {
    dir: './paradox',
  },
});
