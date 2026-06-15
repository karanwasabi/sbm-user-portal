'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Cake, Loader2, Mail } from 'lucide-react';
import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { completeRegistration, createAccount, loadSignupCountries } from '@/app/(auth)/signup/actions';
import { PasswordField } from '@/components/auth/password-field';
import { SignupStepIndicator } from '@/components/auth/signup-step-indicator';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { CityCombobox } from '@/components/profile/city-combobox';
import { CountryCombobox } from '@/components/profile/country-combobox';
import { MealPreferenceSelect } from '@/components/profile/meal-preference-select';
import { ParentalConsentBlock } from '@/components/profile/parental-consent-block';
import { PhoneInput } from '@/components/profile/phone-input';
import { SexSelect } from '@/components/profile/sex-select';
import { TimezonePicker } from '@/components/profile/timezone-picker';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { useLocationFields } from '@/hooks/use-location-fields';
import {
  getDateOfBirthInputBounds,
  isParentalConsentValidationError,
  shouldShowParentalConsent,
  validateDateOfBirth,
} from '@/lib/date-of-birth';
import { PASSWORD_REQUIREMENTS_COPY } from '@/lib/password-requirements';
import { toTitleCase } from '@/lib/title-case';
import type { MealPreference, Sex } from '@/types/profile';
import type { Country } from '@/types/reference';
import type { CompleteRegistrationState, CreateAccountState, SignupAccountField, SignupStep } from '@/types/signup';

const initialAccountState: CreateAccountState = { error: null, success: false };
const initialCompleteState: CompleteRegistrationState = { error: null, success: false };

const STEP_TITLES: Record<SignupStep, { title: string; subtitle: string }> = {
  1: {
    title: 'Create your account',
    subtitle: 'Enter your email and choose a password to get started.',
  },
  2: {
    title: 'About you',
    subtitle: 'Tell us a little about yourself so we can personalise your program.',
  },
  3: {
    title: 'Location & contact',
    subtitle: 'Helps your coach schedule sessions and reach you when needed.',
  },
  4: {
    title: 'Program fit',
    subtitle: 'One last detail so we can tailor your meal guidance.',
  },
};

type SignupStepFooterProps = {
  onBack: () => void;
  backDisabled?: boolean;
  children: ReactNode;
};

function SignupStepFooter({ onBack, backDisabled, children }: SignupStepFooterProps) {
  return (
    <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-4">
      <div className="flex items-stretch gap-2.5">
        <Button
          type="button"
          variant="light"
          size="md"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={onBack}
          disabled={backDisabled}
          className="shrink-0 px-4"
        >
          Back
        </Button>
        {children}
      </div>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState<Sex | ''>('');
  const [parentalConsent, setParentalConsent] = useState(false);

  const [countryCode, setCountryCode] = useState('');
  const [city, setCity] = useState('');
  const [timezoneId, setTimezoneId] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [mealPreference, setMealPreference] = useState<MealPreference | ''>('');

  const [accountState, createAccountAction, accountPending] = useActionState(createAccount, initialAccountState);
  const [completeState, completeRegistrationAction, completePending] = useActionState(
    completeRegistration,
    initialCompleteState
  );

  const [displayAccountError, setDisplayAccountError] = useState<string | null>(null);
  const [displayAccountErrorFields, setDisplayAccountErrorFields] = useState<SignupAccountField[]>([]);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const countryTriggerRef = useRef<HTMLButtonElement>(null);
  const mealTriggerRef = useRef<HTMLButtonElement>(null);
  const accountWasPending = useRef(false);

  const { citySuggestions, loadingCities, handleCountryChange, handleCitySuggestion } = useLocationFields({
    countries,
    countryCode,
    setCountryCode,
    setTimezoneId,
  });

  const dateOfBirthBounds = useMemo(() => getDateOfBirthInputBounds(), []);
  const showParentalConsent = useMemo(() => shouldShowParentalConsent(dateOfBirth), [dateOfBirth]);
  const dateOfBirthError = useMemo(
    () => (dateOfBirth ? validateDateOfBirth(dateOfBirth, parentalConsent) : null),
    [dateOfBirth, parentalConsent]
  );

  useEffect(() => {
    if (accountWasPending.current && !accountPending) {
      setDisplayAccountError(accountState.error);
      setDisplayAccountErrorFields(accountState.errorFields ?? []);
      if (accountState.error && accountState.focusField) {
        const refs = {
          email: emailRef,
          password: passwordRef,
          confirmPassword: confirmRef,
        } as const;
        refs[accountState.focusField].current?.focus();
      }
    }
    accountWasPending.current = accountPending;
  }, [accountPending, accountState.error, accountState.focusField, accountState.errorFields]);

  useEffect(() => {
    if (!accountState.success) return;

    let cancelled = false;
    setLoadingCountries(true);
    loadSignupCountries()
      .then((rows) => {
        if (!cancelled) setCountries(rows);
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false);
      });

    setStep(2);
    setStepError(null);

    return () => {
      cancelled = true;
    };
  }, [accountState.success]);

  useEffect(() => {
    if (!completeState.success) return;
    router.push('/');
    router.refresh();
  }, [completeState.success, router]);

  useEffect(() => {
    if (step > 1 && loadingCountries) return;

    function focusStepFirstField() {
      switch (step) {
        case 1:
          emailRef.current?.focus();
          break;
        case 2:
          firstNameRef.current?.focus();
          break;
        case 3:
          countryTriggerRef.current?.focus();
          break;
        case 4:
          mealTriggerRef.current?.focus();
          break;
      }
    }

    const frame = requestAnimationFrame(focusStepFirstField);
    const timer = window.setTimeout(focusStepFirstField, 100);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [step, loadingCountries]);

  const clearAccountError = () => {
    if (displayAccountError) setDisplayAccountError(null);
    if (displayAccountErrorFields.length > 0) setDisplayAccountErrorFields([]);
  };

  const accountFieldError = (field: SignupAccountField) => displayAccountErrorFields.includes(field);

  const showParentalConsentError =
    showParentalConsent && !parentalConsent && isParentalConsentValidationError(stepError);

  const validateStep2 = (): string | null => {
    if (!firstName.trim()) return 'First name is required.';
    if (!dateOfBirth) return 'Date of birth is required.';
    if (dateOfBirthError) return dateOfBirthError;
    if (!sex) return 'Please select your sex.';
    return null;
  };

  const validateStep3 = (): string | null => {
    if (!countryCode) return 'Country is required.';
    if (!timezoneId) return 'Timezone is required.';
    return null;
  };

  const handleContinueFromStep2 = () => {
    const error = validateStep2();
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep(3);
  };

  const handleContinueFromStep3 = () => {
    const error = validateStep3();
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep(4);
  };

  const handleBack = () => {
    setStepError(null);
    setStep((current) => (current > 1 ? ((current - 1) as SignupStep) : current));
  };

  const handleDateOfBirthChange = (nextDateOfBirth: string) => {
    setDateOfBirth(nextDateOfBirth);
    setParentalConsent(false);
  };

  const { title, subtitle } = STEP_TITLES[step];
  const isWide = step > 1;

  return (
    <AuthLayout wide={isWide}>
      <div className="mb-7">
        <SbmWordmark size="lg" />
      </div>

      <SignupStepIndicator currentStep={step} />
      <SectionHead title={title} subtitle={subtitle} className="mb-5" />

      {step === 1 ? (
        <form action={createAccountAction} className="flex flex-col gap-3.5">
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

          <div className="min-h-6 py-0.5" role={displayAccountError ? 'alert' : undefined} aria-live="polite">
            {displayAccountError ? (
              <p className="text-[12.5px] leading-snug font-semibold text-danger-press">{displayAccountError}</p>
            ) : null}
          </div>

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
        </form>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="First name">
              <TextInput
                ref={firstNameRef}
                value={firstName}
                onChange={(value) => setFirstName(toTitleCase(value))}
                placeholder="First name"
                disabled={loadingCountries}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                value={lastName}
                onChange={(value) => setLastName(toTitleCase(value))}
                placeholder="Last name"
                disabled={loadingCountries}
              />
            </Field>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Field
                label="Date of birth"
                error={dateOfBirthError && !showParentalConsentError ? dateOfBirthError : undefined}
                hint={showParentalConsent ? 'Members aged 13–17 must complete parental consent below.' : undefined}
              >
                <TextInput
                  value={dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  type="date"
                  min={dateOfBirthBounds.min}
                  max={dateOfBirthBounds.max}
                  disabled={loadingCountries}
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
                  disabled={loadingCountries}
                  error={showParentalConsentError}
                />
              ) : null}
            </div>
            <Field label="Sex" className="sm:col-span-2">
              <SexSelect value={sex} onChange={setSex} disabled={loadingCountries} />
            </Field>
          </div>

          {stepError && !showParentalConsentError ? (
            <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
              {stepError}
            </p>
          ) : null}

          <SignupStepFooter onBack={handleBack} backDisabled={loadingCountries}>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleContinueFromStep2}
              disabled={loadingCountries}
              rightIcon={loadingCountries ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              Continue
            </Button>
          </SignupStepFooter>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3.5">
            <Field label="Country">
              <CountryCombobox
                value={countryCode}
                onChange={handleCountryChange}
                countries={countries}
                disabled={loadingCountries}
                focusRef={countryTriggerRef}
              />
            </Field>
            <Field label="City" hint={loadingCities ? 'Loading suggestions…' : 'Start typing or pick a suggestion.'}>
              <CityCombobox
                value={city}
                onChange={setCity}
                suggestions={citySuggestions}
                onSuggestionSelect={handleCitySuggestion}
                disabled={loadingCountries}
                loading={loadingCities}
              />
            </Field>
            <Field label="Timezone">
              <TimezonePicker value={timezoneId} onChange={setTimezoneId} disabled={loadingCountries} />
            </Field>
            <Field label="Mobile (WhatsApp)">
              <PhoneInput
                value={whatsapp}
                onChange={setWhatsapp}
                countries={countries}
                suggestedCountryIso={countryCode}
                disabled={loadingCountries}
              />
            </Field>
          </div>

          {stepError ? (
            <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
              {stepError}
            </p>
          ) : null}

          <SignupStepFooter onBack={handleBack}>
            <Button type="button" variant="primary" size="md" className="flex-1" onClick={handleContinueFromStep3}>
              Continue
            </Button>
          </SignupStepFooter>
        </div>
      ) : null}

      {step === 4 ? (
        <form action={completeRegistrationAction} className="flex flex-col gap-3.5">
          <input type="hidden" name="firstName" value={firstName} />
          <input type="hidden" name="lastName" value={lastName} />
          <input type="hidden" name="dateOfBirth" value={dateOfBirth} />
          <input type="hidden" name="sex" value={sex} />
          <input type="hidden" name="countryCode" value={countryCode} />
          <input type="hidden" name="city" value={city} />
          <input type="hidden" name="timezoneId" value={timezoneId} />
          <input type="hidden" name="whatsapp" value={whatsapp} />
          <input type="hidden" name="parentalConsent" value={parentalConsent ? 'true' : 'false'} />
          <input type="hidden" name="mealPreference" value={mealPreference} />

          <Field label="Meal preference">
            <MealPreferenceSelect
              value={mealPreference}
              onChange={setMealPreference}
              disabled={completePending}
              focusRef={mealTriggerRef}
            />
          </Field>

          {(completeState.error || stepError) && (
            <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
              {completeState.error ?? stepError}
            </p>
          )}

          <SignupStepFooter onBack={handleBack} backDisabled={completePending}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              disabled={completePending}
              rightIcon={completePending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              onClick={(event) => {
                if (!mealPreference) {
                  event.preventDefault();
                  setStepError('Meal preference is required.');
                } else {
                  setStepError(null);
                }
              }}
            >
              Finish
            </Button>
          </SignupStepFooter>
        </form>
      ) : null}

      {step === 1 ? (
        <p className="mt-5.5 text-center text-[13px] font-medium text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand no-underline">
            Sign in
          </Link>
        </p>
      ) : null}
    </AuthLayout>
  );
}
