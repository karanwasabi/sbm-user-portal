'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2, MailX } from 'lucide-react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { SectionHead } from '@/components/ui/section-head';
import { confirmEmailUnsubscribe } from '@/app/unsubscribe/actions';

type UnsubscribeViewProps = {
  token: string | null;
};

export function UnsubscribeView({ token }: UnsubscribeViewProps) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [already, setAlready] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!token) return;
    setError(null);
    startTransition(async () => {
      const result = await confirmEmailUnsubscribe(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAlready(Boolean(result.already));
      setDone(true);
    });
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="mb-7">
          <SbmWordmark size="lg" />
        </div>
        <SectionHead
          title="Invalid unsubscribe link"
          subtitle="This link is missing required information. Use the unsubscribe link from a recent email from us."
          className="mb-2"
        />
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="mb-7">
          <SbmWordmark size="lg" />
        </div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </div>
        <SectionHead
          title={already ? "You're already unsubscribed" : "You're unsubscribed"}
          subtitle={
            already
              ? 'This email address is already off our marketing list. No further action is needed.'
              : "You won't receive marketing emails from Slow Burn Method at this address anymore."
          }
          className="mb-2"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <MailX className="h-6 w-6" aria-hidden />
      </div>
      <SectionHead
        title="Unsubscribe from marketing emails"
        subtitle="You'll stop receiving promotional updates from Slow Burn Method. Account and program emails you need for your membership are not affected."
        className="mb-5"
      />
      {error ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">{error}</p>
      ) : null}
      <Button type="button" fullWidth onClick={handleConfirm} disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Unsubscribing…
          </>
        ) : (
          'Confirm unsubscribe'
        )}
      </Button>
    </AuthLayout>
  );
}
