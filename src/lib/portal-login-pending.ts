const STORAGE_KEY = 'sbm_portal_pending_login';

export type PortalLoginMethod = 'password' | 'email_otp';

export function markPortalLoginPending(method: PortalLoginMethod) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, method);
}

export function consumePortalLoginPending(): PortalLoginMethod | null {
  if (typeof window === 'undefined') return null;
  const method = sessionStorage.getItem(STORAGE_KEY);
  if (method !== 'password' && method !== 'email_otp') {
    return null;
  }
  sessionStorage.removeItem(STORAGE_KEY);
  return method;
}
