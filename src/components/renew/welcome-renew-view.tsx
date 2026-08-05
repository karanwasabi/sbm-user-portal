'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { EnrollWelcomeIllustration } from '@/components/enroll/enroll-welcome-illustration';
import { AuthLayout } from '@/components/layout/auth-layout';
import { clearRenewDraft } from '@/lib/renew-draft';
import { formatInclusiveAccessEndDate, formatShortStartDate } from '@/lib/format-display-date';
import { getRenewPaymentStatus } from '@/utils/client-api';
import { trackCheckoutRegistrationOnce } from '@/lib/checkout-analytics';
import type { RenewCategory } from '@/types/renew';

type WelcomeRenewViewProps = {
  sessionId?: string;
  categoryHint?: RenewCategory;
};

function isNewSignupRenewCategory(category?: RenewCategory | string | null) {
  return category === 'new_user' || category === 'new_lead_no_sub';
}

export function WelcomeRenewView({ sessionId, categoryHint }: WelcomeRenewViewProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'pending'>('loading');
  const [startsOn, setStartsOn] = useState<string | null>(null);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);
  const [category, setCategory] = useState<RenewCategory | null>(categoryHint ?? null);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    clearRenewDraft();
    if (!sessionId) {
      setStatus('pending');
      return;
    }

    let cancelled = false;
    const stopPolling = () => {
      if (pollIntervalRef.current !== null) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    const poll = async () => {
      try {
        const result = await getRenewPaymentStatus(sessionId);
        if (cancelled) return;
        if (result.fulfilled) {
          stopPolling();
          setStatus('success');
          setStartsOn(result.starts_on ?? null);
          setAccessUntil(result.access_until ?? null);
          const resolvedCategory = (result.category as RenewCategory) || categoryHint || null;
          setCategory(resolvedCategory);
          if (isNewSignupRenewCategory(resolvedCategory) && result.user_id) {
            trackCheckoutRegistrationOnce(result.user_id);
          }
          return;
        }
        setStatus('pending');
        setStartsOn(result.starts_on ?? null);
        setAccessUntil(result.access_until ?? null);
        setCategory((result.category as RenewCategory) || categoryHint || null);
      } catch {
        if (!cancelled) setStatus('pending');
      }
    };

    void poll();
    pollIntervalRef.current = window.setInterval(() => void poll(), 2500);
    const timeout = window.setTimeout(() => {
      stopPolling();
      if (!cancelled) setStatus((s) => (s === 'loading' ? 'pending' : s));
    }, 120000);

    return () => {
      cancelled = true;
      stopPolling();
      window.clearTimeout(timeout);
    };
  }, [sessionId, categoryHint]);

  const startLabel = startsOn ? formatShortStartDate(startsOn) : null;
  const accessUntilLabel = formatInclusiveAccessEndDate(accessUntil);
  const isNewSignup = isNewSignupRenewCategory(category);

  const heading =
    status === 'success' ? (isNewSignup ? 'Welcome to Take Control' : "You're all set") : 'Confirming your payment';

  const successCopy = (() => {
    if (isNewSignup && startLabel) {
      return `Your Take Control access is confirmed. Your cohort starts ${startLabel}.`;
    }
    if (accessUntilLabel) {
      return `Your membership is renewed. Access is active until ${accessUntilLabel}.`;
    }
    return 'Your Take Control membership is renewed.';
  })();

  return (
    <AuthLayout variant="account">
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4 py-2 text-center">
        <div className="flex w-full justify-center overflow-x-auto">
          <SbmWordmark size="lg" showSubtitle={false} />
        </div>

        {status === 'loading' ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            Confirming your payment…
          </div>
        ) : (
          <>
            <EnrollWelcomeIllustration className="my-1 h-auto w-full max-w-[280px] sm:max-w-[300px]" />

            <div className="flex flex-col items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{heading}</h1>
              {status === 'success' ? (
                <>
                  <p className="text-sm text-slate-600">{successCopy}</p>
                  {isNewSignup ? (
                    <p className="text-sm text-slate-600">Check your inbox for an email with next steps.</p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600">
                    We&apos;re still confirming your payment. You&apos;ll receive access shortly.
                  </p>
                  <Link href="/renew" className="text-sm font-semibold text-brand hover:underline">
                    Return to renew page
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
