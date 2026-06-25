'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pollUntilEnrolled } from '@/lib/razorpay-checkout';
import { clearPendingCheckout, readPendingCheckout } from '@/lib/payment-return';

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
      const enrolled = await pollUntilEnrolled({ intervalMs: 1500, timeoutMs: 45000 });
      if (cancelled) return;
      if (enrolled) {
        finish();
        return;
      }

      if (pending?.destination) {
        setMessage('Payment received. Finishing setup…');
        const retry = await pollUntilEnrolled({ intervalMs: 2000, timeoutMs: 20000 });
        if (!cancelled && retry) {
          finish();
          return;
        }
      }

      setMessage('Payment is still processing. Taking you back…');
      window.setTimeout(() => {
        if (!cancelled) finish();
      }, 2500);
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
