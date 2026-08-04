'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { EnrollConsentCheckbox } from '@/components/enroll/enroll-consent-checkbox';
import { EnrollPricingSummary } from '@/components/enroll/enroll-pricing-summary';
import { renewPlanLabel } from '@/components/renew/renew-plan-label';
import { RenewPlanPicker, type RenewPlanPickerOption } from '@/components/renew/renew-plan-picker';
import { RenewPricingSummary } from '@/components/renew/renew-pricing-summary';
import {
  isBlockedCategory,
  isNewUserCategory,
  isSubscribedProfileFieldLocked,
  isTrialPlanOptionsLoading,
  shouldClearPromoForPlan,
} from '@/components/renew/renew-page-helpers';
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
import { trackPortalCheckoutAbandoned } from '@/lib/gtag';
import { combineWhatsapp, formatPhoneE164, parseWhatsapp } from '@/lib/phone-number';
import { normalizePromoCode, normalizePromoCodeInput, promoCodeInputProps } from '@/lib/promo-code';
import { readRenewDraft, saveRenewDraft, clearRenewDraft } from '@/lib/renew-draft';
import { openRazorpayOrderCheckout } from '@/lib/razorpay-checkout';
import { toTitleCase } from '@/lib/title-case';
import { captureUtmAttributionFromLocation, readUtmAttributionFromCookie } from '@/lib/utm-attribution';
import { validateWhatsappNumber } from '@/lib/whatsapp-validation';
import { trackPortalBeginCheckout, trackPortalSignUp } from '@/lib/gtag';
import { trackCheckoutPurchaseOnce } from '@/lib/checkout-analytics';
import { trackMetaBeginCheckout, trackMetaLead } from '@/lib/meta-pixel';
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

export function RenewPageView({ countries, suggestedCountryIso }: RenewPageViewProps) {
  const { toast } = useToast();
  const [classification, setClassification] = useState<RenewCheckEmailResponse | null>(null);
  const [preview, setPreview] = useState<RenewCheckoutPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const classifiedEmailRef = useRef('');

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
  const [trialQuotesByProduct, setTrialQuotesByProduct] = useState<Record<string, TrialQuote>>({});
  const [trialQuotesError, setTrialQuotesError] = useState(false);
  const [loadingTrialQuotes, setLoadingTrialQuotes] = useState(false);

  const [whatsappDialIso, setWhatsappDialIso] = useState(suggestedCountryIso ?? 'IN');
  const whatsappDialIsoRef = useRef(suggestedCountryIso);
  const lastCheckoutRef = useRef<{
    sessionId: string;
    valuePaise: number;
    cohortName: string;
    pricingRegion: string;
  } | null>(null);

  const clearClassification = useCallback(
    (resetProfile = false) => {
      classifiedEmailRef.current = '';
      setClassification(null);
      setPreview(null);
      setPreviewError(false);
      setSelectedPlan('');
      setAppliedPromo('');
      setQuotedTrialQuote(null);
      setTrialQuotesByProduct({});
      setTrialQuotesError(false);
      setLoadingTrialQuotes(false);
      setPromoCode('');
      setPromoError(null);
      if (resetProfile) {
        setFirstName('');
        setLastName('');
        setWhatsapp('');
        setCountryIso(suggestedCountryIso ?? 'IN');
        setCountryManuallySet(false);
        setWhatsappDialIso(suggestedCountryIso ?? 'IN');
        whatsappDialIsoRef.current = suggestedCountryIso ?? 'IN';
      }
    },
    [suggestedCountryIso]
  );

  const classifyEmail = useCallback(
    async (trimmed: string): Promise<RenewCheckEmailResponse | null> => {
      if (!isValidEmailFormat(trimmed)) {
        setEmailError('That doesn’t look like a valid email.');
        clearClassification();
        return null;
      }
      setEmailError(null);
      setCheckingEmail(true);
      try {
        const result = await postRenewCheckEmail(trimmed);
        classifiedEmailRef.current = trimmed;
        setClassification(result);
        if (result.first_name) setFirstName(result.first_name);
        if (result.last_name) setLastName(result.last_name);
        if (result.whatsapp) setWhatsapp(result.whatsapp);
        if (result.country_iso) setCountryIso(result.country_iso);
        return result;
      } catch (err) {
        clearClassification();
        toast({ message: err instanceof Error ? err.message : 'Could not verify email.', variant: 'error' });
        return null;
      } finally {
        setCheckingEmail(false);
      }
    },
    [clearClassification, toast]
  );

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
    const trimmed = draft.email.trim().toLowerCase();
    if (isValidEmailFormat(trimmed)) {
      void classifyEmail(trimmed);
    }
  }, [classifyEmail]);

  useEffect(() => {
    captureUtmAttributionFromLocation();
  }, []);

  const category = classification?.category ?? null;
  const blocked = isBlockedCategory(category);
  const showPlans = classification && !blocked;

  useEffect(() => {
    if (!category || blocked) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);
    setPreviewError(false);
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
        if (!cancelled) {
          setPreviewError(true);
          toast({ message: 'Could not load pricing. Please refresh.', variant: 'error' });
        }
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, countryIso, blocked, toast]);

  useEffect(() => {
    if (!isNewUserCategory(category) || !preview?.trial_products?.length) {
      setTrialQuotesByProduct({});
      setTrialQuotesError(false);
      setLoadingTrialQuotes(false);
      return;
    }

    const products = preview.trial_products;
    let cancelled = false;
    setLoadingTrialQuotes(true);
    setTrialQuotesError(false);
    void (async () => {
      try {
        const pairs = await Promise.all(
          products.map(async (planKey) => {
            const data = await getTrialCheckoutPreview(planKey as TrialProduct);
            const quote = countryIso === 'IN' ? data.domestic : data.international;
            return [planKey, quote] as const;
          })
        );
        if (!cancelled) {
          setTrialQuotesByProduct(Object.fromEntries(pairs));
          setTrialQuotesError(false);
        }
      } catch {
        if (!cancelled) {
          setTrialQuotesByProduct({});
          setTrialQuotesError(true);
          toast({ message: 'Could not load trial pricing. Please refresh.', variant: 'error' });
        }
      } finally {
        if (!cancelled) setLoadingTrialQuotes(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, preview?.trial_products, countryIso, toast]);

  useEffect(() => {
    if (shouldClearPromoForPlan(selectedPlan)) {
      setAppliedPromo('');
      setQuotedTrialQuote(null);
      setPromoCode('');
      setPromoError(null);
    }
  }, [selectedPlan]);

  const refreshTrialPromoQuote = useCallback(
    async (promo: string) => {
      if (!category || !isNewUserCategory(category)) return;
      setQuotePending(true);
      setPromoError(null);
      try {
        const quote = await postRenewCheckoutQuote({
          category,
          plan_key: 'trial_3m',
          country_code: countryIso,
          promo_code: promo,
        });
        setAppliedPromo(promo);
        setQuotedTrialQuote(quote as TrialQuote);
      } catch (err) {
        setPromoError(err instanceof Error ? err.message : 'Failed to apply discount code.');
        setAppliedPromo('');
        setQuotedTrialQuote(null);
        throw err;
      } finally {
        setQuotePending(false);
      }
    },
    [category, countryIso]
  );

  useEffect(() => {
    if (!isNewUserCategory(category) || selectedPlan !== 'trial_3m' || !appliedPromo) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        await refreshTrialPromoQuote(appliedPromo);
      } catch {
        // refreshTrialPromoQuote sets promoError / clears promo on failure
      }
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
    // Re-quote promo when billing country changes; initial apply is handled by handleApplyPromo.
  }, [countryIso]);

  const trialPreviewQuote = selectedPlan ? trialQuotesByProduct[selectedPlan] : null;

  const planPickerOptions = useMemo((): RenewPlanPickerOption[] => {
    if (!preview) return [];

    if (isNewUserCategory(category)) {
      const options: RenewPlanPickerOption[] = [];
      for (const planKey of preview.trial_products ?? []) {
        const quote = trialQuotesByProduct[planKey];
        if (!quote) continue;
        const discountPaise = quote.discount_paise ?? 0;
        options.push({
          planKey,
          basePaise: quote.base_paise,
          discountPaise: discountPaise > 0 ? discountPaise : undefined,
          discountLabel: planKey === 'trial_3m' && discountPaise > 0 ? '15% off' : undefined,
          pricingRegion: quote.pricing_region,
        });
      }
      return options;
    }

    return (preview.plans ?? []).map((plan) => {
      const quote = countryIso === 'IN' ? plan.domestic : plan.international;
      return {
        planKey: plan.plan_key,
        basePaise: quote.base_paise,
        discountLabel: plan.discount_label,
        pricingRegion: quote.pricing_region,
        months: quote.months ?? quote.renewal_months,
      };
    });
  }, [preview, category, trialQuotesByProduct, countryIso]);

  const planOptionsLoading = isTrialPlanOptionsLoading(
    category,
    preview?.trial_products?.length ?? 0,
    planPickerOptions.length
  );

  const renewalQuote: RenewQuote | null = useMemo(() => {
    if (!preview?.plans || !selectedPlan) return null;
    const plan = preview.plans.find((p) => p.plan_key === selectedPlan);
    if (!plan) return null;
    return countryIso === 'IN' ? plan.domestic : plan.international;
  }, [preview, selectedPlan, countryIso]);

  const displayTrialQuote = selectedPlan === 'trial_3m' && appliedPromo ? quotedTrialQuote : trialPreviewQuote;
  const displayQuote = isNewUserCategory(category) ? displayTrialQuote : renewalQuote;
  const displayTotalPaise = displayQuote?.total_paise;
  const newUserPricingLoading =
    isNewUserCategory(category) && (loadingTrialQuotes || quotePending || planOptionsLoading);
  const isNewUser = isNewUserCategory(category);
  const primaryCtaLabel = submitting ? 'Initiating payment…' : isNewUser ? 'Enroll' : 'Renew';

  const handleEmailBlur = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setEmailError(null);
      clearClassification(true);
      return;
    }
    await classifyEmail(trimmed);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const normalized = value.trim().toLowerCase();
    if (classifiedEmailRef.current && normalized !== classifiedEmailRef.current) {
      clearClassification(true);
    }
    if (!normalized) {
      setEmailError(null);
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
    try {
      await refreshTrialPromoQuote(normalized);
    } catch {
      // refreshTrialPromoQuote sets error state
    }
  };

  const handleDialIsoChange = (iso: string) => {
    whatsappDialIsoRef.current = iso;
    setWhatsappDialIso(iso);
    if (!countryManuallySet && iso) {
      setCountryIso(iso);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);

    const trimmedEmail = email.trim().toLowerCase();
    let activeClassification = classification;
    if (!activeClassification?.category) {
      if (!trimmedEmail) {
        setFormError('Enter your email so we can find your account.');
        return;
      }
      activeClassification = await classifyEmail(trimmedEmail);
      if (!activeClassification?.category) {
        setFormError('Enter a valid email so we can show your plan options.');
        return;
      }
    }

    const activeCategory = activeClassification.category;
    if (isBlockedCategory(activeCategory)) return;
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
      email: trimmedEmail,
      whatsapp,
      countryIso,
      whatsappDialIso: dialIso,
      countryManuallySet,
    });

    setSubmitting(true);
    try {
      const start = await startRenewCheckout({
        category: activeCategory,
        plan_key: selectedPlan,
        first_name: toTitleCase(firstName.trim()),
        last_name: toTitleCase(lastName.trim()),
        email: trimmedEmail,
        whatsapp: whatsappE164,
        country_code: countryIso,
        dpdp_consent: true,
        ...(readUtmAttributionFromCookie() ?? {}),
        ...(appliedPromo ? { promo_code: appliedPromo } : {}),
      });

      const welcomeUrl = `/welcome/renew?session=${encodeURIComponent(start.checkout_session_id)}`;
      const pricingRegion = start.pricing_region === 'international' ? 'international' : 'domestic';
      const checkoutValuePaise = displayTotalPaise ?? start.amount_paise;

      if (isNewUserCategory(activeCategory)) {
        trackPortalSignUp('trial_enroll');
        trackMetaLead();
      }
      trackPortalBeginCheckout({
        valuePaise: checkoutValuePaise,
        cohortName: start.cohort_name,
        pricingRegion,
      });
      trackMetaBeginCheckout({ valuePaise: checkoutValuePaise });

      lastCheckoutRef.current = {
        sessionId: start.checkout_session_id,
        valuePaise: start.amount_paise,
        cohortName: start.cohort_name,
        pricingRegion,
      };

      if (start.mock || !start.razorpay_key_id || !start.razorpay_order_id) {
        trackCheckoutPurchaseOnce({
          transactionId: start.checkout_session_id,
          valuePaise: start.amount_paise,
          cohortName: start.cohort_name,
          pricingRegion,
          trialProduct: isNewUser ? (selectedPlan as TrialProduct) : undefined,
        });
        clearRenewDraft();
        const ok = await pollUntilRenewPaymentConfirmed(start.checkout_session_id);
        if (ok) {
          window.location.href = welcomeUrl;
        } else {
          setFormError('Payment could not be confirmed. Please try again.');
          setSubmitting(false);
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
          const checkout = lastCheckoutRef.current;
          if (checkout) {
            trackCheckoutPurchaseOnce({
              transactionId: checkout.sessionId,
              valuePaise: checkout.valuePaise,
              cohortName: checkout.cohortName,
              pricingRegion: checkout.pricingRegion,
              trialProduct: isNewUser ? (selectedPlan as TrialProduct) : undefined,
            });
          }
          clearRenewDraft();
          window.location.href = welcomeUrl;
        },
        onDismiss: () => {
          setSubmitting(false);
          trackPortalCheckoutAbandoned({
            valuePaise: start.amount_paise,
            cohortName: start.cohort_name,
            pricingRegion,
          });
        },
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="account">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5 py-2">
        <div className="text-center">
          <div className="mb-5 flex justify-center overflow-x-auto">
            <SbmWordmark size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Renew Take Control</h1>
          <p className="text-sm text-slate-600">Enter your details below to renew your membership.</p>
        </div>

        <div className="space-y-3.5">
          <Field label="Email" error={emailError}>
            <TextInput
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => void handleEmailBlur()}
              error={Boolean(emailError)}
            />
            {checkingEmail ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking your account…
              </p>
            ) : null}
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="First name">
              <TextInput
                value={firstName}
                onChange={setFirstName}
                autoComplete="given-name"
                disabled={isSubscribedProfileFieldLocked(category, classification?.first_name)}
              />
            </Field>
            <Field label="Last name">
              <TextInput
                value={lastName}
                onChange={setLastName}
                autoComplete="family-name"
                disabled={isSubscribedProfileFieldLocked(category, classification?.last_name)}
              />
            </Field>
          </div>
          <Field label="WhatsApp">
            <PhoneInput
              value={whatsapp}
              onChange={setWhatsapp}
              countries={countries}
              suggestedCountryIso={suggestedCountryIso}
              preferredDialIso={whatsappDialIso}
              onDialIsoChange={handleDialIsoChange}
              disabled={isSubscribedProfileFieldLocked(category, classification?.whatsapp)}
              className="flex-col sm:flex-row sm:items-start"
              dialCodeClassName="w-full sm:w-35 sm:shrink-0"
              mobileClassName="w-full sm:flex-1"
            />
          </Field>
          <Field label="Country">
            <CountryCombobox
              countries={countries}
              value={countryIso}
              disabled={isSubscribedProfileFieldLocked(category, classification?.country_iso)}
              onChange={(value) => {
                setCountryManuallySet(true);
                setCountryIso(value);
                const dial = getCountryDialCode(value);
                if (dial && !whatsapp.trim()) {
                  whatsappDialIsoRef.current = value;
                  setWhatsappDialIso(value);
                }
              }}
            />
          </Field>

          <EnrollConsentCheckbox
            checked={dpdpConsent}
            onChange={(checked) => {
              setDpdpConsent(checked);
              if (checked) setConsentError(false);
            }}
            error={consentError}
          />

          {formError ? (
            <p className="text-[12.5px] font-semibold text-danger-press" role="alert">
              {formError}
            </p>
          ) : null}
        </div>

        {classification && blocked ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Auto-renew is already on</p>
            <p className="mt-1">
              {classification.next_renewal_at
                ? `Your next renewal is on ${formatAccessDate(classification.next_renewal_at) ?? classification.next_renewal_at}.`
                : 'Your membership renews automatically — no payment needed here.'}
            </p>
          </div>
        ) : null}

        {showPlans ? (
          <>
            {classification.access_until ? (
              <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-slate-700">
                Access until{' '}
                <span className="font-semibold text-slate-900">
                  {formatAccessDate(classification.access_until) ?? classification.access_until}
                </span>
              </div>
            ) : null}

            {loadingPreview ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
              </div>
            ) : previewError || !preview ? (
              <p className="text-center text-sm text-slate-600">
                Could not load plan options. Please refresh the page or try again later.
              </p>
            ) : (
              <>
                {trialQuotesError ? (
                  <p className="text-center text-sm text-slate-600">
                    Could not load trial plan pricing. Please refresh the page or try again later.
                  </p>
                ) : planOptionsLoading || loadingTrialQuotes ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                  </div>
                ) : planPickerOptions.length > 0 ? (
                  <RenewPlanPicker
                    options={planPickerOptions}
                    selectedPlanKey={selectedPlan}
                    onSelect={setSelectedPlan}
                  />
                ) : null}

                {selectedPlan === 'trial_3m' && isNewUserCategory(category) ? (
                  <Field label="Discount code">
                    <div className="flex gap-2">
                      <TextInput
                        value={promoCode}
                        onChange={(value) => setPromoCode(normalizePromoCodeInput(value))}
                        placeholder="Enter code"
                        className={promoCodeInputProps.className}
                        autoCapitalize={promoCodeInputProps.autoCapitalize}
                        autoCorrect={promoCodeInputProps.autoCorrect}
                        spellCheck={promoCodeInputProps.spellCheck}
                      />
                      <Button
                        type="button"
                        variant="light"
                        size="md"
                        onClick={() => void handleApplyPromo()}
                        disabled={quotePending || submitting}
                      >
                        Apply
                      </Button>
                    </div>
                    {promoError ? (
                      <p className="mt-1.5 text-[12.5px] font-semibold text-danger-press" role="alert">
                        {promoError}
                      </p>
                    ) : null}
                  </Field>
                ) : null}

                {newUserPricingLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-brand" />
                  </div>
                ) : displayQuote && preview.starts_on ? (
                  isNewUserCategory(category) && displayTrialQuote ? (
                    <EnrollPricingSummary
                      product={selectedPlan as TrialProduct}
                      quote={displayTrialQuote}
                      startsOn={preview.starts_on}
                      shortStartDate
                    />
                  ) : renewalQuote ? (
                    <RenewPricingSummary planKey={selectedPlan} quote={renewalQuote} startsOn={preview.starts_on} />
                  ) : null
                ) : null}

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={submitting || !displayQuote || newUserPricingLoading}
                  onClick={() => void handleSubmit()}
                  rightIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {primaryCtaLabel}
                </Button>
              </>
            )}
          </>
        ) : null}
      </div>
    </AuthLayout>
  );
}
