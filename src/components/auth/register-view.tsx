'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { resendRegisterOtp, startRegister, verifyRegisterOtp } from '@/app/(auth)/register/actions';
import { DpdpConsentCheckbox } from '@/components/auth/dpdp-consent-checkbox';
import { RegisterCheckoutSection } from '@/components/auth/register-checkout-section';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthCardBody, AuthLayout } from '@/components/layout/auth-layout';
import { ParentalConsentBlock } from '@/components/profile/parental-consent-block';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { getDateOfBirthInputBounds, shouldShowParentalConsent, validateDateOfBirth } from '@/lib/date-of-birth';
import { emailOtpHint, EMAIL_OTP_MAX_LENGTH, isValidEmailOtp } from '@/lib/email-otp';
import { OTP_RESEND_COOLDOWN_SECONDS } from '@/lib/onboarding-steps';
import { toTitleCase } from '@/lib/title-case';
import { SEX_OPTIONS } from '@/types/profile';
import type { Country } from '@/types/reference';
import type { RegisterFormValues } from '@/lib/merge-profile-patch';
import type { RegisterStartState, RegisterVerifyState } from '@/types/register';
import { SearchableSelect } from '@/components/ui/searchable-select';

const initialStartState: RegisterStartState = { error: null, status: null, email: null };
const initialVerifyState: RegisterVerifyState = { error: null, verified: false };

type RegisterViewProps = {
  initialValues?: RegisterFormValues | null;
  emailVerified?: boolean;
  countries: Country[];
};

export function RegisterView({ initialValues = null, emailVerified = false, countries }: RegisterViewProps) {
  const [firstName, setFirstName] = useState(initialValues?.firstName ?? '');
  const [lastName, setLastName] = useState(initialValues?.lastName ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? '');
  const [whatsapp, setWhatsapp] = useState(initialValues?.whatsapp ?? '');
  const [sex, setSex] = useState<(typeof SEX_OPTIONS)[number]['value'] | ''>(initialValues?.sex ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(initialValues?.dateOfBirth ?? '');
  const [parentalConsent, setParentalConsent] = useState(initialValues?.parentalConsent ?? false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(emailVerified);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const [startState, startAction, startPending] = useActionState(startRegister, initialStartState);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyRegisterOtp, initialVerifyState);

  const otpRef = useRef<HTMLInputElement>(null);
  const dateOfBirthBounds = useMemo(() => getDateOfBirthInputBounds(), []);
  const showParentalConsent = useMemo(() => shouldShowParentalConsent(dateOfBirth), [dateOfBirth]);
  const dateOfBirthError = useMemo(
    () => (dateOfBirth ? validateDateOfBirth(dateOfBirth, parentalConsent) : null),
    [dateOfBirth, parentalConsent]
  );
  const defaultLegalName = useMemo(
    () => [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
    [firstName, lastName]
  );

  useEffect(() => {
    if (!startState.status || !startState.email) return;
    setOtpSent(true);
    setEmail(startState.email);
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    otpRef.current?.focus();
  }, [startState]);

  useEffect(() => {
    if (!verifyState.verified) return;
    setVerified(true);
    setFormError(null);
  }, [verifyState.verified]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const hiddenFields = (
    <>
      <input type="hidden" name="firstName" value={firstName} />
      <input type="hidden" name="lastName" value={lastName} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="whatsapp" value={whatsapp} />
      <input type="hidden" name="sex" value={sex} />
      <input type="hidden" name="dateOfBirth" value={dateOfBirth} />
      <input type="hidden" name="parentalConsent" value={parentalConsent ? 'true' : 'false'} />
      <input type="hidden" name="dpdpConsent" value={dpdpConsent ? 'true' : 'false'} />
    </>
  );

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const result = await resendRegisterOtp();
    if (result.error) {
      setFormError(result.error);
      return;
    }
    setFormError(null);
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
  };

  return (
    <AuthLayout variant="onboarding">
      <div className="mb-4 flex justify-center">
        <SbmWordmark />
      </div>

      <AuthCardBody variant="onboarding">
        <SectionHead
          title="Register for Take Control"
          subtitle="Create your account, verify your email, and enroll in one place."
        />

        <form action={startAction} className="flex flex-col gap-3.5">
          {hiddenFields}

          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="First name">
              <TextInput
                value={firstName}
                onChange={(value) => setFirstName(toTitleCase(value))}
                placeholder="First name"
                disabled={verified}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                value={lastName}
                onChange={(value) => setLastName(toTitleCase(value))}
                placeholder="Last name"
                disabled={verified}
              />
            </Field>
          </div>

          <Field label="Email">
            <TextInput
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@example.com"
              disabled={verified}
            />
          </Field>

          <Field label="WhatsApp number">
            <PhoneInput value={whatsapp} onChange={setWhatsapp} countries={countries} disabled={verified} />
          </Field>

          <Field label="Sex">
            <SearchableSelect
              value={sex}
              onChange={(value) => setSex(value as (typeof SEX_OPTIONS)[number]['value'])}
              options={SEX_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              placeholder="Select sex"
              searchPlaceholder="Search"
              emptyMessage="No options found."
              disabled={verified}
            />
          </Field>

          <Field label="Date of birth" error={dateOfBirthError ?? undefined}>
            <TextInput
              value={dateOfBirth}
              onChange={(value) => {
                setDateOfBirth(value);
                setParentalConsent(false);
              }}
              type="date"
              min={dateOfBirthBounds.min}
              max={dateOfBirthBounds.max}
              disabled={verified}
              error={Boolean(dateOfBirthError)}
            />
          </Field>

          {showParentalConsent ? (
            <ParentalConsentBlock checked={parentalConsent} onChange={setParentalConsent} disabled={verified} />
          ) : null}

          <DpdpConsentCheckbox checked={dpdpConsent} onChange={setDpdpConsent} disabled={verified} />

          {!verified ? (
            <Button type="submit" variant="primary" size="md" disabled={startPending || Boolean(dateOfBirthError)}>
              {startPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending code…
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Verify email
                </>
              )}
            </Button>
          ) : null}

          {(startState.error || formError) && !verified ? (
            <p className="text-[12.5px] font-semibold text-danger-press" role="alert">
              {startState.error ?? formError}
            </p>
          ) : null}
        </form>

        {otpSent && !verified ? (
          <form action={verifyAction} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
            {hiddenFields}
            <Field label="Verification code" hint={emailOtpHint()}>
              <TextInput
                ref={otpRef}
                name="otp"
                value={otp}
                onChange={setOtp}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={EMAIL_OTP_MAX_LENGTH}
                placeholder="Enter code from email"
              />
            </Field>
            <Button type="submit" variant="primary" size="md" disabled={verifyPending || !isValidEmailOtp(otp)}>
              {verifyPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                'Confirm code'
              )}
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-brand disabled:text-slate-400"
              disabled={resendCooldown > 0}
              onClick={() => void handleResend()}
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </button>
            {verifyState.error ? (
              <p className="text-[12.5px] font-semibold text-danger-press" role="alert">
                {verifyState.error}
              </p>
            ) : null}
          </form>
        ) : null}

        <div className="mt-6 border-t border-slate-100 pt-6">
          <RegisterCheckoutSection defaultLegalName={defaultLegalName} enabled={verified} />
        </div>
      </AuthCardBody>
    </AuthLayout>
  );
}
