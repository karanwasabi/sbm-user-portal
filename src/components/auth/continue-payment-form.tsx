'use client';

import Link from 'next/link';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import {
  resendContinuePaymentOtp,
  sendContinuePaymentOtp,
  verifyContinuePaymentOtp,
  type ContinuePaymentFocusField,
  type ContinuePaymentState,
  type SendContinuePaymentOtpState,
} from '@/app/(auth)/register/continue-payment/actions';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { EMAIL_OTP_MAX_LENGTH, isValidEmailOtp } from '@/lib/email-otp';
import { OTP_RESEND_COOLDOWN_SECONDS } from '@/lib/onboarding-steps';
import { markPortalLoginPending } from '@/lib/portal-login-pending';
import { readPaymentHandoffEmailFromCookie, rememberPaymentHandoffEmail } from '@/lib/payment-handoff';

const initialState: ContinuePaymentState = { error: null };
const initialSendOtpState: SendContinuePaymentOtpState = { error: null, sent: false, email: null };

const linkButtonClass =
  'cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-brand no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-60';

type ContinuePaymentFormProps = {
  initialEmail?: string;
};

export function ContinuePaymentForm({ initialEmail = '' }: ContinuePaymentFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendOtpState, sendOtpAction, sendOtpPending] = useActionState(sendContinuePaymentOtp, initialSendOtpState);
  const [verifyOtpState, verifyOtpAction, verifyOtpPending] = useActionState(verifyContinuePaymentOtp, initialState);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [displayErrorFields, setDisplayErrorFields] = useState<ContinuePaymentFocusField[]>([]);
  const otpRef = useRef<HTMLInputElement>(null);
  const sendOtpWasPending = useRef(false);
  const verifyOtpWasPending = useRef(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      return;
    }
    const cookieEmail = readPaymentHandoffEmailFromCookie();
    if (cookieEmail) setEmail(cookieEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (!email) return;
    rememberPaymentHandoffEmail(email);
  }, [email]);

  useEffect(() => {
    if (sendOtpWasPending.current && !sendOtpPending) {
      setDisplayError(sendOtpState.error);
      setDisplayErrorFields(sendOtpState.error ? ['email'] : []);
    }
    sendOtpWasPending.current = sendOtpPending;
  }, [sendOtpPending, sendOtpState.error]);

  useEffect(() => {
    if (!sendOtpState.sent || !sendOtpState.email) return;
    setOtpSent(true);
    setEmail(sendOtpState.email);
    setDisplayError(null);
    setDisplayErrorFields([]);
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
  }, [sendOtpState.sent, sendOtpState.email]);

  useEffect(() => {
    if (!otpSent) return;
    const focusOtp = () => otpRef.current?.focus();
    const frame = requestAnimationFrame(focusOtp);
    const timer = window.setTimeout(focusOtp, 50);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [otpSent]);

  useEffect(() => {
    if (verifyOtpWasPending.current && !verifyOtpPending) {
      setDisplayError(verifyOtpState.error);
      setDisplayErrorFields(verifyOtpState.errorFields ?? []);
      if (verifyOtpState.error) {
        otpRef.current?.focus();
      }
    }
    verifyOtpWasPending.current = verifyOtpPending;
  }, [verifyOtpPending, verifyOtpState.error, verifyOtpState.errorFields]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const clearError = () => {
    if (displayError) setDisplayError(null);
    if (displayErrorFields.length > 0) setDisplayErrorFields([]);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    const result = await resendContinuePaymentOtp(email);
    if (result.error) {
      setDisplayError(result.error);
      setDisplayErrorFields(['email']);
      return;
    }
    setDisplayError(null);
    setDisplayErrorFields([]);
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    otpRef.current?.focus();
  };

  const error = displayError;
  const otpHasError = displayErrorFields.includes('otp');
  const formBusy = sendOtpPending || verifyOtpPending;

  const resendControl =
    resendCooldown > 0 ? (
      <span className="shrink-0 text-xs font-semibold text-slate-400">Resend in {resendCooldown}s</span>
    ) : (
      <button type="button" className={linkButtonClass} onClick={() => void handleResend()}>
        Resend code
      </button>
    );

  if (!email) {
    return (
      <AuthLayout>
        <div className="mb-7">
          <SbmWordmark size="lg" />
        </div>
        <p className="text-sm leading-snug text-slate-600">
          We couldn&apos;t identify your account from this link. Open the payment link shared with you, or sign in with
          the email used during registration.
        </p>
        <div className="mt-6">
          <Button href="/login" variant="primary" size="lg" fullWidth>
            Go to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
        <p className="text-sm font-semibold text-amber-900">This payment link has expired</p>
        <p className="mt-2 text-[13px] leading-snug text-amber-800">
          To finish enrollment and pay, we&apos;ll send a one-time sign-in code to:
        </p>
        <p className="mt-1.5 text-[15px] font-bold tracking-tight text-slate-900">{email}</p>
      </div>

      <div className="flex flex-col gap-3.5">
        {!otpSent ? (
          <form action={sendOtpAction}>
            <input type="hidden" name="email" value={email} />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={sendOtpPending}
              leftIcon={sendOtpPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            >
              {sendOtpPending ? 'Sending code…' : 'Send sign-in code'}
            </Button>
            <div className="min-h-6 py-0.5" role={error ? 'alert' : undefined} aria-live="polite">
              {error ? <p className="text-[12.5px] leading-snug font-semibold text-danger-press">{error}</p> : null}
            </div>
          </form>
        ) : (
          <form
            action={verifyOtpAction}
            className="flex flex-col gap-3.5"
            onSubmit={() => markPortalLoginPending('email_otp')}
          >
            <input type="hidden" name="email" value={email} />

            <p className="text-[13px] font-medium text-slate-500">
              Enter the code sent to <span className="font-semibold text-slate-700">{email}</span>
            </p>

            <Field
              label={
                <span className="flex w-full items-center justify-between gap-3">
                  <span>One-time code</span>
                  {resendControl}
                </span>
              }
              error={error && otpHasError ? error : undefined}
            >
              <TextInput
                ref={otpRef}
                name="otp"
                value={otp}
                onChange={(value) => {
                  setOtp(value.replace(/\D/g, '').slice(0, EMAIL_OTP_MAX_LENGTH));
                  clearError();
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                disabled={verifyOtpPending}
                error={otpHasError}
                placeholder="Enter code from email"
              />
            </Field>

            <div className="min-h-6 py-0.5" role={error && !otpHasError ? 'alert' : undefined} aria-live="polite">
              {error && !otpHasError ? (
                <p className="text-[12.5px] leading-snug font-semibold text-danger-press">{error}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={verifyOtpPending || !isValidEmailOtp(otp)}
              rightIcon={
                verifyOtpPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />
              }
            >
              {verifyOtpPending ? 'Signing in…' : 'Continue to payment'}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-5.5 text-center text-[13px] font-medium text-slate-500">
        Already signed in?{' '}
        <Link href="/login" className="font-bold text-brand no-underline">
          Go to login
        </Link>
      </p>
    </AuthLayout>
  );
}
