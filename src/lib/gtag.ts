export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const PORTAL_APP_NAME = 'portal';

type GtagCommand = 'config' | 'event' | 'js' | 'set';

declare global {
  interface Window {
    gtag?: (command: GtagCommand, targetId: string | Date, config?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
}

export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', action, params);
}

export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

export function trackPortalEvent(action: string, params?: Record<string, unknown>) {
  trackEvent(action, { app_name: PORTAL_APP_NAME, ...params });
}

type CheckoutItemParams = {
  valuePaise: number;
  cohortName: string;
  pricingRegion?: string;
  promoCode?: string | null;
};

function checkoutEventParams({ valuePaise, cohortName, pricingRegion, promoCode }: CheckoutItemParams) {
  return {
    app_name: PORTAL_APP_NAME,
    currency: 'INR',
    value: paiseToRupees(valuePaise),
    pricing_region: pricingRegion,
    coupon: promoCode || undefined,
    items: [
      {
        item_name: cohortName,
        item_category: 'take-control',
        price: paiseToRupees(valuePaise),
      },
    ],
  };
}

export function trackPortalSignUp() {
  trackPortalEvent('sign_up', { method: 'email_otp' });
}

export function trackPortalBeginCheckout(params: CheckoutItemParams) {
  trackEvent('begin_checkout', checkoutEventParams(params));
}

export function trackPortalPurchase(
  params: CheckoutItemParams & {
    transactionId: string;
  }
) {
  trackEvent('purchase', {
    ...checkoutEventParams(params),
    transaction_id: params.transactionId,
  });
}

export function trackPortalCheckoutAbandoned(params: CheckoutItemParams) {
  trackPortalEvent('portal_checkout_abandoned', checkoutEventParams(params));
}

export function trackPortalLogin(method: 'password' | 'email_otp') {
  trackPortalEvent('portal_login', { method });
}
