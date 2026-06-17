'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { resendEmailOtp, restartSignup, verifyEmailOtp } from '@/app/(auth)/signup/actions';
import { AuthCardBody, AuthCardFooterSpacer, AuthLayout } from '@/components/layout/auth-layout';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import { OTP_RESEND_COOLDOWN_SECONDS } from '@/lib/onboarding-steps';
import type { ResendOtpState, VerifyEmailState } from '@/types/signup';
import { ArrowRight, Loader2, Mail } from 'lucide-react';

const initialVerifyState: VerifyEmailState = { error: null, success: false };
const initialResendState: ResendOtpState = { error: null, success: false };

const linkButtonClass =
  'shrink-0 cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-brand no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-60';

function parseResendCooldownSeconds(message: string): number | null {
  const match = message.match(/after (\d+) seconds?/i);
  if (!match) return null;
  const seconds = Number.parseInt(match[1], 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

type VerifyEmailFormProps = {
  email: string;
};

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);

  const [verifyState, verifyAction, verifyPending] = useActionState(verifyEmailOtp, initialVerifyState);
  const [resendState, resendAction, resendPending] = useActionState(resendEmailOtp, initialResendState);

  const otpRef = useRef<HTMLInputElement>(null);
  const verifyWasPending = useRef(false);
  const resendWasPending = useRef(false);

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
    if (resendWasPending.current && !resendPending) {
      if (resendState.error) {
        toast({ message: resendState.error, variant: 'error', durationMs: 5000 });
        const seconds = parseResendCooldownSeconds(resendState.error);
        setResendCooldown(seconds ?? OTP_RESEND_COOLDOWN_SECONDS);
      }

      if (resendState.success) {
        toast({ message: 'A new verification code has been sent.', variant: 'success', durationMs: 5000 });
        setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      }
    }
    resendWasPending.current = resendPending;
  }, [resendPending, resendState.error, resendState.success, toast]);

  const resendControl =
    resendCooldown > 0 ? (
      <span className="shrink-0 text-xs font-semibold text-slate-400">Resend in {resendCooldown}s</span>
    ) : (
      <button type="submit" formAction={resendAction} disabled={resendPending} className={linkButtonClass}>
        {resendPending ? 'Sending…' : 'Resend code'}
      </button>
    );

  return (
    <AuthLayout variant="account">
      <div className="mb-7 shrink-0">
        <SbmWordmark size="lg" />
      </div>

      <AuthCardBody variant="account">
        <SectionHead
          title="Verify your email"
          subtitle="Enter the 6-digit code we sent to your inbox."
          className="mb-5 shrink-0"
        />

        <form action={verifyAction} className="flex flex-1 flex-col gap-3.5">
          <input type="hidden" name="email" value={email} />

          <Field
            label={
              <span className="flex w-full items-center justify-between gap-3">
                <span>Email</span>
                <button type="submit" formAction={restartSignup} className={linkButtonClass}>
                  Wrong email?
                </button>
              </span>
            }
          >
            <TextInput
              value={email}
              onChange={() => {}}
              readOnly
              tabIndex={-1}
              leftIcon={<Mail className="h-4 w-4" />}
              className="cursor-default border-slate-100 bg-canvas-cool"
            />
          </Field>

          <Field
            label={
              <span className="flex w-full items-center justify-between gap-3">
                <span>Verification code</span>
                {resendControl}
              </span>
            }
          >
            <TextInput
              ref={otpRef}
              name="otp"
              value={otp}
              onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={verifyPending}
              error={Boolean(verifyState.error)}
              className="text-center text-base font-bold tracking-[0.35em] tabular-nums"
            />
          </Field>

          <div className="min-h-6 py-0.5" role={verifyState.error ? 'alert' : undefined} aria-live="polite">
            {verifyState.error ? (
              <p className="text-[12.5px] leading-snug font-semibold text-danger-press">{verifyState.error}</p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-3.5">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={verifyPending || otp.length !== 6}
              rightIcon={
                verifyPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />
              }
            >
              Verify and continue
            </Button>

            <AuthCardFooterSpacer />
          </div>
        </form>
      </AuthCardBody>
    </AuthLayout>
  );
}
