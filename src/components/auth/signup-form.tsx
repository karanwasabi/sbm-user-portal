'use client';

import Link from 'next/link';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { createAccount } from '@/app/(auth)/signup/actions';
import { DpdpConsentCheckbox } from '@/components/auth/dpdp-consent-checkbox';
import { PasswordField } from '@/components/auth/password-field';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthCardBody, AuthCardFooterSpacer, AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { PASSWORD_REQUIREMENTS_COPY } from '@/lib/password-requirements';
import type { CreateAccountState, SignupAccountField } from '@/types/signup';

const initialAccountState: CreateAccountState = { error: null, success: false };

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);

  const [accountState, createAccountAction, accountPending] = useActionState(createAccount, initialAccountState);

  const [displayAccountError, setDisplayAccountError] = useState<string | null>(null);
  const [displayAccountErrorFields, setDisplayAccountErrorFields] = useState<SignupAccountField[]>([]);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const dpdpConsentRef = useRef<HTMLButtonElement>(null);
  const accountWasPending = useRef(false);

  useEffect(() => {
    if (accountWasPending.current && !accountPending) {
      setDisplayAccountError(accountState.error);
      setDisplayAccountErrorFields(accountState.errorFields ?? []);
      if (accountState.error && accountState.focusField) {
        if (accountState.focusField === 'dpdpConsent') {
          dpdpConsentRef.current?.focus();
        } else {
          const refs = {
            email: emailRef,
            password: passwordRef,
            confirmPassword: confirmRef,
          } as const;
          refs[accountState.focusField].current?.focus();
        }
      }
    }
    accountWasPending.current = accountPending;
  }, [accountPending, accountState.error, accountState.focusField, accountState.errorFields]);

  const clearAccountError = () => {
    if (displayAccountError) setDisplayAccountError(null);
    if (displayAccountErrorFields.length > 0) setDisplayAccountErrorFields([]);
  };

  const accountFieldError = (field: SignupAccountField) => displayAccountErrorFields.includes(field);
  const dpdpConsentError = accountFieldError('dpdpConsent');

  return (
    <AuthLayout variant="account">
      <div className="mb-7 shrink-0">
        <SbmWordmark size="lg" />
      </div>

      <AuthCardBody variant="account">
        <SectionHead
          title="Create your account"
          subtitle="Enter your email and choose a password to get started."
          className="mb-5 shrink-0"
        />

        <form action={createAccountAction} className="flex flex-1 flex-col gap-3.5">
          <input type="hidden" name="dpdpConsent" value={dpdpConsent ? 'true' : 'false'} />
          <Field label="Email">
            <TextInput
              ref={emailRef}
              name="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                clearAccountError();
              }}
              placeholder="you@example.com"
              autoComplete="email"
              type="email"
              disabled={accountPending}
              leftIcon={<Mail className="h-4 w-4" />}
              error={accountFieldError('email')}
            />
          </Field>

          <PasswordField
            name="password"
            label="Password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              clearAccountError();
            }}
            showPassword={showPassword}
            onToggleShow={() => setShowPassword(!showPassword)}
            autoComplete="new-password"
            disabled={accountPending}
            error={accountFieldError('password')}
            inputRef={passwordRef}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              clearAccountError();
            }}
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            autoComplete="new-password"
            disabled={accountPending}
            error={accountFieldError('confirmPassword')}
            inputRef={confirmRef}
          />

          <p className="text-xs leading-relaxed text-slate-500">{PASSWORD_REQUIREMENTS_COPY}</p>

          <DpdpConsentCheckbox
            checked={dpdpConsent}
            onChange={(checked) => {
              setDpdpConsent(checked);
              clearAccountError();
            }}
            disabled={accountPending}
            error={dpdpConsentError}
            inputRef={dpdpConsentRef}
          />

          <div
            className="min-h-6 py-0.5"
            role={displayAccountError && !dpdpConsentError ? 'alert' : undefined}
            aria-live="polite"
          >
            {displayAccountError && !dpdpConsentError ? (
              <p className="text-[12.5px] leading-snug font-semibold text-danger-press">{displayAccountError}</p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-3.5">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={accountPending}
              rightIcon={
                accountPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />
              }
            >
              Continue
            </Button>

            <p className="text-center text-[13px] font-medium text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-brand no-underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </AuthCardBody>
    </AuthLayout>
  );
}
