import {
  createFakePermissionClient,
  Permission,
  PermissionsProvider,
  usePermission,
} from '@ankhorage/permissions';

/***
 * Basic permissions runtime example.
 *
 * Create a permission client, provide it at the app root, and use
 * `usePermission` to read, refresh, and request a normalized permission state.
 *
 * @usage
 * @readme
 */
export default function BasicPermissionsExample() {
  const client = createFakePermissionClient({
    initialStates: [{ permission: Permission.Camera, status: 'denied' }],
    requestStates: [{ permission: Permission.Camera, status: 'granted' }],
  });

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
