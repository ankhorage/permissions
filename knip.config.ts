import { createKnipConfig } from '@ankhorage/devtools/knip';

export default createKnipConfig({
  entry: ['examples/basic/App.tsx'],
  ignoreFiles: [
    '.prettierrc.js',
    'eslint.config.mjs',
    'paradox.config.ts',
  ],
});
