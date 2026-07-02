'use client';

import { Loader2 } from 'lucide-react';
import { useLayoutEffect, useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import {
  clearAuthParamsFromUrl,
  hasAuthCallbackPayload,
  isExpiredLinkAuthError,
  parseAuthCallbackParams,
} from '@/lib/auth-callback-hash';
import { forwardPaymentAuthFromLoginToPortal, shouldForwardPaymentAuthFromLogin } from '@/lib/payment-handoff';
import { createClient } from '@/utils/supabase/client';

type LoginAuthHashHandlerProps = {
  initialEmail?: string;
  linkError?: 'expired' | null;
};

type LoginView = 'pending' | 'payment-forward' | 'auth-processing' | 'form';

function PaymentLinkLoader() {
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

function AuthProcessingLoader() {
  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
        <p className="mt-4 text-sm font-medium text-slate-500">Signing you in…</p>
      </div>
    </AuthLayout>
  );
}

/** Handles Supabase auth tokens/errors that land on /login (site URL fallback). */
export function LoginAuthHashHandler({ initialEmail = '', linkError = null }: LoginAuthHashHandlerProps) {
  const [view, setView] = useState<LoginView>('pending');

  useLayoutEffect(() => {
    if (shouldForwardPaymentAuthFromLogin()) {
      setView('payment-forward');
      forwardPaymentAuthFromLoginToPortal();
      return;
    }

    const params = parseAuthCallbackParams();
    if (!params || !hasAuthCallbackPayload(params)) {
      setView('form');
      return;
    }

    setView('auth-processing');
  }, []);

  useEffect(() => {
    if (view !== 'auth-processing') return;

    const params = parseAuthCallbackParams();
    if (!params || !hasAuthCallbackPayload(params)) {
      setView('form');
      return;
    }

    const { searchParams, hashParams } = params;
    let cancelled = false;

    const finish = () => {
      if (!cancelled) setView('form');
    };

    const redirectExpired = () => {
      clearAuthParamsFromUrl();
      window.location.replace('/login?link_error=expired');
    };

    const completeStandardSignIn = () => {
      clearAuthParamsFromUrl();
      window.location.reload();
    };

    const processAuthCallback = async () => {
      if (isExpiredLinkAuthError(hashParams) || hashParams.get('error')) {
        redirectExpired();
        return;
      }

      const supabase = createClient();
      const code = searchParams.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          redirectExpired();
          return;
        }
        completeStandardSignIn();
        return;
      }

      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          redirectExpired();
          return;
        }

        completeStandardSignIn();
        return;
      }

      finish();
    };

    void processAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [view]);

  if (view === 'pending' || view === 'payment-forward') {
    return <PaymentLinkLoader />;
  }

  if (view === 'auth-processing') {
    return <AuthProcessingLoader />;
  }

  return <LoginForm initialEmail={initialEmail} linkError={linkError} />;
}
