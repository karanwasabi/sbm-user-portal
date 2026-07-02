import { normalizeLoginEmailParam } from '@/lib/login-url';

export const PAYMENT_HANDOFF_EMAIL_COOKIE = 'sbm_payment_handoff_email';

export function buildContinuePaymentPath(email?: string): string {
  const normalized = normalizeLoginEmailParam(email);
  if (!normalized) return '/register/continue-payment';
  return `/register/continue-payment?email=${encodeURIComponent(normalized)}`;
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

export function resolveContinuePaymentEmail(searchParams?: URLSearchParams | null): string {
  const fromSearch = searchParams ? readPaymentHandoffEmailFromSearch(searchParams) : '';
  if (fromSearch) return fromSearch;
  return readPaymentHandoffEmailFromCookie();
}
