import type { CheckoutStartResponse } from '@/types/checkout';
import type { Enrollment } from '@/types/enrollment';
import { abandonCheckout, getMyEnrollments } from '@/utils/client-api';
import {
  buildPaymentReturnUrl,
  clearPendingCheckout,
  savePendingCheckout,
  type PaymentReturnFlow,
} from '@/lib/payment-return';

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

type OpenRazorpaySubscriptionOptions = {
  key: string;
  subscriptionId: string;
  orderId?: string;
  description: string;
  subscriptionCardChange?: boolean;
  checkoutSessionId?: string;
  returnDestination?: string;
  returnFlow?: PaymentReturnFlow;
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

function startCheckoutCompletionWatcher(
  onComplete: () => void,
  options?: { enrollmentFlow?: boolean }
): CheckoutWatcher {
  if (typeof window === 'undefined') {
    return { stop: () => undefined };
  }

  let stopped = false;
  const complete = runOnce(onComplete);

  const poll = async () => {
    if (stopped) return;
    if (options?.enrollmentFlow === false) {
      complete();
      return;
    }
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
  subscriptionCardChange = false,
  checkoutSessionId,
  returnDestination = '/',
  returnFlow = 'enrollment',
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
  const watcher = startCheckoutCompletionWatcher(complete, { enrollmentFlow });

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
    handler: () => {
      watcher.stop();
      complete();
    },
    modal: {
      ondismiss: () => {
        watcher.stop();
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

type OpenEnrollmentCheckoutOptions = {
  start: CheckoutStartResponse;
  returnDestination?: string;
  onSuccess: () => void;
  onDismiss?: () => void;
};

export async function openRazorpayEnrollmentCheckout({
  start,
  returnDestination = '/',
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
    checkoutSessionId: start.checkout_session_id,
    returnDestination,
    returnFlow: 'enrollment',
    abandonOnDismiss: false,
    onSuccess,
    onDismiss,
  });
}

export function isEnrolledStatus(status: Enrollment['status']): boolean {
  return status === 'upcoming' || status === 'active';
}

export async function pollUntilEnrolled(options?: { intervalMs?: number; timeoutMs?: number }): Promise<boolean> {
  const intervalMs = options?.intervalMs ?? 2000;
  const timeoutMs = options?.timeoutMs ?? 30000;
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const enrollments = await getMyEnrollments();
    if (enrollments.some((entry) => isEnrolledStatus(entry.status))) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return false;
}

export function userNeedsPassword(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  if (!user) return false;
  return user.app_metadata?.password_set !== 'true';
}
