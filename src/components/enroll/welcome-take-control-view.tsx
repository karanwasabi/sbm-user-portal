'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { EnrollWelcomeIllustration } from '@/components/enroll/enroll-welcome-illustration';
import { AuthLayout } from '@/components/layout/auth-layout';
import { getTrialPaymentStatus } from '@/utils/client-api';

type WelcomeTakeControlViewProps = {
  sessionId?: string;
};

function formatDateLabel(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function WelcomeTakeControlView({ sessionId }: WelcomeTakeControlViewProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'pending'>('loading');
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
          setStartsOn(result.starts_on ?? null);
          return;
        }
        setStatus('pending');
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
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-4 py-2 text-center">
        <SbmWordmark size="lg" showSubtitle={false} />

        {status === 'loading' ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            Confirming your payment…
          </div>
        ) : (
          <>
            <EnrollWelcomeIllustration className="my-1 h-auto w-full max-w-[280px] sm:max-w-[300px]" />

            <div className="flex flex-col items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Welcome to Take Control</h1>
              {status === 'success' ? (
                <p className="text-sm font-medium text-slate-600">Your enrollment is confirmed!</p>
              ) : (
                <p className="max-w-[320px] text-sm leading-relaxed text-slate-600">
                  We received your payment. If this page does not update shortly, check your email — your enrollment may
                  already be processing.
                </p>
              )}
            </div>

            {startLabel ? (
              <div className="mt-1 flex flex-col items-center gap-1">
                <p className="text-base font-semibold text-slate-800">Program starts</p>
                <p className="text-2xl font-bold text-brand">{startLabel}</p>
              </div>
            ) : null}

            <p className="text-sm leading-relaxed text-slate-600">Check your inbox for an email with next steps.</p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
