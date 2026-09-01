import { readFileSync } from 'node:fs';

import { expect, test } from 'bun:test';

import { Permission, PERMISSIONS } from '../registry/permissions';
import { EXPO_PERMISSION_CLIENT_REQUIRED_PACKAGES, EXPO_PERMISSION_SUPPORT } from './manifest';

test('defines metadata for every known permission', () => {
  expect(Object.keys(EXPO_PERMISSION_SUPPORT).sort()).toEqual([...PERMISSIONS].sort());
});

test('stays metadata-only and does not import Expo runtime modules', () => {
  const source = readFileSync(new URL('./manifest.ts', import.meta.url), 'utf8');

  expect(source).not.toContain("from 'expo-");
  expect(source).not.toContain('await import(');
});

test('projects client-level settings recovery dependencies', () => {
  expect(EXPO_PERMISSION_CLIENT_REQUIRED_PACKAGES).toEqual(['expo-linking']);
});

test('includes package and config hints for camera, microphone, and location permissions', () => {
  expect(EXPO_PERMISSION_SUPPORT[Permission.Camera]).toEqual({
    support: 'supported',
    requiredPackages: ['expo-camera'],
    configHints: ['cameraPermission'],
  });

  expect(EXPO_PERMISSION_SUPPORT[Permission.Microphone]).toEqual({
    support: 'supported',
    requiredPackages: ['expo-audio'],
    configHints: ['microphonePermission', 'recordAudioAndroid'],
  });

  expect(EXPO_PERMISSION_SUPPORT[Permission.LocationForeground]).toEqual({
    support: 'supported',
    requiredPackages: ['expo-location'],
    configHints: ['locationWhenInUsePermission'],
  });

  expect(EXPO_PERMISSION_SUPPORT[Permission.LocationBackground]).toEqual({
    support: 'supported',
    requiredPackages: ['expo-location'],
    configHints: ['locationAlwaysAndWhenInUsePermission'],
  });
});

test('treats clipboard as a not-required permission without runtime package requirements', () => {
  expect(EXPO_PERMISSION_SUPPORT[Permission.Clipboard]).toEqual({
    support: 'notRequired',
    requiredPackages: [],
    configHints: [],
  });
});

test('keeps MediaLibraryWrite aligned with MediaLibrary metadata', () => {
  expect(EXPO_PERMISSION_SUPPORT[Permission.MediaLibraryWrite]).toEqual({
    support: 'supported',
    requiredPackages: ['expo-media-library'],
    configHints: ['mediaLibraryPermission'],
  });

  expect(EXPO_PERMISSION_SUPPORT[Permission.MediaLibraryWrite]).toEqual(
    EXPO_PERMISSION_SUPPORT[Permission.MediaLibrary],
  );
});
