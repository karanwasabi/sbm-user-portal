'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Cake, Loader2 } from 'lucide-react';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { completeOnboarding } from '@/app/(auth)/signup/actions';
import { AuthStepIndicator } from '@/components/auth/auth-step-indicator';
import { OnboardingSessionHeader } from '@/components/auth/onboarding-session-header';
import { AuthCardBody, AuthLayout } from '@/components/layout/auth-layout';
import { EnrollCheckoutPanel } from '@/components/programs/enroll-checkout-panel';
import { ParentalConsentBlock } from '@/components/profile/parental-consent-block';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import {
  getDateOfBirthInputBounds,
  isParentalConsentValidationError,
  shouldShowParentalConsent,
  validateDateOfBirth,
} from '@/lib/date-of-birth';
import { isProfileOnboardingComplete, getOnboardingStep, type OnboardingStep } from '@/lib/onboarding';
import { ONBOARDING_STEPS } from '@/lib/onboarding-steps';
import { toTitleCase } from '@/lib/title-case';
import type { Enrollment } from '@/types/enrollment';
import type { Profile } from '@/types/profile';
import type { Country } from '@/types/reference';
import type { CompleteOnboardingState } from '@/types/signup';

const initialCompleteState: CompleteOnboardingState = { error: null, success: false };

type OnboardingFormProps = {
  profile: Profile | null;
  email: string;
  enrollments: Enrollment[];
  showVerifiedToast?: boolean;
  countries: Country[];
};

export function OnboardingForm({
  profile,
  email,
  enrollments,
  showVerifiedToast = false,
  countries,
}: OnboardingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>(() => getOnboardingStep(profile, enrollments));
  const [stepError, setStepError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth ?? '');
  const [parentalConsent, setParentalConsent] = useState(profile?.parental_consent ?? false);
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '');

  const [completeState, completeAction, completePending] = useActionState(completeOnboarding, initialCompleteState);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const verifiedToastShown = useRef(false);
  const profileSavedRef = useRef(isProfileOnboardingComplete(profile));
  const savedFormSnapshotRef = useRef<string | null>(
    isProfileOnboardingComplete(profile)
      ? JSON.stringify({
          firstName: profile?.first_name ?? '',
          lastName: profile?.last_name ?? '',
          dateOfBirth: profile?.date_of_birth ?? '',
          parentalConsent: profile?.parental_consent ?? false,
          whatsapp: profile?.whatsapp ?? '',
        })
      : null
  );

  const buildFormSnapshot = () => JSON.stringify({ firstName, lastName, dateOfBirth, parentalConsent, whatsapp });

  const dateOfBirthBounds = useMemo(() => getDateOfBirthInputBounds(), []);
  const showParentalConsent = useMemo(() => shouldShowParentalConsent(dateOfBirth), [dateOfBirth]);
  const dateOfBirthError = useMemo(
    () => (dateOfBirth ? validateDateOfBirth(dateOfBirth, parentalConsent) : null),
    [dateOfBirth, parentalConsent]
  );

  useEffect(() => {
    if (!showVerifiedToast || verifiedToastShown.current) return;
    verifiedToastShown.current = true;

    window.history.replaceState(null, '', '/onboarding');
    toast({ message: 'Your account has been verified.', variant: 'success', durationMs: 5000 });
  }, [showVerifiedToast, toast]);

  useEffect(() => {
    if (!completeState.success) return;
    profileSavedRef.current = true;
    savedFormSnapshotRef.current = buildFormSnapshot();
    setStepError(null);
    setStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot only needed after a successful save
  }, [completeState]);

  useEffect(() => {
    if (step === 1) {
      firstNameRef.current?.focus();
    }
  }, [step]);

  const showParentalConsentError =
    showParentalConsent && !parentalConsent && isParentalConsentValidationError(stepError);

  const validateProfileStep = (): string | null => {
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!dateOfBirth) return 'Date of birth is required.';
    if (dateOfBirthError) return dateOfBirthError;
    if (!whatsapp.trim()) return 'WhatsApp number is required.';
    return null;
  };

  const handleContinueFromProfile = (event: React.MouseEvent<HTMLButtonElement>) => {
    const error = validateProfileStep();
    if (error) {
      event.preventDefault();
      setStepError(error);
      return;
    }
    setStepError(null);

    const snapshot = buildFormSnapshot();
    if (profileSavedRef.current && savedFormSnapshotRef.current === snapshot) {
      event.preventDefault();
      setStep(2);
    }
  };

  const handleBack = () => {
    setStepError(null);
    setStep(1);
  };

  const handleDateOfBirthChange = (nextDateOfBirth: string) => {
    setDateOfBirth(nextDateOfBirth);
    setParentalConsent(false);
  };

  const handlePaid = () => {
    router.push('/');
    router.refresh();
  };

  return (
    <AuthLayout variant="onboarding">
      <OnboardingSessionHeader email={email} />

      <AuthStepIndicator steps={ONBOARDING_STEPS} currentStep={step} ariaLabel="Onboarding progress" />

      <AuthCardBody variant="onboarding">
        {step === 1 ? (
          <form action={completeAction} className="flex flex-col gap-3.5">
            <input type="hidden" name="firstName" value={firstName} />
            <input type="hidden" name="lastName" value={lastName} />
            <input type="hidden" name="dateOfBirth" value={dateOfBirth} />
            <input type="hidden" name="parentalConsent" value={parentalConsent ? 'true' : 'false'} />
            <input type="hidden" name="whatsapp" value={whatsapp} />

            <div className="grid gap-3.5 sm:grid-cols-2">
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
            </div>
            <Field
              label="Date of birth"
              hint={showParentalConsent ? 'Parental consent required below for ages 13–17.' : undefined}
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
            <Field label="WhatsApp number">
              <PhoneInput
                name="whatsapp"
                value={whatsapp}
                onChange={setWhatsapp}
                countries={countries}
                disabled={completePending}
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

            {(stepError || completeState.error) && !showParentalConsentError ? (
              <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
                {completeState.error ?? stepError}
              </p>
            ) : null}

            <div className="border-t border-slate-100 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={completePending}
                onClick={handleContinueFromProfile}
                rightIcon={
                  completePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />
                }
              >
                Continue
              </Button>
            </div>
          </form>
        ) : null}

        {step === 2 ? <EnrollCheckoutPanel onBack={handleBack} onPaid={handlePaid} /> : null}
      </AuthCardBody>
    </AuthLayout>
  );
}
