'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { getTrialPaymentStatus } from '@/utils/client-api';

type WelcomeTakeControlViewProps = {
  sessionId?: string;
  productLabel: string;
};

function formatDateLabel(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function WelcomeTakeControlView({ sessionId, productLabel }: WelcomeTakeControlViewProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'pending'>('loading');
  const [cohortName, setCohortName] = useState<string | null>(null);
  const [startsOn, setStartsOn] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('success');
      return;
    }

    let cancelled = false;
    const poll = async () => {
      try {
        const result = await getTrialPaymentStatus(sessionId);
        if (cancelled) return;
        if (result.enrolled) {
          setStatus('success');
          setCohortName(result.cohort_name ?? null);
          setStartsOn(result.starts_on ?? null);
          return;
        }
        setStatus('pending');
        setCohortName(result.cohort_name ?? null);
        setStartsOn(result.starts_on ?? null);
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

  const startLabel = formatDateLabel(startsOn ?? undefined);

  return (
    <AuthLayout variant="account">
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-5 py-4 text-center">
        <SbmWordmark className="h-7 w-auto" />
        <h1 className="text-xl font-bold text-slate-900">Welcome to Take Control</h1>

        {status === 'loading' ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            Confirming your payment…
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-slate-600">
              {status === 'success'
                ? `Your ${productLabel} enrollment is confirmed.`
                : `We received your payment. If this page does not update shortly, check your email — your enrollment may already be processing.`}
            </p>
            {cohortName && startLabel ? (
              <p className="text-sm font-medium text-slate-800">
                {cohortName} starts {startLabel}
              </p>
            ) : null}
            <p className="text-sm text-slate-600">Check your email to sign in and set your password.</p>
            <Button href="/login" variant="primary" size="md" className="mt-2 w-full max-w-xs">
              Go to sign in
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
