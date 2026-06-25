'use client';

import { useEffect, useState } from 'react';
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
  const [syncing, setSyncing] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const enrolled = await pollUntilEnrolled({ intervalMs: 1500, timeoutMs: 20000 });
      if (cancelled) return;
      if (enrolled) {
        setHidden(true);
        router.refresh();
      }
      setSyncing(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

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

  if (hidden) {
    return null;
  }

  if (syncing) {
    return (
      <Card className="border-brand/20 bg-brand/5">
        <div className="flex items-center gap-3 px-1 py-1">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          <p className="text-sm font-medium text-slate-700">Confirming your recent payment…</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-brand/20 bg-brand/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Complete Your Enrollment Payment</p>
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
          {confirming ? 'Confirming…' : pending ? 'Opening…' : 'Complete Payment'}
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
