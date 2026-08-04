'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { EnrollWelcomeIllustration } from '@/components/enroll/enroll-welcome-illustration';
import { AuthLayout } from '@/components/layout/auth-layout';
import { clearRenewDraft } from '@/lib/renew-draft';
import { formatShortStartDate } from '@/lib/format-display-date';
import { getRenewPaymentStatus } from '@/utils/client-api';
import type { RenewCategory } from '@/types/renew';

type WelcomeRenewViewProps = {
  sessionId?: string;
};

function isNewSignupRenewCategory(category?: RenewCategory | string | null) {
  return category === 'new_user' || category === 'new_lead_no_sub';
}

function formatAccessUntilLabel(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return formatShortStartDate(date.toISOString().slice(0, 10));
}

export function WelcomeRenewView({ sessionId }: WelcomeRenewViewProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'pending'>('loading');
  const [startsOn, setStartsOn] = useState<string | null>(null);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);
  const [category, setCategory] = useState<RenewCategory | null>(null);

  useEffect(() => {
    clearRenewDraft();
    if (!sessionId) {
      setStatus('pending');
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const result = await getRenewPaymentStatus(sessionId);
        if (cancelled) return;
        if (result.fulfilled) {
          setStatus('success');
          setStartsOn(result.starts_on ?? null);
          setAccessUntil(result.access_until ?? null);
          setCategory((result.category as RenewCategory) ?? null);
          return;
        }
        setStatus('pending');
        setStartsOn(result.starts_on ?? null);
        setAccessUntil(result.access_until ?? null);
        setCategory((result.category as RenewCategory) ?? null);
      } catch {
        if (!cancelled) setStatus('pending');
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      if (!cancelled) setStatus((s) => (s === 'loading' ? 'pending' : s));
    }, 120000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [sessionId]);

  const startLabel = startsOn ? formatShortStartDate(startsOn) : null;
  const accessUntilLabel = formatAccessUntilLabel(accessUntil);
  const isNewSignup = isNewSignupRenewCategory(category);

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
              <h1 className="text-xl font-bold text-slate-900">You&apos;re all set</h1>
              {status === 'success' ? (
                <p className="text-sm text-slate-600">{successCopy}</p>
              ) : (
                <p className="text-sm text-slate-600">
                  We&apos;re still confirming your payment. You&apos;ll receive access shortly.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
