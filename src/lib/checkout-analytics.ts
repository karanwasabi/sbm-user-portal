import { trackPortalPurchase, type CheckoutItemParams } from '@/lib/gtag';
import { trackMetaPurchase } from '@/lib/meta-pixel';

const PURCHASE_TRACKED_PREFIX = 'sbm_purchase_tracked:';

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
  trackMetaPurchase({
    eventID: `purchase:${params.transactionId}`,
    valuePaise: params.valuePaise,
  });
}
