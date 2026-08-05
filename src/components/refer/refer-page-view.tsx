'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, Loader2 } from 'lucide-react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { ReferPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { combineWhatsapp, formatPhoneE164, parseWhatsapp } from '@/lib/phone-number';
import { captureUtmAttributionFromLocation } from '@/lib/utm-attribution';
import { trackPortalEvent } from '@/lib/gtag';
import { trackMetaCustom, trackMetaLead } from '@/lib/meta-pixel';
import { validateWhatsappNumber } from '@/lib/whatsapp-validation';
import {
  REFER_BLOCKED_DEFAULT,
  REFER_PAGE_SUBTITLE,
  REFER_PAGE_TITLE,
  REFER_REFERRED_SECTION,
  REFER_REFERRER_SECTION,
  REFER_SAME_EMAIL_ERROR,
  isValidReferEmail,
  referEmailsMatch,
  referAnalyticsBase,
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

type ReferSectionAccent = 'slate' | 'brand';

function ReferFormSection({
  title,
  accent,
  titleVariant = 'underlined',
  children,
}: {
  title: string;
  accent: ReferSectionAccent;
  titleVariant?: 'underlined' | 'simple';
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      {titleVariant === 'simple' ? (
        <SectionHead title={title} className="mb-0" />
      ) : (
        <h2
          className={cn(
            'inline-block border-b-2 pb-2 text-base font-bold tracking-tight text-slate-900',
            accent === 'brand' ? 'border-brand' : 'border-slate-300'
          )}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

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
  const [referrerNameLocked, setReferrerNameLocked] = useState(false);
  const [referredEmailError, setReferredEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const lastReferrerCheck = useRef('');
  const lastReferredCheck = useRef('');

  useEffect(() => {
    captureUtmAttributionFromLocation();
  }, []);

  useEffect(() => {
    const params = referAnalyticsBase(variant, hideReferrerEmail);
    trackPortalEvent('portal_refer_page_viewed', params);
    trackMetaCustom('PortalReferPageViewed', params);
  }, [variant, hideReferrerEmail]);

  const referredBlocked = referredClassification?.blocked === true;
  const activeReferrerEmail = hideReferrerEmail
    ? initialReferrerEmail.trim().toLowerCase()
    : referrerEmail.trim().toLowerCase();
  const referredEmailNormalized = referredEmail.trim().toLowerCase();
  const sameReferrerAndFriendEmail = referEmailsMatch(activeReferrerEmail, referredEmailNormalized);
  const referredEligible =
    referredClassification?.eligible === true &&
    !referredBlocked &&
    referredEmailNormalized !== '' &&
    !sameReferrerAndFriendEmail;

  const rejectSameFriendEmail = (referred: string) => {
    if (!referEmailsMatch(activeReferrerEmail, referred)) return false;
    setReferredEmailError(REFER_SAME_EMAIL_ERROR);
    setReferredClassification(null);
    lastReferredCheck.current = '';
    return true;
  };

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

  const handleReferAnotherFriend = () => {
    const params = referAnalyticsBase(variant, hideReferrerEmail);
    trackPortalEvent('portal_refer_another_clicked', params);
    trackMetaCustom('PortalReferAnotherClicked', params);
    clearReferredState();
  };

  const handleReferrerEmailBlur = async () => {
    if (hideReferrerEmail) return;

    const trimmed = referrerEmail.trim().toLowerCase();
    if (!trimmed) {
      setReferrerEmailError(null);
      setReferrerNameLocked(false);
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
      if (result.in_system) {
        setReferrerNameLocked(true);
        if (result.first_name) setReferrerFirstName(result.first_name);
        if (result.last_name) setReferrerLastName(result.last_name);
      } else {
        setReferrerNameLocked(false);
      }
      if (rejectSameFriendEmail(referredEmail.trim().toLowerCase())) {
        return;
      }
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
    if (rejectSameFriendEmail(trimmed)) {
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
        if (result.phone && !referredWhatsapp.trim()) setReferredWhatsapp(result.phone);
        if (result.country_code) {
          setCountryIso(result.country_code);
          setWhatsappDialIso(result.country_code);
        }
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
    const normalized = value.trim().toLowerCase();
    if (normalized !== lastReferrerCheck.current) {
      lastReferrerCheck.current = '';
      setReferrerNameLocked(false);
    }
    if (referEmailsMatch(normalized, referredEmail.trim().toLowerCase())) {
      setReferredEmailError(REFER_SAME_EMAIL_ERROR);
      setReferredClassification(null);
      lastReferredCheck.current = '';
    } else if (referredEmailError === REFER_SAME_EMAIL_ERROR) {
      setReferredEmailError(null);
    }
  };

  const handleReferredEmailChange = (value: string) => {
    setReferredEmail(value);
    const normalized = value.trim().toLowerCase();
    if (normalized !== lastReferredCheck.current) {
      lastReferredCheck.current = '';
      setReferredClassification(null);
      setReferredEmailError(null);
    }
    if (referEmailsMatch(activeReferrerEmail, normalized)) {
      setReferredEmailError(REFER_SAME_EMAIL_ERROR);
      setReferredClassification(null);
      lastReferredCheck.current = '';
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
    if (referEmailsMatch(trimmedReferrerEmail, trimmedReferredEmail)) {
      setReferredEmailError(REFER_SAME_EMAIL_ERROR);
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

      const response = isPortal
        ? await postMeReferSubmit(payload)
        : await postReferSubmit({
            ...payload,
            referrer_email: trimmedReferrerEmail,
          });

      const submitParams = {
        ...referAnalyticsBase(variant, hideReferrerEmail),
        referral_id: response.referral_id,
        lead_id: response.lead_id,
      };
      trackPortalEvent('portal_refer_submitted', submitParams);
      trackMetaCustom('PortalReferSubmitted', submitParams);
      if (response.is_new_referred_lead && response.capi_lead_sent) {
        trackMetaLead({ eventID: `lead:${response.lead_id}` });
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

  const successPanel = (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-success/30 bg-success/5 px-5 py-8 text-center">
      <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
      <p className="text-sm font-medium text-slate-800">{successMessage}</p>
      <Button type="button" variant="primary" onClick={handleReferAnotherFriend}>
        Refer another friend
      </Button>
    </div>
  );

  const sectionTitleVariant = hideReferrerEmail ? 'simple' : 'underlined';

  const referrerSection = !hideReferrerEmail ? (
    <ReferFormSection title={REFER_REFERRER_SECTION} accent="slate" titleVariant={sectionTitleVariant}>
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="First name">
          <TextInput
            value={referrerFirstName}
            onChange={setReferrerFirstName}
            autoComplete="given-name"
            disabled={referrerNameLocked}
          />
        </Field>
        <Field label="Last name">
          <TextInput
            value={referrerLastName}
            onChange={setReferrerLastName}
            autoComplete="family-name"
            disabled={referrerNameLocked}
          />
        </Field>
      </div>
    </ReferFormSection>
  ) : null;

  const friendSection = (
    <ReferFormSection title={REFER_REFERRED_SECTION} accent="brand" titleVariant={sectionTitleVariant}>
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
        <div className="flex gap-3 rounded-[14px] border border-slate-200 bg-canvas-cool px-4 py-3.5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <p className="text-sm leading-relaxed text-slate-700">
            {referredClassification?.blocked_reason ?? REFER_BLOCKED_DEFAULT}
          </p>
        </div>
      ) : (
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
              className="flex-col sm:flex-row sm:items-start"
              dialCodeClassName="w-full sm:w-35 sm:shrink-0"
              mobileClassName="w-full sm:flex-1"
            />
          </Field>
        </>
      )}
    </ReferFormSection>
  );

  const submitButton = (
    <Button
      type="button"
      variant="primary"
      size="lg"
      className="w-full"
      disabled={submitting || !referredEligible}
      onClick={() => void handleSubmit()}
      rightIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
    >
      {submitting ? 'Submitting…' : 'Refer'}
    </Button>
  );

  const formBody = success ? (
    successPanel
  ) : (
    <div className="space-y-3">
      {referrerSection}
      <div className={cn(referrerSection && 'pt-4')}>{friendSection}</div>
      {submitButton}
    </div>
  );

  if (!wrapInAuthLayout) {
    return (
      <PortalPageLayout
        eyebrow="Referrals"
        title={REFER_PAGE_TITLE}
        description={REFER_PAGE_SUBTITLE}
        illustration={<ReferPageIllustration />}
        panelClassName="bg-gradient-to-br from-brand via-[#6A71E6] to-brand-deep"
        glowClassName="bg-white/25"
        highlights={[
          { label: 'Program', value: 'Take Control' },
          { label: 'Next step', value: 'We reach out' },
        ]}
      >
        <Card>{formBody}</Card>
      </PortalPageLayout>
    );
  }

  const authContent = (
    <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5 py-2">
      <div className="text-center">
        <div className="mb-5 flex justify-center overflow-x-auto">
          <SbmWordmark size="lg" showSubtitle={false} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{REFER_PAGE_TITLE}</h1>
        <p className="mt-1 text-sm text-slate-600">{REFER_PAGE_SUBTITLE}</p>
      </div>
      {formBody}
    </div>
  );

  return <AuthLayout variant="account">{authContent}</AuthLayout>;
}
