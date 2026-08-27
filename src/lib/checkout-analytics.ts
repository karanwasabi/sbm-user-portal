import { trackPortalPurchase, type CheckoutItemParams } from '@/lib/gtag';
import { trackMetaCompleteRegistration, trackMetaPurchase } from '@/lib/meta-pixel';

const PURCHASE_TRACKED_PREFIX = 'sbm_purchase_tracked:';
const REGISTRATION_TRACKED_PREFIX = 'sbm_registration_tracked:';

/** Renewals must not fire Meta browser Purchase (aligned with CAPI skip). */
export function shouldSkipMetaPurchasePixel(params: { renewPlanKey?: string }): boolean {
  return Boolean(params.renewPlanKey?.trim());
}

export function trackCheckoutPurchaseOnce(
  params: CheckoutItemParams & {
    transactionId: string;
  }
): void {
  if (typeof window === 'undefined') return;
  const key = `${PURCHASE_TRACKED_PREFIX}${params.transactionId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  trackPortalPurchase(params);
  if (shouldSkipMetaPurchasePixel(params)) {
    return;
  }
  trackMetaPurchase({
    eventID: params.transactionId,
    valuePaise: params.valuePaise,
    trialProduct: params.trialProduct,
    cohortName: params.cohortName,
  });
}

export function trackCheckoutRegistrationOnce(userId: string): void {
  if (typeof window === 'undefined' || !userId.trim()) return;
  const key = `${REGISTRATION_TRACKED_PREFIX}${userId.trim()}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  trackMetaCompleteRegistration({ eventID: `registration:${userId.trim()}` });
}
