import type { CheckoutStartResponse } from '@/types/checkout';
import type { Enrollment } from '@/types/enrollment';
import {
  abandonCheckout,
  confirmCheckoutPaymentReturn,
  confirmTrialPaymentReturn,
  getMyEnrollments,
  syncCheckoutPayment,
} from '@/utils/client-api';
import {
  buildPaymentReturnUrl,
  clearPendingCheckout,
  savePendingCheckout,
  type PaymentReturnFlow,
} from '@/lib/payment-return';
import { PORTAL_HOME_PATH } from '@/lib/routes';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
    document.body.appendChild(script);
  });
}

type RazorpayPricingRegion = CheckoutStartResponse['pricing_region'];

const INTERNATIONAL_CARD_ONLY_METHODS = {
  card: true,
  upi: false,
  netbanking: false,
  wallet: false,
  paylater: false,
  emi: false,
} as const;

function razorpayOptionsForRegion(pricingRegion?: RazorpayPricingRegion): Record<string, unknown> {
  if (pricingRegion !== 'international') {
    return {};
  }
  return { method: INTERNATIONAL_CARD_ONLY_METHODS };
}

type RazorpayPrefill = {
  name?: string;
  email?: string;
  contact?: string;
};

type OpenRazorpaySubscriptionOptions = {
  key: string;
  subscriptionId: string;
  orderId?: string;
  description: string;
  pricingRegion?: RazorpayPricingRegion;
  subscriptionCardChange?: boolean;
  checkoutSessionId?: string;
  returnDestination?: string;
  returnFlow?: PaymentReturnFlow;
  prefill?: RazorpayPrefill;
  onSuccess: () => void;
  onDismiss?: () => void;
  abandonOnDismiss?: boolean;
};

type CheckoutWatcher = {
  stop: () => void;
};

function runOnce(onSuccess: () => void): () => void {
  let completed = false;
  return () => {
    if (completed) return;
    completed = true;
    clearPendingCheckout();
    onSuccess();
  };
}

function startCheckoutCompletionWatcher(onComplete: () => void): CheckoutWatcher {
  if (typeof window === 'undefined') {
    return { stop: () => undefined };
  }

  let stopped = false;
  const complete = runOnce(onComplete);

  const poll = async () => {
    if (stopped) return;
    const enrolled = await pollUntilEnrolled({ intervalMs: 1000, timeoutMs: 8000 });
    if (!stopped && enrolled) {
      complete();
    }
  };

  const onResume = () => {
    if (document.visibilityState === 'hidden') return;
    void poll();
  };

  document.addEventListener('visibilitychange', onResume);
  window.addEventListener('pageshow', onResume);
  window.addEventListener('focus', onResume);

  return {
    stop: () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onResume);
      window.removeEventListener('pageshow', onResume);
      window.removeEventListener('focus', onResume);
    },
  };
}

async function handleCheckoutDismiss(options: {
  checkoutSessionId?: string;
  abandonOnDismiss: boolean;
  enrollmentFlow: boolean;
  onSuccess: () => void;
  onDismiss?: () => void;
}) {
  if (options.enrollmentFlow) {
    const enrolled = await pollUntilEnrolled({ intervalMs: 500, timeoutMs: 4000 });
    if (enrolled) {
      clearPendingCheckout();
      options.onSuccess();
      return;
    }
  }

  if (options.abandonOnDismiss && options.checkoutSessionId) {
    void abandonCheckout(options.checkoutSessionId).catch(() => undefined);
  }

  options.onDismiss?.();
}

export async function openRazorpaySubscriptionCheckout({
  key,
  subscriptionId,
  orderId,
  description,
  pricingRegion,
  subscriptionCardChange = false,
  checkoutSessionId,
  returnDestination = PORTAL_HOME_PATH,
  returnFlow = 'enrollment',
  prefill,
  onSuccess,
  onDismiss,
  abandonOnDismiss = false,
}: OpenRazorpaySubscriptionOptions): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout failed to load.');
  }

  const complete = runOnce(onSuccess);
  const enrollmentFlow = returnFlow === 'enrollment';
  const watcher = enrollmentFlow ? startCheckoutCompletionWatcher(complete) : null;

  if (checkoutSessionId) {
    savePendingCheckout({
      checkoutSessionId,
      destination: returnDestination,
      flow: returnFlow,
      startedAt: Date.now(),
    });
  }

  const callbackUrl = buildPaymentReturnUrl({
    checkoutSessionId,
    destination: returnDestination,
    flow: returnFlow,
  });

  const options: Record<string, unknown> = {
    key,
    subscription_id: subscriptionId,
    name: 'Slow Burn Method',
    description,
    callback_url: callbackUrl,
    ...razorpayOptionsForRegion(pricingRegion),
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_subscription_id?: string;
      razorpay_signature: string;
    }) => {
      watcher?.stop();
      void (async () => {
        if (enrollmentFlow && checkoutSessionId) {
          try {
            await confirmCheckoutPaymentReturn({
              checkout_session_id: checkoutSessionId,
              flow: returnFlow,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_subscription_id: response.razorpay_subscription_id ?? subscriptionId,
              razorpay_signature: response.razorpay_signature,
            });
          } catch {
            // Webhook/callback may still confirm; sync runs on poll as backup.
          }
        }
        complete();
      })();
    },
    modal: {
      ondismiss: () => {
        watcher?.stop();
        void handleCheckoutDismiss({
          checkoutSessionId,
          abandonOnDismiss,
          enrollmentFlow,
          onSuccess: complete,
          onDismiss,
        });
      },
    },
  };

  if (orderId) {
    options.order_id = orderId;
  }

  if (prefill?.name || prefill?.email || prefill?.contact) {
    options.prefill = {
      ...(prefill.name ? { name: prefill.name } : {}),
      ...(prefill.email ? { email: prefill.email } : {}),
      ...(prefill.contact ? { contact: prefill.contact } : {}),
    };
  }

  if (subscriptionCardChange) {
    options.subscription_card_change = 1;
    options.recurring = '1';
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
}

export async function openRazorpayPaymentMethodUpdate({
  key,
  subscriptionId,
  description,
  checkoutSessionId,
  onSuccess,
  onDismiss,
}: Omit<OpenRazorpaySubscriptionOptions, 'orderId' | 'subscriptionCardChange' | 'returnFlow'> & {
  checkoutSessionId?: string;
}): Promise<void> {
  await openRazorpaySubscriptionCheckout({
    key,
    subscriptionId,
    description,
    subscriptionCardChange: true,
    checkoutSessionId,
    returnDestination: '/subscription',
    returnFlow: 'subscription-update',
    abandonOnDismiss: false,
    onSuccess,
    onDismiss,
  });
}

export async function openRazorpayContinueBilling({
  key,
  subscriptionId,
  description,
  prefill,
  onSuccess,
  onDismiss,
}: {
  key: string;
  subscriptionId: string;
  description: string;
  prefill?: RazorpayPrefill;
  onSuccess: () => void;
  onDismiss?: () => void;
}): Promise<void> {
  await openRazorpaySubscriptionCheckout({
    key,
    subscriptionId,
    description,
    prefill,
    returnDestination: '/subscription',
    returnFlow: 'subscription-continue',
    abandonOnDismiss: false,
    onSuccess,
    onDismiss,
  });
}

type OpenEnrollmentCheckoutOptions = {
  start: CheckoutStartResponse;
  returnDestination?: string;
  onSuccess: () => void;
  onDismiss?: () => void;
};

export async function openRazorpayEnrollmentCheckout({
  start,
  returnDestination = PORTAL_HOME_PATH,
  onSuccess,
  onDismiss,
}: OpenEnrollmentCheckoutOptions): Promise<void> {
  if (!start.razorpay_key_id || !start.razorpay_subscription_id) {
    throw new Error('Payment is not configured yet.');
  }

  await openRazorpaySubscriptionCheckout({
    key: start.razorpay_key_id,
    subscriptionId: start.razorpay_subscription_id,
    orderId: start.razorpay_order_id,
    description: `Take Control · ${start.cohort_name}`,
    pricingRegion: start.pricing_region,
    checkoutSessionId: start.checkout_session_id,
    returnDestination,
    returnFlow: 'enrollment',
    abandonOnDismiss: false,
    onSuccess,
    onDismiss,
  });
}

type OpenOrderCheckoutOptions = {
  key: string;
  orderId: string;
  description: string;
  pricingRegion?: RazorpayPricingRegion;
  checkoutSessionId: string;
  returnDestination: string;
  returnFlow?: 'trial-enroll' | 'enrollment';
  prefill?: RazorpayPrefill;
  onSuccess: () => void;
  onDismiss?: () => void;
};

export async function openRazorpayOrderCheckout({
  key,
  orderId,
  description,
  pricingRegion,
  checkoutSessionId,
  returnDestination,
  returnFlow = 'trial-enroll',
  prefill,
  onSuccess,
  onDismiss,
}: OpenOrderCheckoutOptions): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout failed to load.');
  }

  const complete = runOnce(onSuccess);

  savePendingCheckout({
    checkoutSessionId,
    destination: returnDestination,
    flow: returnFlow,
    startedAt: Date.now(),
  });

  const callbackUrl = buildPaymentReturnUrl({
    checkoutSessionId,
    destination: returnDestination,
    flow: returnFlow,
  });

  const options: Record<string, unknown> = {
    key,
    order_id: orderId,
    name: 'Slow Burn Method',
    description,
    callback_url: callbackUrl,
    ...razorpayOptionsForRegion(pricingRegion),
    handler: (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature: string }) => {
      void (async () => {
        try {
          if (returnFlow === 'trial-enroll') {
            await confirmTrialPaymentReturn({
              checkout_session_id: checkoutSessionId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id ?? orderId,
              razorpay_signature: response.razorpay_signature,
            });
          } else {
            await confirmCheckoutPaymentReturn({
              checkout_session_id: checkoutSessionId,
              flow: returnFlow,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id ?? orderId,
              razorpay_signature: response.razorpay_signature,
            });
          }
        } catch {
          // Webhook may still fulfill; welcome page polls status.
        }
        complete();
      })();
    },
    modal: {
      ondismiss: () => {
        onDismiss?.();
      },
    },
  };

  if (prefill?.name || prefill?.email || prefill?.contact) {
    options.prefill = {
      ...(prefill.name ? { name: prefill.name } : {}),
      ...(prefill.email ? { email: prefill.email } : {}),
      ...(prefill.contact ? { contact: prefill.contact } : {}),
    };
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
}

export function isEnrolledStatus(status: Enrollment['status']): boolean {
  return status === 'upcoming' || status === 'active';
}

export async function pollUntilEnrolled(options?: { intervalMs?: number; timeoutMs?: number }): Promise<boolean> {
  const intervalMs = options?.intervalMs ?? 2000;
  const timeoutMs = options?.timeoutMs ?? 30000;
  const started = Date.now();

  const checkEnrolled = async (): Promise<boolean> => {
    try {
      const synced = await syncCheckoutPayment();
      if (synced.enrolled) {
        return true;
      }
    } catch {
      // Fall back to enrollment list (which also syncs server-side).
    }

    const enrollments = await getMyEnrollments();
    return enrollments.some((entry) => isEnrolledStatus(entry.status));
  };

  if (await checkEnrolled()) {
    return true;
  }

  while (Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    if (await checkEnrolled()) {
      return true;
    }
  }

  return false;
}

export function userNeedsPassword(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  return user.app_metadata?.password_set !== 'true';
}
