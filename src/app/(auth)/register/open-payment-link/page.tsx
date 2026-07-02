'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ContinuePaymentRecovery } from '@/components/auth/continue-payment-recovery';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import {
  clearAuthParamsFromUrl,
  hasAuthCallbackPayload,
  isExpiredLinkAuthError,
  parseAuthCallbackParams,
} from '@/lib/auth-callback-hash';
import { completeEmailVerification } from '@/lib/complete-email-verification';
import { normalizeLoginEmailParam } from '@/lib/login-url';
import { rememberPaymentHandoffEmail } from '@/lib/payment-handoff';
import { createClient } from '@/utils/supabase/client';

type PaymentLinkPhase = 'opening' | 'expired';

function readInitialPaymentLinkState(): { phase: PaymentLinkPhase; email: string } {
  const params = new URLSearchParams(window.location.search);
  const email = normalizeLoginEmailParam(params.get('email') ?? undefined);
  const phase = params.get('expired') === '1' ? 'expired' : 'opening';
  return { phase, email };
}

export default function OpenPaymentLinkPage() {
  const [phase, setPhase] = useState<PaymentLinkPhase>(() =>
    typeof window === 'undefined' ? 'opening' : readInitialPaymentLinkState().phase
  );
  const [handoffEmail, setHandoffEmail] = useState(() =>
    typeof window === 'undefined' ? '' : readInitialPaymentLinkState().email
  );

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = normalizeLoginEmailParam(params.get('email') ?? undefined);
    if (email) {
      rememberPaymentHandoffEmail(email);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = normalizeLoginEmailParam(params.get('email') ?? undefined);
    const auth = params.get('auth')?.trim();
    const expiredHint = params.get('expired') === '1';

    const authParams = parseAuthCallbackParams();

    const showExpired = (resolvedEmail: string) => {
      clearAuthParamsFromUrl();
      setHandoffEmail(resolvedEmail);
      setPhase('expired');
    };

    const completeSignIn = async () => {
      const result = await completeEmailVerification();
      if (result.error) {
        showExpired(email);
      }
    };

    const processReturn = async () => {
      if (!authParams || !hasAuthCallbackPayload(authParams)) return false;

      const { searchParams, hashParams } = authParams;

      if (isExpiredLinkAuthError(hashParams) || hashParams.get('error')) {
        showExpired(email);
        return true;
      }

      const supabase = createClient();
      const code = searchParams.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        clearAuthParamsFromUrl();
        if (exchangeError) {
          showExpired(email);
          return true;
        }
        await completeSignIn();
        return true;
      }

      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        clearAuthParamsFromUrl();

        if (sessionError) {
          showExpired(email);
          return true;
        }

        await completeSignIn();
        return true;
      }

      return false;
    };

    void (async () => {
      if (expiredHint) {
        showExpired(email);
        return;
      }

      if (await processReturn()) return;

      if (auth) {
        window.location.replace(auth);
        return;
      }

      showExpired(email);
    })();
  }, []);

  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>
      {phase === 'opening' ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
          <p className="mt-4 text-sm font-medium text-slate-500">Opening your payment link…</p>
        </div>
      ) : (
        <ContinuePaymentRecovery initialEmail={handoffEmail} />
      )}
    </AuthLayout>
  );
}
