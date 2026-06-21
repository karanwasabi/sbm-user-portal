'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { openRazorpayEnrollmentCheckout, pollUntilEnrolled } from '@/lib/razorpay-checkout';
import { getCheckoutResume, mockCompleteCheckout, startCheckout } from '@/utils/client-api';
import { useRouter } from 'next/navigation';

type PaymentRetryCardProps = {
  legalName?: string;
};

export function PaymentRetryCard({ legalName = 'Member' }: PaymentRetryCardProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = async () => {
    setPending(true);
    setError(null);
    try {
      let start;
      try {
        start = await getCheckoutResume('take-control');
      } catch {
        start = await startCheckout({
          program_slug: 'take-control',
          pricing_region: 'domestic',
          billing_type: 'personal',
          legal_name: legalName,
        });
      }

      if (start.mock) {
        await mockCompleteCheckout(start.checkout_session_id);
        setConfirming(true);
        await pollUntilEnrolled();
        router.refresh();
        return;
      }

      await openRazorpayEnrollmentCheckout({
        start,
        onSuccess: () => {
          void (async () => {
            setConfirming(true);
            await pollUntilEnrolled();
            router.refresh();
          })();
        },
        onDismiss: () => setPending(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open payment.');
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="border-brand/20 bg-brand/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Complete your enrollment payment</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Your account is ready. Finish payment to unlock your member dashboard.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={pending || confirming}
          onClick={() => void handleRetry()}
          rightIcon={pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        >
          {confirming ? 'Confirming…' : pending ? 'Opening…' : 'Complete payment'}
        </Button>
      </div>
      {error ? (
        <p className="mt-3 text-[12.5px] font-semibold text-danger-press" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
