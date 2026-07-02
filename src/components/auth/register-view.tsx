'use client';

import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Loader2, LogOut, Mail } from 'lucide-react';
import {
  resendRegisterOtp,
  clearRegisterDraft,
  restartRegisterEditing,
  resetAssistedRegister,
  startRegister,
  verifyRegisterOtp,
} from '@/app/(auth)/register/actions';
import { DpdpConsentCheckbox } from '@/components/auth/dpdp-consent-checkbox';
import { RegisterCheckoutSection } from '@/components/auth/register-checkout-section';
import { PendingCheckoutRecovery } from '@/components/checkout/pending-checkout-recovery';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthCardBody, AuthLayout } from '@/components/layout/auth-layout';
import { ParentalConsentBlock } from '@/components/profile/parental-consent-block';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import {
  getDateOfBirthInputBounds,
  isParentalConsentValidationError,
  shouldShowParentalConsent,
  validateDateOfBirth,
} from '@/lib/date-of-birth';
import { EMAIL_OTP_MAX_LENGTH, isValidEmailOtp } from '@/lib/email-otp';
import { OTP_RESEND_COOLDOWN_SECONDS } from '@/lib/onboarding-steps';
import {
  firstRegisterFieldError,
  validateRegisterForm,
  type RegisterField,
  type RegisterFieldErrors,
} from '@/lib/register-form-validation';
import { parseWhatsapp } from '@/lib/phone-number';
import { toTitleCase } from '@/lib/title-case';
import { SEX_OPTIONS } from '@/types/profile';
import type { Country } from '@/types/reference';
import type { BillingProfile } from '@/types/billing';
import type { RegisterFormValues } from '@/lib/merge-profile-patch';
import { profileToRegisterDefaults } from '@/lib/merge-profile-patch';
import { trackPortalSignUp } from '@/lib/gtag';
import { buildLoginUrl } from '@/lib/login-url';
import { cn } from '@/lib/cn';
import type { RegisterStartState, RegisterVerifyState } from '@/types/register';
import { getBillingProfileOrNull, getMyProfile } from '@/utils/client-api';
import { SearchableSelect } from '@/components/ui/searchable-select';

const initialStartState: RegisterStartState = { error: null, status: null, email: null };
const initialVerifyState: RegisterVerifyState = { error: null, verified: false };

const linkButtonClass =
  'shrink-0 cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-brand no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-60';

type RegisterViewProps = {
  initialValues?: RegisterFormValues | null;
  emailVerified?: boolean;
  showVerifiedToast?: boolean;
  initialDpdpConsent?: boolean;
  fromDraft?: boolean;
  countries: Country[];
  suggestedCountryIso?: string;
  /** Restored from register draft cookie when the user picked a shared dial code (+1). */
  initialWhatsappDialIso?: string;
  assistedMode?: boolean;
  initialBillingProfile?: BillingProfile | null;
  registerPath?: string;
};

export function RegisterView({
  initialValues = null,
  emailVerified = false,
  showVerifiedToast = false,
  initialDpdpConsent = false,
  fromDraft = false,
  countries,
  suggestedCountryIso,
  initialWhatsappDialIso,
  assistedMode = false,
  initialBillingProfile = null,
  registerPath = '/register',
}: RegisterViewProps) {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(initialValues?.firstName ?? '');
  const [lastName, setLastName] = useState(initialValues?.lastName ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? '');
  const [whatsapp, setWhatsapp] = useState(initialValues?.whatsapp ?? '');
  const [sex, setSex] = useState<(typeof SEX_OPTIONS)[number]['value'] | ''>(initialValues?.sex ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(initialValues?.dateOfBirth ?? '');
  const [parentalConsent, setParentalConsent] = useState(initialValues?.parentalConsent ?? false);
  const [dpdpConsent, setDpdpConsent] = useState(initialDpdpConsent);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(emailVerified);
  const verifiedToastShown = useRef(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [phoneSyncToken, setPhoneSyncToken] = useState(0);
  const [phoneSuggestedCountryIso, setPhoneSuggestedCountryIso] = useState(suggestedCountryIso);
  const [whatsappDialIso, setWhatsappDialIso] = useState(() => {
    const fromDraft = initialWhatsappDialIso?.trim().toUpperCase();
    if (fromDraft) return fromDraft;
    const parsed = parseWhatsapp(initialValues?.whatsapp ?? '', suggestedCountryIso);
    return parsed.dialIso || suggestedCountryIso?.trim().toUpperCase() || '';
  });

  const [startState, startAction, startPending] = useActionState(startRegister, initialStartState);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyRegisterOtp, initialVerifyState);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const sexRef = useRef<HTMLButtonElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const parentalConsentRef = useRef<HTMLButtonElement>(null);
  const dpdpConsentRef = useRef<HTMLButtonElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const registerContentRef = useRef<HTMLDivElement>(null);
  const [registerContentHeight, setRegisterContentHeight] = useState<number | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const startWasPending = useRef(false);
  const signUpTracked = useRef(false);
  const dateOfBirthBounds = useMemo(() => getDateOfBirthInputBounds(), []);
  const showParentalConsent = useMemo(() => shouldShowParentalConsent(dateOfBirth), [dateOfBirth]);
  const suggestedLegalName = useMemo(
    () => [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
    [firstName, lastName]
  );
  const formValues = useMemo(
    () => ({
      firstName,
      lastName,
      email,
      whatsapp,
      sex,
      dateOfBirth,
      parentalConsent,
      dpdpConsent,
      whatsappDialIso: whatsappDialIso || undefined,
    }),
    [firstName, lastName, email, whatsapp, sex, dateOfBirth, parentalConsent, dpdpConsent, whatsappDialIso]
  );

  const dobLiveError = useMemo(
    () => (dateOfBirth ? validateDateOfBirth(dateOfBirth, parentalConsent) : null),
    [dateOfBirth, parentalConsent]
  );
  const showParentalConsentError = Boolean(
    fieldErrors.parentalConsent ?? (dobLiveError && isParentalConsentValidationError(dobLiveError))
  );
  const dateOfBirthDisplayError =
    fieldErrors.dateOfBirth ??
    (dobLiveError && !isParentalConsentValidationError(dobLiveError) ? dobLiveError : undefined);
  const formLocked = otpSent && !verified;
  const profileHydrated = useRef(false);
  const existingAccountStatus =
    startState.status === 'already_enrolled' || startState.status === 'already_registered' ? startState.status : null;
  const [dismissedExistingAccount, setDismissedExistingAccount] = useState(false);
  const showExistingAccountNotice = Boolean(existingAccountStatus) && !dismissedExistingAccount;
  const loginUrl = useMemo(
    () =>
      buildLoginUrl(
        startState.status === 'already_registered' || startState.status === 'already_enrolled'
          ? (startState.email ?? email)
          : undefined
      ),
    [startState.status, startState.email, email]
  );

  useEffect(() => {
    setPhoneSuggestedCountryIso(suggestedCountryIso);
  }, [suggestedCountryIso]);

  const syncWhatsappDialIso = (whatsappValue: string, countryHint?: string) => {
    const hint = countryHint ?? phoneSuggestedCountryIso;
    if (!whatsappValue.trim()) {
      if (hint) setWhatsappDialIso(hint.trim().toUpperCase());
      return;
    }
    const dialIso = parseWhatsapp(whatsappValue, hint).dialIso;
    if (dialIso) setWhatsappDialIso(dialIso);
  };

  const applyRegisterDefaults = (defaults: RegisterFormValues, countryHint?: string) => {
    setFirstName((value) => defaults.firstName || value);
    setLastName((value) => defaults.lastName || value);
    setEmail((value) => defaults.email || value);
    setWhatsapp((value) => {
      const next = defaults.whatsapp || value;
      if (defaults.whatsapp?.trim() && defaults.whatsapp !== value) {
        setPhoneSyncToken((token) => token + 1);
        syncWhatsappDialIso(defaults.whatsapp, countryHint);
      }
      return next;
    });
    setSex((value) => defaults.sex || value);
    setDateOfBirth((value) => defaults.dateOfBirth || value);
    setParentalConsent((value) => defaults.parentalConsent || value);
  };

  useEffect(() => {
    if (!initialValues) return;
    applyRegisterDefaults(initialValues, suggestedCountryIso);
    if (initialValues.whatsapp?.trim()) {
      syncWhatsappDialIso(initialValues.whatsapp, suggestedCountryIso ?? initialWhatsappDialIso);
      setPhoneSyncToken((token) => token + 1);
    }
  }, [initialValues]);

  useEffect(() => {
    if (!verified || profileHydrated.current) return;

    const hasWhatsapp = Boolean(initialValues?.whatsapp?.trim());
    const hasCoreDetails =
      Boolean(initialValues?.firstName?.trim()) &&
      Boolean(initialValues?.lastName?.trim()) &&
      Boolean(initialValues?.email?.trim()) &&
      Boolean(initialValues?.sex) &&
      Boolean(initialValues?.dateOfBirth?.trim());

    if (hasCoreDetails && hasWhatsapp) {
      profileHydrated.current = true;
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const [profile, billing] = await Promise.all([getMyProfile(), getBillingProfileOrNull()]);
        if (cancelled || !profile) return;

        if (profile.country_code) {
          setPhoneSuggestedCountryIso(profile.country_code);
        }
        applyRegisterDefaults(
          profileToRegisterDefaults(profile, profile.email || email, billing?.legal_name),
          profile.country_code ?? undefined
        );
        profileHydrated.current = true;
      } catch {
        // Leave fields as-is; user can tap Edit details if needed.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verified, email, initialValues]);

  useEffect(() => {
    if (!showVerifiedToast || verifiedToastShown.current) return;
    verifiedToastShown.current = true;
    window.history.replaceState(null, '', registerPath);
    toast({ message: 'Your account has been verified.', variant: 'success', durationMs: 5000 });
  }, [showVerifiedToast, toast, registerPath]);

  const focusFieldRef = (field: RegisterField): RefObject<HTMLElement | null> | null => {
    const refs = {
      firstName: firstNameRef,
      email: emailRef,
      sex: sexRef,
      whatsapp: whatsappRef,
      dateOfBirth: dateOfBirthRef,
      parentalConsent: parentalConsentRef,
      dpdpConsent: dpdpConsentRef,
    } as const;
    return refs[field] ?? null;
  };

  const focusRegisterField = (field?: RegisterField) => {
    if (!field) return;
    focusFieldRef(field)?.current?.focus();
  };

  const clearFieldError = (field: RegisterField) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const runRegisterValidation = () => {
    const nextErrors = validateRegisterForm(formValues);
    setFieldErrors(nextErrors);
    focusRegisterField(firstRegisterFieldError(nextErrors));
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (!fromDraft) return;
    void clearRegisterDraft();
  }, [fromDraft]);

  useLayoutEffect(() => {
    if (showExistingAccountNotice) return;

    const node = registerContentRef.current;
    if (!node) return;

    const measure = () => {
      setRegisterContentHeight(node.offsetHeight);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [showExistingAccountNotice, verified, otpSent, startPending, countries.length]);

  useEffect(() => {
    if (startWasPending.current && !startPending) {
      if (startState.fieldErrors && Object.keys(startState.fieldErrors).length > 0) {
        setOtpSent(false);
        setFieldErrors(startState.fieldErrors);
        focusRegisterField(startState.focusField);
      } else if (startState.error) {
        setOtpSent(false);
      } else if (startState.status === 'already_enrolled' || startState.status === 'already_registered') {
        setDismissedExistingAccount(false);
        setOtpSent(false);
      }
    }
    startWasPending.current = startPending;
  }, [startPending, startState.fieldErrors, startState.focusField, startState.error]);

  useEffect(() => {
    if (!startState.status || !startState.email) return;
    if (startState.status === 'already_registered' || startState.status === 'already_enrolled') return;
    setFieldErrors({});
    setOtpSent(true);
    setEmail(startState.email);
    setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
  }, [startState.status, startState.email]);

  useEffect(() => {
    if (!otpSent || verified) return;
    const focusOtp = () => otpRef.current?.focus();
    const frame = requestAnimationFrame(focusOtp);
    const timer = window.setTimeout(focusOtp, 50);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [otpSent, verified]);

  useEffect(() => {
    if (!verifyState.verified || signUpTracked.current) return;
    signUpTracked.current = true;
    trackPortalSignUp();
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
      {assistedMode ? <input type="hidden" name="assisted" value="1" /> : null}
      <input type="hidden" name="firstName" value={firstName} />
      <input type="hidden" name="lastName" value={lastName} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="whatsapp" value={whatsapp} />
      <input type="hidden" name="whatsappDialIso" value={whatsappDialIso} />
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

  const handleStartSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (verified) return;
    if (!runRegisterValidation()) {
      event.preventDefault();
      return;
    }
    setFormError(null);
  };

  const handleUseDifferentEmail = () => {
    setDismissedExistingAccount(true);
    setOtpSent(false);
    setOtp('');
    setResendCooldown(0);
    setFormError(null);
    emailRef.current?.focus();
  };

  const handleEditForm = () => {
    setOtpSent(false);
    setOtp('');
    setResendCooldown(0);
    setFormError(null);
    firstNameRef.current?.focus();
  };

  const resendControl =
    resendCooldown > 0 ? (
      <span className="shrink-0 text-xs font-semibold text-slate-400">Resend in {resendCooldown}s</span>
    ) : (
      <button type="button" className={linkButtonClass} onClick={() => void handleResend()}>
        Resend code
      </button>
    );

  return (
    <AuthLayout variant="register">
      <PendingCheckoutRecovery />
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <SbmWordmark size="lg" showSubtitle={false} />
        <div className="flex flex-col gap-2 sm:items-end">
          <h1 className="text-lg font-bold tracking-tight text-slate-800 sm:text-right sm:text-[17px] lg:text-lg">
            {assistedMode ? 'Assisted Registration' : 'Register for Take Control'}
          </h1>
          {assistedMode && (verified || otpSent) ? (
            <Button
              type="button"
              variant="light"
              size="sm"
              onClick={() => setLogoutDialogOpen(true)}
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
            >
              Log out
            </Button>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Log out for the next customer?"
        description="Only log out after you have shared the payment link with the customer. Logging out will clear this session and reset the form."
        confirmLabel="Log out"
        confirmVariant="danger"
        confirmPending={logoutPending}
        onConfirm={() => {
          setLogoutPending(true);
          void resetAssistedRegister().catch((err) => {
            if (isRedirectError(err)) throw err;
            setLogoutPending(false);
          });
        }}
      />

      <div
        className={cn(
          showExistingAccountNotice && 'mx-auto flex w-full max-w-lg flex-col justify-center',
          showExistingAccountNotice && !registerContentHeight && 'min-h-[44rem] lg:min-h-[26rem]'
        )}
        style={showExistingAccountNotice && registerContentHeight ? { minHeight: registerContentHeight } : undefined}
      >
        {showExistingAccountNotice ? (
          <div
            className="flex w-full flex-col gap-4 rounded-xl border border-danger-press/20 bg-danger-press/5 px-4 py-4 sm:px-5 sm:py-5"
            role="alert"
          >
            <div>
              <p className="text-base font-bold text-slate-900">
                {existingAccountStatus === 'already_enrolled'
                  ? 'This email is already enrolled'
                  : 'An account already exists'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {existingAccountStatus === 'already_enrolled' ? (
                  <>
                    <span className="font-semibold text-slate-900">{startState.email ?? email}</span> is linked to an
                    active Take Control enrollment. Registration can&apos;t continue with this email.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-slate-900">{startState.email ?? email}</span> is already
                    registered. Sign in instead of creating a new account.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button href={loginUrl} variant="primary" size="md" className="sm:w-auto">
                Sign in
              </Button>
              <button type="button" className={linkButtonClass} onClick={handleUseDifferentEmail}>
                Use a different email
              </button>
            </div>
          </div>
        ) : (
          <div ref={registerContentRef} className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,22rem)] lg:gap-8">
            <AuthCardBody variant="register" className="min-w-0">
              {verified ? (
                <form action={restartRegisterEditing} className="mb-2.5 flex justify-end">
                  {hiddenFields}
                  <button type="submit" className={linkButtonClass}>
                    Edit details
                  </button>
                </form>
              ) : null}

              <form action={startAction} onSubmit={handleStartSubmit} className="flex flex-col gap-2.5">
                {hiddenFields}

                {formLocked ? (
                  <div className="flex justify-end">
                    <button type="button" className={linkButtonClass} onClick={handleEditForm}>
                      Edit details
                    </button>
                  </div>
                ) : null}

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Field label="First name" error={fieldErrors.firstName}>
                    <TextInput
                      ref={firstNameRef}
                      value={firstName}
                      onChange={(value) => {
                        setFirstName(toTitleCase(value));
                        clearFieldError('firstName');
                      }}
                      placeholder="First name"
                      disabled={verified || formLocked}
                      autoFocus={!verified && !otpSent}
                      error={Boolean(fieldErrors.firstName)}
                    />
                  </Field>
                  <Field label="Last name">
                    <TextInput
                      value={lastName}
                      onChange={(value) => setLastName(toTitleCase(value))}
                      placeholder="Last name"
                      disabled={verified || formLocked}
                    />
                  </Field>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Field label="Email" error={fieldErrors.email}>
                    <TextInput
                      ref={emailRef}
                      value={email}
                      onChange={(value) => {
                        setEmail(value);
                        clearFieldError('email');
                      }}
                      type="email"
                      placeholder="you@example.com"
                      disabled={verified || formLocked}
                      error={Boolean(fieldErrors.email)}
                    />
                  </Field>

                  <Field label="Sex" error={fieldErrors.sex}>
                    <SearchableSelect
                      value={sex}
                      onChange={(value) => {
                        setSex(value as (typeof SEX_OPTIONS)[number]['value']);
                        clearFieldError('sex');
                      }}
                      options={SEX_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                      placeholder="Select sex"
                      searchPlaceholder="Search"
                      emptyMessage="No options found."
                      disabled={verified || formLocked}
                      focusRef={sexRef}
                      error={Boolean(fieldErrors.sex)}
                    />
                  </Field>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Field label="WhatsApp number" error={fieldErrors.whatsapp}>
                    <PhoneInput
                      value={whatsapp}
                      onChange={(value) => {
                        setWhatsapp(value);
                        clearFieldError('whatsapp');
                      }}
                      onDialIsoChange={setWhatsappDialIso}
                      countries={countries}
                      disabled={verified || formLocked}
                      dialCodeClassName="w-38 shrink-0"
                      suggestedCountryIso={whatsapp.trim() ? undefined : phoneSuggestedCountryIso}
                      preferredDialIso={whatsappDialIso || undefined}
                      syncToken={phoneSyncToken}
                      error={Boolean(fieldErrors.whatsapp)}
                      inputRef={whatsappRef}
                      useFieldFeedback
                    />
                  </Field>

                  <Field label="Date of birth" error={dateOfBirthDisplayError}>
                    <TextInput
                      ref={dateOfBirthRef}
                      value={dateOfBirth}
                      onChange={(value) => {
                        setDateOfBirth(value);
                        setParentalConsent(false);
                        clearFieldError('dateOfBirth');
                        clearFieldError('parentalConsent');
                      }}
                      type="date"
                      min={dateOfBirthBounds.min}
                      max={dateOfBirthBounds.max}
                      disabled={verified || formLocked}
                      error={Boolean(dateOfBirthDisplayError)}
                    />
                  </Field>
                </div>

                <div className={showParentalConsent ? 'my-1.5 flex flex-col gap-4' : 'my-1.5'}>
                  {showParentalConsent ? (
                    <ParentalConsentBlock
                      checked={parentalConsent}
                      onChange={(checked) => {
                        setParentalConsent(checked);
                        clearFieldError('parentalConsent');
                        clearFieldError('dateOfBirth');
                      }}
                      disabled={verified || formLocked}
                      error={showParentalConsentError}
                      inputRef={parentalConsentRef}
                    />
                  ) : null}

                  <DpdpConsentCheckbox
                    checked={dpdpConsent}
                    onChange={(checked) => {
                      setDpdpConsent(checked);
                      clearFieldError('dpdpConsent');
                    }}
                    disabled={verified || formLocked}
                    error={Boolean(fieldErrors.dpdpConsent)}
                    inputRef={dpdpConsentRef}
                  />
                </div>

                {!verified && !otpSent ? (
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={startPending}
                    leftIcon={
                      startPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />
                    }
                  >
                    {startPending ? 'Sending code…' : 'Generate OTP'}
                  </Button>
                ) : null}

                {startState.error && !verified ? (
                  <p className="text-[12.5px] font-semibold text-danger-press" role="alert">
                    {startState.error}
                  </p>
                ) : null}

                {formError && !verified ? (
                  <p className="text-[12.5px] font-semibold text-danger-press" role="alert">
                    {formError}
                  </p>
                ) : null}
              </form>

              {otpSent && !verified ? (
                <form action={verifyAction} className="mt-3 flex flex-col gap-2.5 border-t border-slate-100 pt-3">
                  {hiddenFields}
                  {startPending ? (
                    <p className="text-xs font-medium text-slate-500">Sending code to your email…</p>
                  ) : null}
                  <Field
                    label={
                      <span className="flex w-full items-center justify-between gap-3">
                        <span>OTP</span>
                        {resendControl}
                      </span>
                    }
                    error={verifyState.error}
                  >
                    <TextInput
                      ref={otpRef}
                      name="otp"
                      value={otp}
                      onChange={setOtp}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={EMAIL_OTP_MAX_LENGTH}
                      placeholder="Enter code from email"
                      disabled={startPending}
                      error={Boolean(verifyState.error)}
                    />
                  </Field>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={verifyPending || startPending || !isValidEmailOtp(otp)}
                    leftIcon={verifyPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                  >
                    {verifyPending ? 'Verifying…' : 'Confirm code'}
                  </Button>
                </form>
              ) : null}
            </AuthCardBody>

            <div className="min-w-0 border-t border-slate-100 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <RegisterCheckoutSection
                suggestedLegalName={suggestedLegalName}
                suggestedCountryIso={phoneSuggestedCountryIso}
                whatsappCountryIso={whatsappDialIso || undefined}
                countries={countries}
                enabled={verified}
                assistedMode={assistedMode}
                initialBillingProfile={initialBillingProfile}
              />
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
