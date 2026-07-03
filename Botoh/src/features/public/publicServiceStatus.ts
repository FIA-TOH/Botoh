let publicBackendOnline = false;
const listeners = new Set<(isOnline: boolean) => void>();

export function setPublicBackendOnline(isOnline: boolean) {
  if (publicBackendOnline === isOnline) return;
  publicBackendOnline = isOnline;
  listeners.forEach((listener) => listener(isOnline));
}

export function isPublicBackendOnline() {
  return publicBackendOnline;
}

export function onPublicBackendStatusChange(listener: (isOnline: boolean) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
