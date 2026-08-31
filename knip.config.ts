import { createKnipConfig } from '@ankhorage/devtools/knip';

export default createKnipConfig({
  entry: ['examples/basic/App.tsx', 'examples/expo/App.tsx'],
  ignoreDependencies: [
    'expo-audio',
    'expo-camera',
    'expo-linking',
    'expo-location',
    'expo-media-library',
    'expo-notifications',
  ],
  ignoreFiles: [
    '.prettierrc.js',
    'eslint.config.mjs',
    'eslint.local.config.mjs',
    'paradox.config.ts',
    'prettier.local.config.js',
  ],
});
