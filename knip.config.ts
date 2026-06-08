import { createKnipConfig } from '@ankhorage/devtools/knip';

export default createKnipConfig({
  entry: ['examples/basic-app/App.tsx'],
  ignoreFiles: [
    '.prettierrc.js',
    'eslint.config.mjs',
    'examples/expo-showcase/**',
    'examples/*/*/**',
    'paradox.config.ts',
  ],
});
