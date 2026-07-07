'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { trackMetaPurchase } from '@/lib/meta-pixel';
import { clearPendingCheckout, readPendingCheckout, trialEnrollRetryPath } from '@/lib/payment-return';
import { PORTAL_HOME_PATH } from '@/lib/routes';
import { pollUntilEnrolled } from '@/lib/razorpay-checkout';
import { getTrialPaymentStatus, pollUntilTrialPaymentConfirmed } from '@/utils/client-api';

type PaymentReturnViewProps = {
  error?: string | null;
};

type RecoveryState = {
  message: string;
  retryHref?: string;
  showRetry: boolean;
};

const CONFIRM_FAILED_POLL_MS = 15_000;
const NORMAL_POLL_MS = 120_000;
const NORMAL_RETRY_POLL_MS = 60_000;

function isConfirmFailed(error: string | null | undefined, searchParams: URLSearchParams): boolean {
  const value = (error ?? searchParams.get('error') ?? '').trim();
  return value === 'confirm_failed';
}

export function PaymentReturnView({ error: returnConfirmFailed }: PaymentReturnViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Confirming your payment…');
  const [showSpinner, setShowSpinner] = useState(true);
  const [recovery, setRecovery] = useState<RecoveryState | null>(null);

  useEffect(() => {
    const destination = searchParams.get('destination') || PORTAL_HOME_PATH;
    const flow = searchParams.get('flow') || 'enrollment';
    const pending = readPendingCheckout();
    const sessionId = pending?.checkoutSessionId ?? searchParams.get('session')?.trim() ?? '';
    const confirmFailed = isConfirmFailed(returnConfirmFailed, searchParams);

    const finish = () => {
      clearPendingCheckout();
      router.replace(destination);
      router.refresh();
    };

    const showRecovery = (state: RecoveryState) => {
      setShowSpinner(false);
      setMessage(state.message);
      setRecovery(state);
    };

    if (flow === 'subscription-update' || flow === 'subscription-continue') {
      finish();
      return;
    }

    if (flow === 'trial-enroll' && !sessionId) {
      finish();
      return;
    }

    let cancelled = false;
    void (async () => {
      const pollTrial = (timeoutMs: number) =>
        pollUntilTrialPaymentConfirmed(sessionId, { intervalMs: 1500, timeoutMs });
      const pollAuth = (timeoutMs: number) => pollUntilEnrolled({ intervalMs: 1500, timeoutMs });
      const pollEnrolled = () => (flow === 'trial-enroll' ? pollTrial(NORMAL_POLL_MS) : pollAuth(NORMAL_POLL_MS));

      if (confirmFailed) {
        const enrolled = await (flow === 'trial-enroll'
          ? pollTrial(CONFIRM_FAILED_POLL_MS)
          : pollAuth(CONFIRM_FAILED_POLL_MS));
        if (cancelled) return;
        if (enrolled) {
          if (sessionId) {
            trackMetaPurchase({ eventID: `purchase:${sessionId}` });
          }
          finish();
          return;
        }

        if (flow === 'trial-enroll') {
          let paid = false;
          try {
            const status = await getTrialPaymentStatus(sessionId);
            paid = status.enrolled;
          } catch {
            // Treat as unpaid when status cannot be loaded.
          }
          if (paid) {
            finish();
            return;
          }

          showRecovery({
            message: 'Payment was not completed. You were not charged — please enroll again to continue.',
            retryHref: trialEnrollRetryPath(destination),
            showRetry: true,
          });
          return;
        }

        showRecovery({
          message:
            'We could not confirm your payment in the browser. Sign in to your dashboard to check enrollment, or try again.',
          showRetry: false,
        });
        return;
      }

      const enrolled = await pollEnrolled();
      if (cancelled) return;
      if (enrolled) {
        if (sessionId) {
          trackMetaPurchase({ eventID: `purchase:${sessionId}` });
        }
        finish();
        return;
      }

      setMessage('Payment received. This is taking longer than usual — still confirming…');
      const retry = await (flow === 'trial-enroll' ? pollTrial(NORMAL_RETRY_POLL_MS) : pollAuth(NORMAL_RETRY_POLL_MS));
      if (cancelled) return;
      if (retry) {
        if (sessionId) {
          trackMetaPurchase({ eventID: `purchase:${sessionId}` });
        }
        finish();
        return;
      }

      if (flow === 'trial-enroll') {
        showRecovery({
          message:
            'We could not confirm enrollment yet. If you received a payment confirmation email, you are all set. Otherwise enroll again — you will not be charged twice for the same successful payment.',
          retryHref: trialEnrollRetryPath(destination),
          showRetry: true,
        });
        return;
      }

      showRecovery({
        message:
          'Your payment went through but enrollment is still syncing. Please wait a moment and refresh, or sign in to your dashboard.',
        showRetry: false,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [returnConfirmFailed, router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      {showSpinner ? <Loader2 className="h-8 w-8 animate-spin text-brand" /> : null}
      <p className="max-w-md text-sm font-medium text-slate-700">{message}</p>
      {recovery?.showRetry && recovery.retryHref ? (
        <Button href={recovery.retryHref} variant="primary" size="md" className="min-w-[180px]">
          Enroll again
        </Button>
      ) : null}
    </div>
  );
}
