'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Cake, Loader2, LogOut } from 'lucide-react';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { completeOnboarding } from '@/app/(auth)/signup/actions';
import { signOut } from '@/app/(auth)/actions';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { ParentalConsentBlock } from '@/components/profile/parental-consent-block';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import {
  getDateOfBirthInputBounds,
  isParentalConsentValidationError,
  shouldShowParentalConsent,
  validateDateOfBirth,
} from '@/lib/date-of-birth';
import { getOnboardingStep, type OnboardingStep } from '@/lib/onboarding';
import { toTitleCase } from '@/lib/title-case';
import type { Profile } from '@/types/profile';
import type { Country } from '@/types/reference';
import type { CompleteOnboardingState } from '@/types/signup';

const initialCompleteState: CompleteOnboardingState = { error: null, success: false };

type OnboardingFormProps = {
  profile: Profile | null;
  email: string;
  showVerifiedToast?: boolean;
  countries: Country[];
};

export function OnboardingForm({ profile, email, showVerifiedToast = false, countries }: OnboardingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>(() => getOnboardingStep(profile));
  const [stepError, setStepError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth ?? '');
  const [parentalConsent, setParentalConsent] = useState(profile?.parental_consent ?? false);
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '');

  const [completeState, completeAction, completePending] = useActionState(completeOnboarding, initialCompleteState);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const verifiedToastShown = useRef(false);

  const dateOfBirthBounds = useMemo(() => getDateOfBirthInputBounds(), []);
  const showParentalConsent = useMemo(() => shouldShowParentalConsent(dateOfBirth), [dateOfBirth]);
  const dateOfBirthError = useMemo(
    () => (dateOfBirth ? validateDateOfBirth(dateOfBirth, parentalConsent) : null),
    [dateOfBirth, parentalConsent]
  );

  useEffect(() => {
    if (!showVerifiedToast || verifiedToastShown.current) return;
    verifiedToastShown.current = true;
    toast({ message: 'Your account has been verified.', variant: 'success' });
  }, [showVerifiedToast, toast]);

  useEffect(() => {
    if (!completeState.success) return;
    router.push('/');
    router.refresh();
  }, [completeState.success, router]);

  useEffect(() => {
    if (step === 1) {
      firstNameRef.current?.focus();
    }
  }, [step]);

  const showParentalConsentError =
    showParentalConsent && !parentalConsent && isParentalConsentValidationError(stepError);

  const validateStep1 = (): string | null => {
    if (!firstName.trim()) return 'First name is required.';
    if (!dateOfBirth) return 'Date of birth is required.';
    if (dateOfBirthError) return dateOfBirthError;
    return null;
  };

  const handleContinueFromStep1 = () => {
    const error = validateStep1();
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep(2);
  };

  const handleBack = () => {
    setStepError(null);
    if (step > 1) setStep(1);
  };

  const handleDateOfBirthChange = (nextDateOfBirth: string) => {
    setDateOfBirth(nextDateOfBirth);
    setParentalConsent(false);
  };

  const stepTitle =
    step === 1
      ? { title: 'About you', subtitle: 'Tell us a little about yourself so we can personalise your program.' }
      : { title: 'WhatsApp number', subtitle: 'We use WhatsApp for coaching updates and session reminders.' };

  return (
    <AuthLayout wide>
      <div className="mb-6 flex items-start justify-between gap-4">
        <SbmWordmark size="lg" />
        <form action={signOut}>
          <Button type="submit" variant="light" size="sm" leftIcon={<LogOut className="h-4 w-4" />}>
            Log out
          </Button>
        </form>
      </div>

      <p className="mb-5 text-[13px] font-medium text-slate-500">
        Signed in as <span className="font-semibold text-slate-800">{email}</span>
      </p>

      <SectionHead title={stepTitle.title} subtitle={stepTitle.subtitle} className="mb-5" />

      {step === 1 ? (
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="First name">
              <TextInput
                ref={firstNameRef}
                value={firstName}
                onChange={(value) => setFirstName(toTitleCase(value))}
                placeholder="First name"
              />
            </Field>
            <Field label="Last name">
              <TextInput
                value={lastName}
                onChange={(value) => setLastName(toTitleCase(value))}
                placeholder="Last name"
              />
            </Field>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Field
                label="Date of birth"
                hint={showParentalConsent ? 'Members aged 13–17 must complete parental consent below.' : undefined}
                error={dateOfBirthError && !showParentalConsentError ? dateOfBirthError : undefined}
              >
                <TextInput
                  value={dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  type="date"
                  min={dateOfBirthBounds.min}
                  max={dateOfBirthBounds.max}
                  error={Boolean(dateOfBirthError) && !showParentalConsentError}
                  leftIcon={<Cake size={16} className="text-slate-400" />}
                />
              </Field>
              {showParentalConsent ? (
                <ParentalConsentBlock
                  checked={parentalConsent}
                  onChange={(checked) => {
                    setParentalConsent(checked);
                    if (checked) setStepError(null);
                  }}
                  error={showParentalConsentError}
                />
              ) : null}
            </div>
          </div>

          {stepError && !showParentalConsentError ? (
            <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
              {stepError}
            </p>
          ) : null}

          <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleContinueFromStep1}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <form action={completeAction} className="flex flex-col gap-3.5">
          <input type="hidden" name="firstName" value={firstName} />
          <input type="hidden" name="lastName" value={lastName} />
          <input type="hidden" name="dateOfBirth" value={dateOfBirth} />
          <input type="hidden" name="parentalConsent" value={parentalConsent ? 'true' : 'false'} />
          <input type="hidden" name="whatsapp" value={whatsapp} />

          <Field label="WhatsApp number">
            <PhoneInput value={whatsapp} onChange={setWhatsapp} countries={countries} disabled={completePending} />
          </Field>

          {(stepError || completeState.error) && (
            <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
              {completeState.error ?? stepError}
            </p>
          )}

          <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-stretch gap-2.5">
              <Button
                type="button"
                variant="light"
                size="md"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={handleBack}
                disabled={completePending}
                className="shrink-0 px-4"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="flex-1"
                disabled={completePending}
                rightIcon={
                  completePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />
                }
              >
                Finish setup
              </Button>
            </div>
          </div>
        </form>
      ) : null}
    </AuthLayout>
  );
}
