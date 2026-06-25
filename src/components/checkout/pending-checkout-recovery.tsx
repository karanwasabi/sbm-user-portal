'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearPendingCheckout, readPendingCheckout } from '@/lib/payment-return';
import { pollUntilEnrolled } from '@/lib/razorpay-checkout';

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

    let cancelled = false;
    void (async () => {
      const enrolled = await pollUntilEnrolled({ intervalMs: 2000, timeoutMs: 15000 });
      if (cancelled || !enrolled) return;
      clearPendingCheckout();
      router.replace(pending.destination);
      router.refresh();
    })();

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      void (async () => {
        const enrolled = await pollUntilEnrolled({ intervalMs: 1000, timeoutMs: 10000 });
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
