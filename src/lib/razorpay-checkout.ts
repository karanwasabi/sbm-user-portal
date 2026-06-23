import type { CheckoutStartResponse } from '@/types/checkout';
import type { Enrollment } from '@/types/enrollment';
import { abandonCheckout, getMyEnrollments } from '@/utils/client-api';

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
  onSuccess: () => void;
  onDismiss?: () => void;
};

export async function openRazorpaySubscriptionCheckout({
  key,
  subscriptionId,
  orderId,
  description,
  subscriptionCardChange = false,
  onSuccess,
  onDismiss,
}: OpenRazorpaySubscriptionOptions): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout failed to load.');
  }

  const options: Record<string, unknown> = {
    key,
    subscription_id: subscriptionId,
    name: 'Slow Burn Method',
    description,
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
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
  onSuccess,
  onDismiss,
}: Omit<OpenRazorpaySubscriptionOptions, 'orderId' | 'subscriptionCardChange'>): Promise<void> {
  await openRazorpaySubscriptionCheckout({
    key,
    subscriptionId,
    description,
    subscriptionCardChange: true,
    onSuccess,
    onDismiss,
  });
}

type OpenEnrollmentCheckoutOptions = {
  start: CheckoutStartResponse;
  onSuccess: () => void;
  onDismiss?: () => void;
};

export async function openRazorpayEnrollmentCheckout({
  start,
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
    onSuccess,
    onDismiss: () => {
      void abandonCheckout(start.checkout_session_id).catch(() => undefined);
      onDismiss?.();
    },
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
