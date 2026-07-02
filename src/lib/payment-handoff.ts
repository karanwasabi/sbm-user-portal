import { hasAuthCallbackPayload, isExpiredLinkAuthError, parseAuthCallbackParams } from '@/lib/auth-callback-hash';
import { normalizeLoginEmailParam } from '@/lib/login-url';

export const PAYMENT_HANDOFF_EMAIL_COOKIE = 'sbm_payment_handoff_email';

export function buildContinuePaymentPath(email?: string): string {
  const normalized = normalizeLoginEmailParam(email);
  if (!normalized) return '/register/continue-payment';
  return `/register/continue-payment?email=${encodeURIComponent(normalized)}`;
}

export function buildOpenPaymentLinkRecoveryPath(email?: string): string {
  const normalized = normalizeLoginEmailParam(email);
  if (!normalized) return '/register/open-payment-link?expired=1';
  return `/register/open-payment-link?email=${encodeURIComponent(normalized)}&expired=1`;
}

export function readPaymentHandoffEmailFromSearch(searchParams: URLSearchParams): string {
  return normalizeLoginEmailParam(searchParams.get('email') ?? undefined);
}

export function readPaymentHandoffEmailFromCookie(): string {
  if (typeof document === 'undefined') return '';
  const prefix = `${PAYMENT_HANDOFF_EMAIL_COOKIE}=`;
  const match = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix));
  if (!match) return '';
  try {
    return normalizeLoginEmailParam(decodeURIComponent(match.slice(prefix.length)));
  } catch {
    return '';
  }
}

export function rememberPaymentHandoffEmail(email: string) {
  if (typeof document === 'undefined') return;
  const normalized = normalizeLoginEmailParam(email);
  if (!normalized) return;
  document.cookie = `${PAYMENT_HANDOFF_EMAIL_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=3600; samesite=lax`;
}

export function resolvePaymentHandoffEmail(searchParams?: URLSearchParams | null): string {
  const fromSearch = searchParams ? readPaymentHandoffEmailFromSearch(searchParams) : '';
  if (fromSearch) return fromSearch;
  return readPaymentHandoffEmailFromCookie();
}

/** Forward Supabase auth callbacks that wrongly land on /login back to the payment handoff page. */
export function buildOpenPaymentLinkAuthReturnUrl(
  email: string,
  searchParams: URLSearchParams,
  hash: string,
  expired = false
): string {
  if (expired) return buildOpenPaymentLinkRecoveryPath(email);

  const query = new URLSearchParams();
  if (email) query.set('email', email);
  const code = searchParams.get('code');
  if (code) query.set('code', code);
  const qs = query.toString();
  const normalizedHash = hash.startsWith('#') ? hash : hash ? `#${hash}` : '';
  return `/register/open-payment-link${qs ? `?${qs}` : ''}${normalizedHash}`;
}

export function shouldForwardPaymentAuthFromLogin(): boolean {
  if (typeof window === 'undefined') return false;
  const params = parseAuthCallbackParams();
  if (!params) return false;
  const email = resolvePaymentHandoffEmail(params.searchParams);
  if (!email) return false;
  if (hasAuthCallbackPayload(params)) return true;
  return isExpiredLinkAuthError(params.hashParams) || Boolean(params.hashParams.get('error'));
}

export function forwardPaymentAuthFromLoginToPortal() {
  const params = parseAuthCallbackParams();
  if (!params) return false;
  const email = resolvePaymentHandoffEmail(params.searchParams);
  if (!email) return false;

  const { searchParams, hashParams } = params;
  const hash = window.location.hash;
  const expired = isExpiredLinkAuthError(hashParams) || Boolean(hashParams.get('error'));
  window.location.replace(buildOpenPaymentLinkAuthReturnUrl(email, searchParams, hash, expired));
  return true;
}

export function resolveContinuePaymentEmail(searchParams?: URLSearchParams | null): string {
  return resolvePaymentHandoffEmail(searchParams);
}
