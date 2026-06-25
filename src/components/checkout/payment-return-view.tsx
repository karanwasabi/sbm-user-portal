'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pollUntilEnrolled } from '@/lib/razorpay-checkout';
import { clearPendingCheckout } from '@/lib/payment-return';

type PaymentReturnViewProps = {
  error?: string | null;
};

export function PaymentReturnView({ error: initialError }: PaymentReturnViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState(
    initialError
      ? 'We could not confirm your payment. Please try again or contact support.'
      : 'Confirming your payment…'
  );

  useEffect(() => {
    if (initialError) return;

    const destination = searchParams.get('destination') || '/';
    const flow = searchParams.get('flow') || 'enrollment';

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
        finish();
        return;
      }

      setMessage('Payment received. This is taking longer than usual — still confirming…');
      const retry = await pollUntilEnrolled({ intervalMs: 2000, timeoutMs: 60000 });
      if (cancelled) return;
      if (retry) {
        finish();
        return;
      }

      setMessage(
        'Your payment went through but enrollment is still syncing. Please wait a moment and refresh, or contact support if this persists.'
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [initialError, router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      {!initialError ? <Loader2 className="h-8 w-8 animate-spin text-brand" /> : null}
      <p className="max-w-md text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
}
