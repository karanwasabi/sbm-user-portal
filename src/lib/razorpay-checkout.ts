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
  onSuccess: () => void;
  onDismiss?: () => void;
};

export async function openRazorpaySubscriptionCheckout({
  key,
  subscriptionId,
  orderId,
  description,
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
    name: 'Strong Body Method',
    description,
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
    },
  };

  if (orderId) {
    options.order_id = orderId;
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
}
