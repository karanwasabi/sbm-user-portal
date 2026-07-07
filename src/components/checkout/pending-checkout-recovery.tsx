'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearPendingCheckout, readPendingCheckout } from '@/lib/payment-return';
import { pollUntilEnrolled } from '@/lib/razorpay-checkout';
import { pollUntilTrialPaymentConfirmed } from '@/utils/client-api';

export function PendingCheckoutRecovery() {
  const router = useRouter();

  useEffect(() => {
    const pending = readPendingCheckout();
    if (!pending) return;

    const startedMs = Date.now() - pending.startedAt;
    if (startedMs > 45 * 60 * 1000) {
      clearPendingCheckout();
      return;
    }

    const pollEnrolled = () =>
      pending.flow === 'trial-enroll'
        ? pollUntilTrialPaymentConfirmed(pending.checkoutSessionId, { intervalMs: 2000, timeoutMs: 15000 })
        : pollUntilEnrolled({ intervalMs: 2000, timeoutMs: 15000 });

    let cancelled = false;
    void (async () => {
      const enrolled = await pollEnrolled();
      if (cancelled || !enrolled) return;
      clearPendingCheckout();
      router.replace(pending.destination);
      router.refresh();
    })();

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      void (async () => {
        const enrolled = await pollEnrolled();
        if (cancelled || !enrolled) return;
        clearPendingCheckout();
        router.replace(pending.destination);
        router.refresh();
      })();
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
    };
  }, [router]);

  return null;
}
