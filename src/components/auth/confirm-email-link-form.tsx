'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { completeEmailVerification } from '@/lib/complete-email-verification';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

export function ConfirmEmailLinkForm() {
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const confirmFromLink = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError('This confirmation link is invalid or has expired.');
          setIsChecking(false);
          return;
        }
      } else if (tokenHash && (type === 'signup' || type === 'email')) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type === 'email' ? 'email' : 'signup',
        });
        if (verifyError) {
          setError('This confirmation link is invalid or has expired.');
          setIsChecking(false);
          return;
        }
      } else {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError('This confirmation link is invalid or has expired.');
            setIsChecking(false);
            return;
          }
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.user?.email_confirmed_at) {
            setError('This confirmation link is invalid or has expired.');
            setIsChecking(false);
            return;
          }
        }
      }

      window.history.replaceState(null, '', window.location.pathname);

      const result = await completeEmailVerification();
      if (result.error) {
        setError(result.error);
        setIsChecking(false);
      }
    };

    void confirmFromLink();
  }, []);

  if (isChecking) {
    return (
      <AuthLayout>
        <div className="mb-7">
          <SbmWordmark size="lg" />
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
          <p className="mt-4 text-sm font-medium text-slate-500">Confirming your email…</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>
      <p className="text-[13px] leading-snug font-semibold text-danger-press" role="alert">
        {error}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Button href="/register" variant="primary" size="lg" fullWidth>
          Continue registration
        </Button>
        <Link href="/login" className="text-center text-xs font-semibold text-brand no-underline">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
