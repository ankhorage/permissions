import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: 'PERMISSIONS',
    usage: {
      entrypoints: ['examples/basic/App.tsx', 'examples/expo/App.tsx'],
    },
  },

  package: {
    root: '.',
    entrypoints: [
      'src/index.ts',
      'src/react/index.tsx',
      'src/testing/index.ts',
      'src/web/index.ts',
      'src/expo/index.ts',
      'src/expo/manifest.ts',
      'src/metadata/index.ts',
    ],
  },

  output: {
    dir: './paradox',
  },
});
