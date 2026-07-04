'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackMetaPurchase } from '@/lib/meta-pixel';
import { clearPendingCheckout, readPendingCheckout } from '@/lib/payment-return';
import { PORTAL_HOME_PATH } from '@/lib/routes';
import { pollUntilEnrolled } from '@/lib/razorpay-checkout';

type PaymentReturnViewProps = {
  error?: string | null;
};

export function PaymentReturnView({ error: returnConfirmFailed }: PaymentReturnViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Confirming your payment…');
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    const destination = searchParams.get('destination') || PORTAL_HOME_PATH;
    const flow = searchParams.get('flow') || 'enrollment';
    const pending = readPendingCheckout();

    const finish = () => {
      clearPendingCheckout();
      router.replace(destination);
      router.refresh();
    };

    if (flow === 'subscription-update') {
      finish();
      return;
    }

    let cancelled = false;
    void (async () => {
      const enrolled = await pollUntilEnrolled({ intervalMs: 1500, timeoutMs: 120000 });
      if (cancelled) return;
      if (enrolled) {
        const sessionId = pending?.checkoutSessionId ?? searchParams.get('session')?.trim();
        if (sessionId) {
          trackMetaPurchase({ eventID: `purchase:${sessionId}` });
        }
        finish();
        return;
      }

      setMessage('Payment received. This is taking longer than usual — still confirming…');
      const retry = await pollUntilEnrolled({ intervalMs: 2000, timeoutMs: 60000 });
      if (cancelled) return;
      if (retry) {
        const sessionId = pending?.checkoutSessionId ?? searchParams.get('session')?.trim();
        if (sessionId) {
          trackMetaPurchase({ eventID: `purchase:${sessionId}` });
        }
        finish();
        return;
      }

      setShowSpinner(false);
      setMessage(
        returnConfirmFailed
          ? 'Your payment may have gone through, but we could not confirm it in the browser. Please sign in to your dashboard — if you are enrolled, you are all set. Otherwise contact support.'
          : 'Your payment went through but enrollment is still syncing. Please wait a moment and refresh, or contact support if this persists.'
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [returnConfirmFailed, router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      {showSpinner ? <Loader2 className="h-8 w-8 animate-spin text-brand" /> : null}
      <p className="max-w-md text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
}
