'use client';

import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { normalizeLoginEmailParam } from '@/lib/login-url';
import { rememberPaymentHandoffEmail } from '@/lib/payment-handoff';

export default function OpenPaymentLinkPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = normalizeLoginEmailParam(params.get('email') ?? undefined);
    const auth = params.get('auth')?.trim();

    if (email) {
      rememberPaymentHandoffEmail(email);
    }

    if (auth) {
      window.location.replace(auth);
      return;
    }

    const fallback = email
      ? `/register/continue-payment?email=${encodeURIComponent(email)}`
      : '/register/continue-payment';
    window.location.replace(fallback);
  }, []);

  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
        <p className="mt-4 text-sm font-medium text-slate-500">Opening your payment link…</p>
      </div>
    </AuthLayout>
  );
}
