'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { EnrollConsentCheckbox } from '@/components/enroll/enroll-consent-checkbox';
import { EnrollPricingSummary, enrollProgramLabel } from '@/components/enroll/enroll-pricing-summary';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { CountryCombobox } from '@/components/profile/country-combobox';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import { getCountryDialCode } from '@/lib/country-dial-codes';
import { clearEnrollDraft, readEnrollDraft, saveEnrollDraft } from '@/lib/enroll-draft';
import { trackCheckoutPurchaseOnce } from '@/lib/checkout-analytics';
import { trackPortalBeginCheckout, trackPortalCheckoutAbandoned, trackPortalSignUp } from '@/lib/gtag';
import { trackMetaBeginCheckout, trackMetaLead } from '@/lib/meta-pixel';
import { combineWhatsapp, formatPhoneE164, parseWhatsapp } from '@/lib/phone-number';
import { normalizePromoCode, normalizePromoCodeInput, promoCodeInputProps } from '@/lib/promo-code';
import { openRazorpayOrderCheckout } from '@/lib/razorpay-checkout';
import { toTitleCase } from '@/lib/title-case';
import { validateWhatsappNumber } from '@/lib/whatsapp-validation';
import { getTrialCheckoutPreview, postTrialCheckoutQuote, startTrialCheckout } from '@/utils/client-api';
import type { Country } from '@/types/reference';
import type { TrialCheckoutPreview, TrialProduct, TrialQuote } from '@/types/trial';

type EnrollPageViewProps = {
  product: TrialProduct;
  welcomeProductParam: string;
  countries: Country[];
  suggestedCountryIso?: string;
};

export function EnrollPageView({ product, welcomeProductParam, countries, suggestedCountryIso }: EnrollPageViewProps) {
  const discountCodeEnabled = product === 'trial_3m';
  const { toast } = useToast();
  const [preview, setPreview] = useState<TrialCheckoutPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
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
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [quotePending, setQuotePending] = useState(false);
  const [quotedQuote, setQuotedQuote] = useState<TrialQuote | null>(null);
  const [whatsappDialIso, setWhatsappDialIso] = useState(suggestedCountryIso ?? 'IN');
  const whatsappDialIsoRef = useRef(suggestedCountryIso);
  const lastCheckoutRef = useRef<{
    sessionId: string;
    valuePaise: number;
    cohortName: string;
    pricingRegion: string;
  } | null>(null);

  useEffect(() => {
    const draft = readEnrollDraft(product);
    if (!draft) return;
    setFirstName(draft.firstName);
    setLastName(draft.lastName);
    setEmail(draft.email);
    setWhatsapp(draft.whatsapp);
    setCountryIso(draft.countryIso);
    setCountryManuallySet(draft.countryManuallySet);
    setWhatsappDialIso(draft.whatsappDialIso);
    whatsappDialIsoRef.current = draft.whatsappDialIso;
  }, [product]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await getTrialCheckoutPreview(product);
        if (!cancelled) setPreview(data);
      } catch {
        if (!cancelled) toast({ message: 'Could not load pricing. Please refresh.', variant: 'error' });
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product, toast]);

  const baseQuote = useMemo(() => {
    if (!preview) return null;
    return countryIso === 'IN' ? preview.domestic : preview.international;
  }, [preview, countryIso]);

  const displayQuote = discountCodeEnabled ? (quotedQuote ?? baseQuote) : baseQuote;

  useEffect(() => {
    setAppliedPromo('');
    setPromoCode('');
    setQuotedQuote(null);
    setPromoError(null);
  }, [countryIso]);

  const handleApplyPromo = async () => {
    const normalized = normalizePromoCode(promoCode);
    if (!normalized) {
      setPromoError('Enter a discount code.');
      return;
    }

    setPromoCode(normalized);
    setPromoError(null);
    setQuotePending(true);
    try {
      const quote = await postTrialCheckoutQuote({
        product,
        country_code: countryIso,
        promo_code: normalized,
      });
      setAppliedPromo(normalized);
      setQuotedQuote(quote);
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : 'Failed to apply discount code.');
      setAppliedPromo('');
      setQuotedQuote(null);
    } finally {
      setQuotePending(false);
    }
  };

  const handleClearPromo = () => {
    setAppliedPromo('');
    setPromoCode('');
    setPromoError(null);
    setQuotedQuote(null);
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
    if (!dpdpConsent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);

    if (!firstName.trim() || !email.trim() || !whatsapp.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

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

    saveEnrollDraft({
      product,
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
      const start = await startTrialCheckout({
        product,
        first_name: toTitleCase(firstName.trim()),
        last_name: toTitleCase(lastName.trim()),
        email: email.trim().toLowerCase(),
        whatsapp: whatsappE164,
        country_code: countryIso,
        dpdp_consent: true,
        ...(discountCodeEnabled && appliedPromo ? { promo_code: appliedPromo } : {}),
      });

      const welcomeUrl = `/welcome/take-control?product=${encodeURIComponent(welcomeProductParam)}&session=${encodeURIComponent(start.checkout_session_id)}`;
      const pricingRegion = countryIso === 'IN' ? 'domestic' : 'international';
      const checkoutValuePaise = displayQuote?.total_paise ?? start.amount_paise;

      trackPortalSignUp('trial_enroll');
      trackMetaLead();
      trackPortalBeginCheckout({
        valuePaise: checkoutValuePaise,
        cohortName: start.cohort_name,
        pricingRegion,
        trialProduct: product,
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
          trialProduct: product,
        });
        clearEnrollDraft();
        window.location.href = welcomeUrl;
        return;
      }

      await openRazorpayOrderCheckout({
        key: start.razorpay_key_id,
        orderId: start.razorpay_order_id,
        customerId: start.razorpay_customer_id,
        checkoutSessionId: start.checkout_session_id,
        description: `Take Control · ${start.cohort_name}`,
        pricingRegion: countryIso === 'IN' ? 'domestic' : 'international',
        returnDestination: welcomeUrl,
        pendingCheckout: {
          valuePaise: start.amount_paise,
          cohortName: start.cohort_name,
          pricingRegion,
          trialProduct: product,
        },
        prefill: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          contact: whatsappE164,
          contactCountryIso: dialIso,
        },
        onSuccess: () => {
          const checkout = lastCheckoutRef.current;
          if (checkout) {
            trackCheckoutPurchaseOnce({
              transactionId: checkout.sessionId,
              valuePaise: checkout.valuePaise,
              cohortName: checkout.cohortName,
              pricingRegion: checkout.pricingRegion,
              trialProduct: product,
            });
          }
          clearEnrollDraft();
          window.location.href = welcomeUrl;
        },
        onDismiss: () => {
          setSubmitting(false);
          if (preview) {
            trackPortalCheckoutAbandoned({
              valuePaise: start.amount_paise,
              cohortName: start.cohort_name,
              pricingRegion,
              trialProduct: product,
            });
          }
        },
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="account">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5">
        <div className="text-center">
          <div className="mb-5 flex justify-center overflow-x-auto">
            <SbmWordmark size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Take Control: <span className="text-brand">{enrollProgramLabel(product)}</span>
          </h1>
        </div>

        {loadingPreview || !preview || !displayQuote ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <>
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="First name">
                  <TextInput value={firstName} onChange={setFirstName} autoComplete="given-name" />
                </Field>
                <Field label="Last name">
                  <TextInput value={lastName} onChange={setLastName} autoComplete="family-name" />
                </Field>
              </div>
              <Field label="Email">
                <TextInput type="email" value={email} onChange={setEmail} autoComplete="email" />
              </Field>
              <Field label="WhatsApp">
                <PhoneInput
                  value={whatsapp}
                  onChange={setWhatsapp}
                  countries={countries}
                  suggestedCountryIso={suggestedCountryIso}
                  preferredDialIso={whatsappDialIso}
                  onDialIsoChange={handleDialIsoChange}
                  className="flex-col sm:flex-row sm:items-start"
                  dialCodeClassName="w-full sm:w-35 sm:shrink-0"
                  mobileClassName="w-full sm:flex-1"
                />
              </Field>
              <Field label="Country">
                <CountryCombobox
                  value={countryIso}
                  onChange={(value) => {
                    setCountryManuallySet(true);
                    setCountryIso(value);
                    const dial = getCountryDialCode(value);
                    if (dial && !whatsapp.trim()) {
                      whatsappDialIsoRef.current = value;
                    }
                  }}
                  countries={countries}
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

              {discountCodeEnabled ? (
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
                    {appliedPromo ? (
                      <Button
                        type="button"
                        variant="light"
                        size="md"
                        onClick={handleClearPromo}
                        disabled={quotePending || submitting}
                      >
                        Clear
                      </Button>
                    ) : null}
                  </div>
                  {promoError ? (
                    <p className="mt-1.5 text-[12.5px] font-semibold text-danger-press" role="alert">
                      {promoError}
                    </p>
                  ) : null}
                </Field>
              ) : null}
            </div>

            <EnrollPricingSummary product={product} quote={displayQuote} startsOn={preview.starts_on} />

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              rightIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {submitting ? 'Initiating payment…' : 'Enroll'}
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
