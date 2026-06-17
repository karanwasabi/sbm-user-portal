'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { resendEmailOtp, verifyEmailOtp } from '@/app/(auth)/signup/actions';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { OTP_RESEND_COOLDOWN_SECONDS } from '@/lib/onboarding-steps';
import type { ResendOtpState, VerifyEmailState } from '@/types/signup';

const initialVerifyState: VerifyEmailState = { error: null, success: false };
const initialResendState: ResendOtpState = { error: null, success: false };

type VerifyEmailFormProps = {
  email: string;
};

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [verifyState, verifyAction, verifyPending] = useActionState(verifyEmailOtp, initialVerifyState);
  const [resendState, resendAction, resendPending] = useActionState(resendEmailOtp, initialResendState);

  const otpRef = useRef<HTMLInputElement>(null);
  const verifyWasPending = useRef(false);

  useEffect(() => {
    otpRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (verifyWasPending.current && !verifyPending && verifyState.error) {
      otpRef.current?.focus();
    }
    verifyWasPending.current = verifyPending;
  }, [verifyPending, verifyState.error]);

  useEffect(() => {
    if (!resendState.success) return;
    setResendMessage('A new verification code has been sent.');
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
  }, [resendState.success]);

  const handleWrongEmail = () => {
    router.push('/signup');
  };

  const canResend = resendCooldown <= 0 && !resendPending;

  return (
    <AuthLayout wide>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>

      <SectionHead
        title="Verify your email"
        subtitle="Enter the 6-digit code we sent to confirm your new account."
        className="mb-5"
      />

      <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Verification sent to</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Mail className="h-4 w-4 text-brand" aria-hidden />
          {email}
        </p>
      </div>

      <form action={verifyAction} className="flex flex-col gap-3.5">
        <input type="hidden" name="email" value={email} />
        <Field label="Verification code" hint="Check your inbox (and spam folder) for a 6-digit code.">
          <TextInput
            ref={otpRef}
            name="otp"
            value={otp}
            onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            autoComplete="one-time-code"
            disabled={verifyPending}
            error={Boolean(verifyState.error)}
          />
        </Field>

        <div className="min-h-6 py-0.5" role={verifyState.error ? 'alert' : undefined} aria-live="polite">
          {verifyState.error ? (
            <p className="text-[12.5px] leading-snug font-semibold text-danger-press">{verifyState.error}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={verifyPending || otp.length !== 6}
          rightIcon={verifyPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        >
          Verify and continue
        </Button>
      </form>

      <div className="mt-4 text-center text-[13px]" aria-live="polite">
        {resendCooldown > 0 ? (
          <p className="font-medium text-slate-500">Resend code in {resendCooldown}s</p>
        ) : (
          <form action={resendAction} className="inline">
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              disabled={!canResend}
              className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-bold text-brand no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendPending ? 'Sending code…' : 'Resend verification code'}
            </button>
          </form>
        )}
      </div>

      {(resendState.error || resendMessage) && (
        <p
          className={`mt-3 text-center text-[12.5px] leading-snug font-semibold ${resendState.error ? 'text-danger-press' : 'text-slate-600'}`}
          role={resendState.error ? 'alert' : 'status'}
        >
          {resendState.error ?? resendMessage}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <p className="text-center text-[13px] leading-relaxed text-slate-600">
          Wrong email? You can go back and register again with the correct address.
        </p>
        <Button
          type="button"
          variant="light"
          size="md"
          fullWidth
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={handleWrongEmail}
        >
          Use a different email
        </Button>
      </div>
    </AuthLayout>
  );
}
