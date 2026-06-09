import { Permission, PermissionsProvider, usePermission } from '@ankhorage/permissions';
import { createPermissionClient } from '@ankhorage/permissions/expo';

/***
 * Expo permissions runtime example.
 *
 * Create the Expo permission client from the optional Expo entrypoint, provide
 * it at the app root, and call `request()` only from an explicit user action.
 *
 * @usage
 * @readme
 */
export default function ExpoPermissionsExample() {
  const client = createPermissionClient();

  return (
    <PermissionsProvider client={client}>
      <CameraPermissionExample />
    </PermissionsProvider>
  );
}

function CameraPermissionExample() {
  const camera = usePermission(Permission.Camera, { refreshOnMount: true });

  return (
    <>
      <p>Camera permission: {camera.status}</p>
      <button
        type="button"
        disabled={camera.granted}
        onClick={() => {
          void camera.request();
        }}
      >
        Request camera permission
      </button>
    </>
  );
}
