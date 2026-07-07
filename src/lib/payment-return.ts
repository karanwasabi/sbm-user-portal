export type PaymentReturnFlow = 'enrollment' | 'subscription-update' | 'subscription-continue' | 'trial-enroll';

export type PendingCheckoutState = {
  checkoutSessionId: string;
  destination: string;
  flow: PaymentReturnFlow;
  startedAt: number;
  valuePaise?: number;
  cohortName?: string;
  pricingRegion?: string;
  trialProduct?: string;
};

export const PENDING_CHECKOUT_STORAGE_KEY = 'sbm_pending_checkout';

export function getPortalOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
}

export function buildPaymentReturnUrl(options: {
  checkoutSessionId?: string;
  destination: string;
  flow?: PaymentReturnFlow;
}): string {
  const params = new URLSearchParams({
    destination: options.destination,
    flow: options.flow ?? 'enrollment',
  });
  if (options.checkoutSessionId) {
    params.set('session', options.checkoutSessionId);
  }
  return `${getPortalOrigin()}/api/payment/razorpay-return?${params.toString()}`;
}

export function savePendingCheckout(state: PendingCheckoutState): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify(state));
}

export function readPendingCheckout(): PendingCheckoutState | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingCheckoutState;
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
}

/** Map welcome destination product param back to the public enroll page. */
export function trialEnrollRetryPath(destination: string): string {
  try {
    const url = new URL(destination, 'http://local');
    const product = url.searchParams.get('product')?.trim();
    if (product === 'trial_1m') return '/enroll/trial';
    if (product === 'trial_3m') return '/enroll';
  } catch {
    // Fall through to default enroll path.
  }
  return '/enroll';
}
