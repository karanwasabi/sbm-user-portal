'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import {
  clearAuthParamsFromUrl,
  hasAuthCallbackPayload,
  isExpiredLinkAuthError,
  parseAuthCallbackParams,
} from '@/lib/auth-callback-hash';
import { completeEmailVerification } from '@/lib/complete-email-verification';
import { buildOpenPaymentLinkRecoveryPath, resolveContinuePaymentEmail } from '@/lib/payment-handoff';
import { createClient } from '@/utils/supabase/client';

type LoginAuthHashHandlerProps = {
  children: ReactNode;
};

/** Handles Supabase auth tokens/errors that land on /login (site URL fallback). */
export function LoginAuthHashHandler({ children }: LoginAuthHashHandlerProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(() => {
    const params = parseAuthCallbackParams();
    return Boolean(params && hasAuthCallbackPayload(params));
  });

  useEffect(() => {
    const params = parseAuthCallbackParams();
    if (!params || !hasAuthCallbackPayload(params)) return;

    const { searchParams, hashParams } = params;
    let cancelled = false;

    const finish = () => {
      if (!cancelled) setIsProcessing(false);
    };

    const handoffEmail = resolveContinuePaymentEmail(searchParams);
    const isPaymentHandoff = Boolean(handoffEmail);

    const redirectExpired = () => {
      clearAuthParamsFromUrl();
      if (isPaymentHandoff) {
        router.replace(buildOpenPaymentLinkRecoveryPath(handoffEmail));
        return;
      }
      router.replace('/login?link_error=expired');
    };

    const completeStandardSignIn = () => {
      clearAuthParamsFromUrl();
      router.refresh();
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

        if (isPaymentHandoff) {
          const result = await completeEmailVerification();
          if (result.error) redirectExpired();
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

        if (isPaymentHandoff) {
          const result = await completeEmailVerification();
          if (result.error) redirectExpired();
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
  }, [router]);

  if (isProcessing) {
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

  return children;
}
