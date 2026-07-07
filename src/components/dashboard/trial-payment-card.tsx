'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatInrFromPaise } from '@/lib/money';
import { openRazorpayOrderCheckout } from '@/lib/razorpay-checkout';
import { continueTrialCheckout, getMyTrialStatus } from '@/utils/client-api';
import { useRouter } from 'next/navigation';

export function TrialPaymentCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(true);
  const [month, setMonth] = useState(2);
  const [amountPaise, setAmountPaise] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const status = await getMyTrialStatus();
        if (cancelled) return;
        if (status.can_pay_next && status.next_installment) {
          setHidden(false);
          setMonth(status.next_installment);
          setAmountPaise(status.next_amount_paise ?? 0);
        }
      } catch {
        // No trial enrollment — hide card.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePay = async () => {
    setPending(true);
    setError(null);
    try {
      const start = await continueTrialCheckout();
      if (!start.razorpay_key_id || !start.razorpay_order_id) {
        throw new Error('Payment is not configured yet.');
      }

      await openRazorpayOrderCheckout({
        key: start.razorpay_key_id,
        orderId: start.razorpay_order_id,
        checkoutSessionId: start.checkout_session_id,
        description: `Take Control trial · month ${month}`,
        returnDestination: '/home',
        returnFlow: 'enrollment',
        onSuccess: () => {
          router.refresh();
          setHidden(true);
        },
        onDismiss: () => setPending(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open payment.');
      setPending(false);
    }
  };

  if (loading || hidden) {
    return null;
  }

  return (
    <Card className="border-brand/20 bg-brand/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Complete your trial — month {month} of 3</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Pay {amountPaise > 0 ? formatInrFromPaise(amountPaise) : 'your installment'} to continue your Take Control
            access.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={pending}
          onClick={() => void handlePay()}
          rightIcon={pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        >
          {pending ? 'Opening…' : 'Pay now'}
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
