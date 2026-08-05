'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { combineWhatsapp, formatPhoneE164, parseWhatsapp } from '@/lib/phone-number';
import { captureUtmAttributionFromLocation } from '@/lib/utm-attribution';
import { validateWhatsappNumber } from '@/lib/whatsapp-validation';
import {
  REFER_BLOCKED_DEFAULT,
  REFER_PAGE_SUBTITLE,
  REFER_PAGE_TITLE,
  REFER_REFERRED_SECTION,
  REFER_REFERRER_SECTION,
  REFER_SECTION_CARD_CLASS,
  isValidReferEmail,
  referSuccessMessage,
} from '@/components/refer/refer-page-helpers';
import type { ReferCheckReferredEmailResponse } from '@/types/refer';
import type { Country } from '@/types/reference';
import {
  postMeReferCheckReferredEmail,
  postMeReferSubmit,
  postReferCheckReferrerEmail,
  postReferCheckReferredEmail,
  postReferSubmit,
} from '@/utils/client-api';

type ReferPageViewProps = {
  variant: 'public' | 'portal';
  countries: Country[];
  suggestedCountryIso?: string;
  initialReferrerEmail?: string;
  initialReferrerFirstName?: string;
  initialReferrerLastName?: string;
  wrapInAuthLayout?: boolean;
};

export function ReferPageView({
  variant,
  countries,
  suggestedCountryIso,
  initialReferrerEmail = '',
  initialReferrerFirstName = '',
  initialReferrerLastName = '',
  wrapInAuthLayout = true,
}: ReferPageViewProps) {
  const { toast } = useToast();
  const isPortal = variant === 'portal';
  const hideReferrerEmail = isPortal || Boolean(initialReferrerEmail);

  const [referrerEmail, setReferrerEmail] = useState(initialReferrerEmail);
  const [referrerFirstName, setReferrerFirstName] = useState(initialReferrerFirstName);
  const [referrerLastName, setReferrerLastName] = useState(initialReferrerLastName);
  const [referredEmail, setReferredEmail] = useState('');
  const [referredFirstName, setReferredFirstName] = useState('');
  const [referredLastName, setReferredLastName] = useState('');
  const [referredWhatsapp, setReferredWhatsapp] = useState('');
  const [countryIso, setCountryIso] = useState(suggestedCountryIso ?? 'IN');
  const [whatsappDialIso, setWhatsappDialIso] = useState(suggestedCountryIso ?? 'IN');

  const [checkingReferrer, setCheckingReferrer] = useState(false);
  const [checkingReferred, setCheckingReferred] = useState(false);
  const [referredClassification, setReferredClassification] = useState<ReferCheckReferredEmailResponse | null>(null);
  const [referrerEmailError, setReferrerEmailError] = useState<string | null>(null);
  const [referredEmailError, setReferredEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const lastReferrerCheck = useRef('');
  const lastReferredCheck = useRef('');

  useEffect(() => {
    captureUtmAttributionFromLocation();
  }, []);

  const referredBlocked = referredClassification?.blocked === true;
  const referredEligible = referredClassification?.eligible === true && !referredBlocked && referredEmail.trim() !== '';
  const showReferredDetails =
    referredEmail.trim() !== '' && referredClassification !== null && !referredBlocked && !checkingReferred;

  const clearReferredState = () => {
    setReferredEmail('');
    setReferredFirstName('');
    setReferredLastName('');
    setReferredWhatsapp('');
    setReferredClassification(null);
    setReferredEmailError(null);
    lastReferredCheck.current = '';
    setSuccess(false);
    setSuccessMessage('');
  };

  const handleReferrerEmailBlur = async () => {
    if (hideReferrerEmail) return;

    const trimmed = referrerEmail.trim().toLowerCase();
    if (!trimmed) {
      setReferrerEmailError(null);
      return;
    }
    if (!isValidReferEmail(trimmed)) {
      setReferrerEmailError('That doesn’t look like a valid email.');
      return;
    }
    if (trimmed === lastReferrerCheck.current) return;

    setCheckingReferrer(true);
    setReferrerEmailError(null);
    try {
      const result = await postReferCheckReferrerEmail(trimmed);
      lastReferrerCheck.current = trimmed;
      if (result.first_name) setReferrerFirstName(result.first_name);
      if (result.last_name) setReferrerLastName(result.last_name);
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : 'Could not verify your email.',
        variant: 'error',
      });
    } finally {
      setCheckingReferrer(false);
    }
  };

  const handleReferredEmailBlur = async () => {
    const trimmed = referredEmail.trim().toLowerCase();
    if (!trimmed) {
      setReferredEmailError(null);
      setReferredClassification(null);
      return;
    }
    if (!isValidReferEmail(trimmed)) {
      setReferredEmailError('That doesn’t look like a valid email.');
      setReferredClassification(null);
      return;
    }
    if (trimmed === lastReferredCheck.current && referredClassification) return;

    setCheckingReferred(true);
    setReferredEmailError(null);
    try {
      const result = isPortal
        ? await postMeReferCheckReferredEmail(trimmed)
        : await postReferCheckReferredEmail(trimmed);
      lastReferredCheck.current = trimmed;
      setReferredClassification(result);
      if (!result.blocked) {
        if (result.first_name && !referredFirstName) setReferredFirstName(result.first_name);
        if (result.last_name && !referredLastName) setReferredLastName(result.last_name);
      }
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : 'Could not verify email.',
        variant: 'error',
      });
      setReferredClassification(null);
    } finally {
      setCheckingReferred(false);
    }
  };

  const handleReferrerEmailChange = (value: string) => {
    setReferrerEmail(value);
    if (value.trim().toLowerCase() !== lastReferrerCheck.current) {
      lastReferrerCheck.current = '';
    }
  };

  const handleReferredEmailChange = (value: string) => {
    setReferredEmail(value);
    if (value.trim().toLowerCase() !== lastReferredCheck.current) {
      lastReferredCheck.current = '';
      setReferredClassification(null);
      setReferredEmailError(null);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const trimmedReferrerEmail = hideReferrerEmail
      ? initialReferrerEmail.trim().toLowerCase()
      : referrerEmail.trim().toLowerCase();
    const trimmedReferredEmail = referredEmail.trim().toLowerCase();

    if (!hideReferrerEmail && !isValidReferEmail(trimmedReferrerEmail)) {
      setReferrerEmailError('That doesn’t look like a valid email.');
      return;
    }
    if (!referrerFirstName.trim()) {
      toast({ message: 'Please enter your first name.', variant: 'error' });
      return;
    }
    if (!isValidReferEmail(trimmedReferredEmail)) {
      setReferredEmailError('That doesn’t look like a valid email for your friend.');
      return;
    }
    if (!referredEligible) {
      toast({ message: 'Please wait until we’ve confirmed your friend can be referred.', variant: 'error' });
      return;
    }
    if (!referredFirstName.trim()) {
      toast({ message: 'Please enter your friend’s first name.', variant: 'error' });
      return;
    }

    const dialIso = whatsappDialIso || countryIso;
    const parsed = parseWhatsapp(referredWhatsapp, dialIso);
    const phoneError = validateWhatsappNumber(referredWhatsapp, dialIso);
    if (phoneError) {
      toast({ message: phoneError, variant: 'error' });
      return;
    }
    const e164 = formatPhoneE164(
      combineWhatsapp(parsed.dialCode, parsed.nationalNumber, parsed.dialIso || dialIso),
      dialIso
    );

    setSubmitting(true);
    try {
      const payload = {
        referrer_first_name: referrerFirstName.trim(),
        referrer_last_name: referrerLastName.trim(),
        referred_email: trimmedReferredEmail,
        referred_first_name: referredFirstName.trim(),
        referred_last_name: referredLastName.trim(),
        referred_phone: e164,
        referred_country_code: countryIso,
        referrer_consent: true,
      };

      if (isPortal) {
        await postMeReferSubmit(payload);
      } else {
        await postReferSubmit({
          ...payload,
          referrer_email: trimmedReferrerEmail,
        });
      }

      setSuccessMessage(referSuccessMessage(referredFirstName, referredLastName));
      setSuccess(true);
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : 'Could not submit referral. Please try again.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <div className={cn('mx-auto flex w-full max-w-[420px] flex-col gap-5 py-2', !wrapInAuthLayout && 'px-4 sm:px-6')}>
      <div className="text-center">
        {wrapInAuthLayout ? (
          <div className="mb-5 flex justify-center overflow-x-auto">
            <SbmWordmark size="lg" showSubtitle={false} />
          </div>
        ) : null}
        <h1 className="text-xl font-bold text-slate-900">{REFER_PAGE_TITLE}</h1>
        <p className="text-sm text-slate-600">{REFER_PAGE_SUBTITLE}</p>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-success/30 bg-success/5 px-5 py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
          <p className="text-sm font-medium text-slate-800">{successMessage}</p>
          <Button type="button" variant="primary" onClick={() => clearReferredState()}>
            Refer another friend
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <section className={cn(REFER_SECTION_CARD_CLASS, 'space-y-3.5')}>
            <h2 className="text-sm font-semibold text-slate-900">{REFER_REFERRER_SECTION}</h2>
            {!hideReferrerEmail ? (
              <Field label="Email" error={referrerEmailError}>
                <TextInput
                  type="email"
                  autoComplete="email"
                  value={referrerEmail}
                  onChange={handleReferrerEmailChange}
                  onBlur={() => void handleReferrerEmailBlur()}
                  error={Boolean(referrerEmailError)}
                />
                {checkingReferrer ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking your details…
                  </p>
                ) : null}
              </Field>
            ) : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="First name">
                <TextInput value={referrerFirstName} onChange={setReferrerFirstName} autoComplete="given-name" />
              </Field>
              <Field label="Last name">
                <TextInput value={referrerLastName} onChange={setReferrerLastName} autoComplete="family-name" />
              </Field>
            </div>
          </section>

          <section className={cn(REFER_SECTION_CARD_CLASS, 'space-y-3.5')}>
            <h2 className="text-sm font-semibold text-slate-900">{REFER_REFERRED_SECTION}</h2>
            <Field label="Email" error={referredEmailError}>
              <TextInput
                type="email"
                autoComplete="off"
                value={referredEmail}
                onChange={handleReferredEmailChange}
                onBlur={() => void handleReferredEmailBlur()}
                error={Boolean(referredEmailError)}
              />
              {checkingReferred ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking eligibility…
                </p>
              ) : null}
            </Field>
            {referredBlocked ? (
              <p className="rounded-xl border border-slate-200 bg-canvas-cool px-3.5 py-3 text-sm text-slate-700">
                {referredClassification?.blocked_reason ?? REFER_BLOCKED_DEFAULT}
              </p>
            ) : null}
            {showReferredDetails ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="First name">
                    <TextInput value={referredFirstName} onChange={setReferredFirstName} autoComplete="off" />
                  </Field>
                  <Field label="Last name">
                    <TextInput value={referredLastName} onChange={setReferredLastName} autoComplete="off" />
                  </Field>
                </div>
                <Field label="WhatsApp">
                  <PhoneInput
                    value={referredWhatsapp}
                    onChange={setReferredWhatsapp}
                    countries={countries}
                    suggestedCountryIso={suggestedCountryIso}
                    preferredDialIso={whatsappDialIso}
                    onDialIsoChange={(iso) => {
                      setWhatsappDialIso(iso);
                      setCountryIso(iso);
                    }}
                  />
                </Field>
              </>
            ) : null}
          </section>

          <Button
            type="button"
            variant="primary"
            className="w-full"
            disabled={submitting || !referredEligible}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </span>
            ) : (
              'Refer'
            )}
          </Button>
        </div>
      )}
    </div>
  );

  if (!wrapInAuthLayout) {
    return formContent;
  }

  return <AuthLayout variant="account">{formContent}</AuthLayout>;
}
