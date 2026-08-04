'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { EnrollConsentCheckbox } from '@/components/enroll/enroll-consent-checkbox';
import { renewPlanLabel } from '@/components/renew/renew-plan-label';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { CountryCombobox } from '@/components/profile/country-combobox';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import { getCountryDialCode } from '@/lib/country-dial-codes';
import { isValidEmailFormat } from '@/lib/email-validation';
import { formatInrFromPaise } from '@/lib/money';
import { combineWhatsapp, formatPhoneE164, parseWhatsapp } from '@/lib/phone-number';
import { normalizePromoCode, normalizePromoCodeInput, promoCodeInputProps } from '@/lib/promo-code';
import { clearRenewDraft, readRenewDraft, saveRenewDraft } from '@/lib/renew-draft';
import { openRazorpayOrderCheckout } from '@/lib/razorpay-checkout';
import { toTitleCase } from '@/lib/title-case';
import { captureUtmAttributionFromLocation, readUtmAttributionFromCookie } from '@/lib/utm-attribution';
import { validateWhatsappNumber } from '@/lib/whatsapp-validation';
import { trackPortalBeginCheckout } from '@/lib/gtag';
import { trackMetaBeginCheckout } from '@/lib/meta-pixel';
import {
  getRenewCheckoutPreview,
  getTrialCheckoutPreview,
  postRenewCheckEmail,
  postRenewCheckoutQuote,
  pollUntilRenewPaymentConfirmed,
  startRenewCheckout,
} from '@/utils/client-api';
import type { Country } from '@/types/reference';
import type { RenewCategory, RenewCheckEmailResponse, RenewCheckoutPreview, RenewQuote } from '@/types/renew';
import type { TrialProduct, TrialQuote } from '@/types/trial';

type RenewPageViewProps = {
  countries: Country[];
  suggestedCountryIso?: string;
};

function formatAccessDate(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isNewUserCategory(category: RenewCategory | null) {
  return category === 'new_user' || category === 'new_lead_no_sub';
}

function isBlockedCategory(category: RenewCategory | null) {
  return category === 'newbie_auto_renew' || category === 'member_auto_renew';
}

export function RenewPageView({ countries, suggestedCountryIso }: RenewPageViewProps) {
  const { toast } = useToast();
  const [classification, setClassification] = useState<RenewCheckEmailResponse | null>(null);
  const [preview, setPreview] = useState<RenewCheckoutPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [countryIso, setCountryIso] = useState(suggestedCountryIso ?? 'IN');
  const [countryManuallySet, setCountryManuallySet] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [quotePending, setQuotePending] = useState(false);
  const [quotedTrialQuote, setQuotedTrialQuote] = useState<TrialQuote | null>(null);

  const [whatsappDialIso, setWhatsappDialIso] = useState(suggestedCountryIso ?? 'IN');
  const whatsappDialIsoRef = useRef(suggestedCountryIso);

  useEffect(() => {
    const draft = readRenewDraft();
    if (!draft) return;
    setFirstName(draft.firstName);
    setLastName(draft.lastName);
    setEmail(draft.email);
    setWhatsapp(draft.whatsapp);
    setCountryIso(draft.countryIso);
    setCountryManuallySet(draft.countryManuallySet);
    setWhatsappDialIso(draft.whatsappDialIso);
    whatsappDialIsoRef.current = draft.whatsappDialIso;
  }, []);

  useEffect(() => {
    captureUtmAttributionFromLocation();
  }, []);

  const category = classification?.category ?? null;

  useEffect(() => {
    if (!category || isBlockedCategory(category)) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);
    void (async () => {
      try {
        const data = await getRenewCheckoutPreview(category, countryIso);
        if (!cancelled) {
          setPreview(data);
          if (isNewUserCategory(category)) {
            setSelectedPlan((prev) => prev || data.trial_products?.[0] || 'trial_3m');
          } else if (data.plans && data.plans.length > 0) {
            setSelectedPlan((prev) => prev || data.plans![0].plan_key);
          }
        }
      } catch {
        if (!cancelled) toast({ message: 'Could not load pricing. Please refresh.', variant: 'error' });
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, countryIso, toast]);

  const [trialPreviewQuote, setTrialPreviewQuote] = useState<TrialQuote | null>(null);

  useEffect(() => {
    if (!isNewUserCategory(category) || !selectedPlan) {
      setTrialPreviewQuote(null);
      return;
    }
    const product = selectedPlan as TrialProduct;
    let cancelled = false;
    void (async () => {
      try {
        const data = await getTrialCheckoutPreview(product);
        const quote = countryIso === 'IN' ? data.domestic : data.international;
        if (!cancelled) setTrialPreviewQuote(quote);
      } catch {
        if (!cancelled) setTrialPreviewQuote(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, selectedPlan, countryIso]);

  const renewalQuote: RenewQuote | null = useMemo(() => {
    if (!preview?.plans || !selectedPlan) return null;
    const plan = preview.plans.find((p) => p.plan_key === selectedPlan);
    if (!plan) return null;
    return countryIso === 'IN' ? plan.domestic : plan.international;
  }, [preview, selectedPlan, countryIso]);

  const trialBaseQuote = trialPreviewQuote;
  const displayTrialQuote = selectedPlan === 'trial_3m' && appliedPromo ? quotedTrialQuote : trialBaseQuote;
  const displayTotalPaise = isNewUserCategory(category) ? displayTrialQuote?.total_paise : renewalQuote?.total_paise;

  const handleEmailBlur = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(null);
      setClassification(null);
      return;
    }
    if (!isValidEmailFormat(trimmed)) {
      setEmailError('That doesn’t look like a valid email.');
      setClassification(null);
      return;
    }
    setEmailError(null);
    setCheckingEmail(true);
    try {
      const result = await postRenewCheckEmail(trimmed);
      setClassification(result);
      if (result.first_name) setFirstName(result.first_name);
      if (result.last_name) setLastName(result.last_name);
      if (result.whatsapp) setWhatsapp(result.whatsapp);
      if (result.country_iso) setCountryIso(result.country_iso);
    } catch (err) {
      toast({ message: err instanceof Error ? err.message : 'Could not verify email.', variant: 'error' });
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!isNewUserCategory(category) || selectedPlan !== 'trial_3m') return;
    const normalized = normalizePromoCode(promoCode);
    if (!normalized) {
      setPromoError('Enter a discount code.');
      return;
    }
    setPromoCode(normalized);
    setPromoError(null);
    setQuotePending(true);
    try {
      const quote = await postRenewCheckoutQuote({
        category: category!,
        plan_key: 'trial_3m',
        country_code: countryIso,
        promo_code: normalized,
      });
      setAppliedPromo(normalized);
      setQuotedTrialQuote(quote as TrialQuote);
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : 'Failed to apply discount code.');
      setAppliedPromo('');
      setQuotedTrialQuote(null);
    } finally {
      setQuotePending(false);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!classification || !category) {
      setFormError('Enter your email so we can find your account.');
      return;
    }
    if (isBlockedCategory(category)) return;
    if (!selectedPlan) {
      setFormError('Select a plan to continue.');
      return;
    }
    if (!dpdpConsent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    const dialIso = whatsappDialIso || countryIso;
    const parsed = parseWhatsapp(whatsapp, dialIso);
    const whatsappError = validateWhatsappNumber(whatsapp, dialIso);
    if (whatsappError) {
      setFormError(whatsappError);
      return;
    }

    const whatsappE164 = formatPhoneE164(
      combineWhatsapp(parsed.dialCode, parsed.nationalNumber, parsed.dialIso || dialIso),
      dialIso
    );

    saveRenewDraft({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      whatsapp,
      countryIso,
      whatsappDialIso: dialIso,
      countryManuallySet,
    });

    setSubmitting(true);
    try {
      const start = await startRenewCheckout({
        category,
        plan_key: selectedPlan,
        first_name: toTitleCase(firstName.trim()),
        last_name: toTitleCase(lastName.trim()),
        email: email.trim().toLowerCase(),
        whatsapp: whatsappE164,
        country_code: countryIso,
        dpdp_consent: true,
        ...(readUtmAttributionFromCookie() ?? {}),
        ...(appliedPromo ? { promo_code: appliedPromo } : {}),
      });

      const welcomeUrl = `/welcome/renew?session=${encodeURIComponent(start.checkout_session_id)}`;
      const pricingRegion = start.pricing_region === 'international' ? 'international' : 'domestic';
      const checkoutValuePaise = displayTotalPaise ?? start.amount_paise;

      trackPortalBeginCheckout({
        valuePaise: checkoutValuePaise,
        cohortName: start.cohort_name,
        pricingRegion,
      });
      trackMetaBeginCheckout({ valuePaise: checkoutValuePaise });

      if (start.mock || !start.razorpay_key_id || !start.razorpay_order_id) {
        const ok = await pollUntilRenewPaymentConfirmed(start.checkout_session_id);
        if (ok) {
          window.location.href = welcomeUrl;
        } else {
          setFormError('Payment could not be confirmed. Please try again.');
        }
        return;
      }

      await openRazorpayOrderCheckout({
        key: start.razorpay_key_id,
        orderId: start.razorpay_order_id,
        customerId: start.razorpay_customer_id,
        description: renewPlanLabel(start.plan_key),
        pricingRegion: pricingRegion as 'domestic' | 'international',
        checkoutSessionId: start.checkout_session_id,
        returnDestination: welcomeUrl,
        returnFlow: 'renew',
        prefill: {
          name: `${firstName} ${lastName}`.trim(),
          email: email.trim(),
          contact: whatsappE164,
          contactCountryIso: dialIso,
        },
        pendingCheckout: {
          valuePaise: start.amount_paise,
          cohortName: start.cohort_name,
          pricingRegion,
          renewPlanKey: start.plan_key,
        },
        onSuccess: () => {
          window.location.href = welcomeUrl;
        },
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="account">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5 py-2">
        <div className="flex flex-col gap-1 text-center">
          <SbmWordmark size="lg" showSubtitle={false} className="mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Renew or join Take Control</h1>
          <p className="text-sm text-slate-600">Enter your email to see the right plan for you.</p>
        </div>

        <Field label="Email" error={emailError}>
          <TextInput
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            onBlur={() => void handleEmailBlur()}
            error={Boolean(emailError)}
          />
          {checkingEmail ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking…
            </p>
          ) : null}
        </Field>

        {classification && isBlockedCategory(category) ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Auto-renew is already on</p>
            <p className="mt-1">
              {classification.next_renewal_at
                ? `Your next renewal is on ${formatAccessDate(classification.next_renewal_at) ?? classification.next_renewal_at}.`
                : 'Your membership renews automatically — no payment needed here.'}
            </p>
          </div>
        ) : null}

        {classification && !isBlockedCategory(category) ? (
          <>
            {classification.access_until ? (
              <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-slate-700">
                Access until{' '}
                <span className="font-semibold text-slate-900">
                  {formatAccessDate(classification.access_until) ?? classification.access_until}
                </span>
              </div>
            ) : null}

            {loadingPreview || !preview ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
                Loading plans…
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-900">Choose a plan</p>
                <div className="flex flex-col gap-2">
                  {isNewUserCategory(category)
                    ? (preview.trial_products ?? []).map((planKey) => (
                        <button
                          key={planKey}
                          type="button"
                          onClick={() => setSelectedPlan(planKey)}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            selectedPlan === planKey
                              ? 'border-brand bg-brand/5 ring-1 ring-brand'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span className="font-semibold text-slate-900">{renewPlanLabel(planKey)}</span>
                        </button>
                      ))
                    : (preview.plans ?? []).map((plan) => {
                        const quote = countryIso === 'IN' ? plan.domestic : plan.international;
                        return (
                          <button
                            key={plan.plan_key}
                            type="button"
                            onClick={() => setSelectedPlan(plan.plan_key)}
                            className={`rounded-xl border px-4 py-3 text-left transition ${
                              selectedPlan === plan.plan_key
                                ? 'border-brand bg-brand/5 ring-1 ring-brand'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900">{renewPlanLabel(plan.plan_key)}</span>
                              <span className="text-sm font-bold text-slate-900">
                                {formatInrFromPaise(quote.total_paise)}
                              </span>
                            </div>
                            {plan.discount_label ? (
                              <p className="mt-0.5 text-xs text-brand">{plan.discount_label}</p>
                            ) : null}
                          </button>
                        );
                      })}
                </div>

                {preview.starts_on ? (
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 text-brand" />
                    Cohort starts {preview.starts_on}
                  </p>
                ) : null}

                {selectedPlan === 'trial_3m' && isNewUserCategory(category) ? (
                  <div className="flex flex-col gap-2">
                    <Field label="Discount code">
                      <div className="flex gap-2">
                        <TextInput
                          value={promoCode}
                          onChange={(value) => setPromoCode(normalizePromoCodeInput(value))}
                          {...promoCodeInputProps}
                        />
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => void handleApplyPromo()}
                          disabled={quotePending}
                        >
                          Apply
                        </Button>
                      </div>
                      {promoError ? <p className="text-xs text-red-600">{promoError}</p> : null}
                    </Field>
                  </div>
                ) : null}

                {displayTotalPaise ? (
                  <p className="text-center text-sm text-slate-600">
                    Total <span className="font-bold text-slate-900">{formatInrFromPaise(displayTotalPaise)}</span>
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Field label="First name">
                <TextInput value={firstName} onChange={setFirstName} autoComplete="given-name" />
              </Field>
              <Field label="Last name">
                <TextInput value={lastName} onChange={setLastName} autoComplete="family-name" />
              </Field>
              <Field label="WhatsApp">
                <PhoneInput
                  value={whatsapp}
                  onChange={setWhatsapp}
                  dialIso={whatsappDialIso}
                  onDialIsoChange={(iso) => {
                    whatsappDialIsoRef.current = iso;
                    setWhatsappDialIso(iso);
                    if (!countryManuallySet && iso) setCountryIso(iso);
                  }}
                  defaultDialCode={getCountryDialCode(countryIso)}
                />
              </Field>
              <Field label="Country">
                <CountryCombobox
                  countries={countries}
                  value={countryIso}
                  onChange={(iso) => {
                    setCountryIso(iso);
                    setCountryManuallySet(true);
                  }}
                />
              </Field>
            </div>

            <EnrollConsentCheckbox checked={dpdpConsent} onChange={setDpdpConsent} error={consentError} />

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting || loadingPreview}
              onClick={() => void handleSubmit()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                'Continue to payment'
              )}
            </Button>
          </>
        ) : null}
      </div>
    </AuthLayout>
  );
}
