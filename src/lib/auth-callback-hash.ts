export type AuthCallbackParams = {
  searchParams: URLSearchParams;
  hashParams: URLSearchParams;
};

export function parseAuthCallbackParams(): AuthCallbackParams | null {
  if (typeof window === 'undefined') return null;

  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  return { searchParams, hashParams };
}

export function clearAuthParamsFromUrl() {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', window.location.pathname);
}

export function hasAuthCallbackPayload(params: AuthCallbackParams): boolean {
  const { searchParams, hashParams } = params;
  if (searchParams.get('code')) return true;
  if (hashParams.get('error')) return true;
  if (hashParams.get('access_token') && hashParams.get('refresh_token')) return true;
  return false;
}

export function isExpiredLinkAuthError(hashParams: URLSearchParams): boolean {
  const error = hashParams.get('error');
  const errorCode = hashParams.get('error_code');
  if (error !== 'access_denied') return false;
  return errorCode === 'otp_expired' || errorCode === 'otp_disabled' || Boolean(hashParams.get('error_description'));
}
