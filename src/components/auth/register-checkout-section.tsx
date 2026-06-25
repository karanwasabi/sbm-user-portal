'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { BillingDetailsFields } from '@/components/billing/billing-details-fields';
import { CheckoutPanelSkeleton } from '@/components/loading/checkout-panel-skeleton';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { cn } from '@/lib/cn';
import { formatInrFromPaise } from '@/lib/money';
import { trackPortalBeginCheckout, trackPortalCheckoutAbandoned, trackPortalPurchase } from '@/lib/gtag';
import { normalizePromoCode, normalizePromoCodeInput, promoCodeInputProps } from '@/lib/promo-code';
import { openRazorpayEnrollmentCheckout, pollUntilEnrolled } from '@/lib/razorpay-checkout';
import type { CheckoutPreview, CheckoutQuote, CheckoutQuoteRequest } from '@/types/checkout';
import type { Country, CountryCity, CountryState } from '@/types/reference';
import {
  getCheckoutResume,
  getPublicCheckoutPreview,
  getPublicCountryCities,
  getPublicCountryStates,
  mockCompleteCheckout,
  postPublicCheckoutQuote,
  startCheckout,
} from '@/utils/client-api';

type RegisterCheckoutSectionProps = {
  suggestedLegalName: string;
  suggestedCountryIso?: string;
  /** Live ISO from the WhatsApp dial-code picker (does not require a valid full number). */
  whatsappCountryIso?: string;
  countries: Country[];
  enabled: boolean;
};

function resolveDefaultBillingCountry(countryRows: Country[], preferredIso?: string): string {
  const preferred = preferredIso?.trim().toUpperCase();
  if (preferred && countryRows.some((entry) => entry.iso_code === preferred)) {
    return preferred;
  }
  if (countryRows.some((entry) => entry.iso_code === 'IN')) {
    return 'IN';
  }
  return countryRows[0]?.iso_code ?? 'IN';
}

export function RegisterCheckoutSection({
  suggestedLegalName,
  suggestedCountryIso,
  whatsappCountryIso,
  countries: initialCountries,
  enabled,
}: RegisterCheckoutSectionProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotePending, setQuotePending] = useState(false);
  const [payPending, setPayPending] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingOpen, setBillingOpen] = useState(false);

  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [countryCities, setCountryCities] = useState<CountryCity[]>([]);
  const [countryStates, setCountryStates] = useState<CountryState[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [billingCountryCode, setBillingCountryCode] = useState(() => suggestedCountryIso?.trim().toUpperCase() || 'IN');
  const [billingCountryTouched, setBillingCountryTouched] = useState(false);
  const wasBillingOpen = useRef(false);
  const lastCheckoutRef = useRef<{
    sessionId: string;
    valuePaise: number;
    cohortName: string;
    promoCode?: string | null;
  } | null>(null);
  const pricingRegion = useMemo<'domestic' | 'international'>(
    () => (billingCountryCode === 'IN' ? 'domestic' : 'international'),
    [billingCountryCode]
  );
  const [billingType, setBillingType] = useState<'personal' | 'business'>('personal');
  const [gstin, setGstin] = useState('');
  const [legalName, setLegalName] = useState('');
  const [legalNameTouched, setLegalNameTouched] = useState(false);
  const [billingState, setBillingState] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const selectedCountry = useMemo(
    () => countries.find((country) => country.iso_code === billingCountryCode),
    [countries, billingCountryCode]
  );
  const billingCountry = selectedCountry?.name ?? billingCountryCode;
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  useEffect(() => {
    setCountries(initialCountries);
  }, [initialCountries]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPublicCheckoutPreview('take-control');
        if (cancelled) return;
        setPreview(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load checkout preview.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBillingCountryChange = (code: string) => {
    setBillingCountryTouched(true);
    setBillingCountryCode(code);
  };

  useEffect(() => {
    if (billingCountryTouched || countries.length === 0) return;
    const iso = whatsappCountryIso ?? suggestedCountryIso;
    if (!iso) return;
    const next = resolveDefaultBillingCountry(countries, iso);
    setBillingCountryCode((current) => (current === next ? current : next));
  }, [whatsappCountryIso, suggestedCountryIso, billingCountryTouched, countries]);

  useEffect(() => {
    if (!enabled || legalNameTouched) return;
    const next = suggestedLegalName.trim();
    if (!next) return;
    setLegalName((current) => (current.trim() ? current : next));
  }, [enabled, suggestedLegalName, legalNameTouched]);

  useEffect(() => {
    const opened = billingOpen && !wasBillingOpen.current;
    wasBillingOpen.current = billingOpen;
    if (!opened || legalNameTouched) return;
    setLegalName(suggestedLegalName.trim());
  }, [billingOpen, legalNameTouched, suggestedLegalName]);

  const resolveLegalName = useCallback(() => {
    const trimmed = legalName.trim();
    if (legalNameTouched) return trimmed;
    return trimmed || suggestedLegalName.trim();
  }, [legalName, legalNameTouched, suggestedLegalName]);

  const previewQuote = useMemo(() => {
    if (!preview) return null;
    return pricingRegion === 'domestic' ? preview.domestic : preview.international;
  }, [preview, pricingRegion]);

  useEffect(() => {
    if (!billingCountryCode) {
      setCountryCities([]);
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    getPublicCountryCities(billingCountryCode)
      .then((rows) => {
        if (!cancelled) setCountryCities(rows);
      })
      .catch(() => {
        if (!cancelled) setCountryCities([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [billingCountryCode]);

  useEffect(() => {
    setBillingCity('');
    setBillingState('');
  }, [billingCountryCode]);

  useEffect(() => {
    if (!billingCountryCode) {
      setCountryStates([]);
      return;
    }
    let cancelled = false;
    setLoadingStates(true);
    getPublicCountryStates(billingCountryCode)
      .then((rows) => {
        if (!cancelled) setCountryStates(rows);
      })
      .catch(() => {
        if (!cancelled) setCountryStates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [billingCountryCode]);

  const buildCheckoutRequest = useCallback((): CheckoutQuoteRequest => {
    const trimmedGstin = gstin.trim().toUpperCase();
    const subdivisions = countryStates.length > 0;
    const trimmedLegalName = resolveLegalName();
    return {
      program_slug: 'take-control',
      pricing_region: pricingRegion,
      billing_type: billingType,
      billing_country_code: billingCountryCode,
      gstin: billingType === 'business' && pricingRegion === 'domestic' && trimmedGstin ? trimmedGstin : undefined,
      legal_name: trimmedLegalName || undefined,
      billing_state: billingState || undefined,
      billing_address: {
        line1: addressLine1,
        line2: addressLine2 || undefined,
        city: billingCity,
        state: subdivisions ? billingState : '',
        postal_code: postalCode,
        country: billingCountry,
      },
      promo_code: appliedPromo || undefined,
    };
  }, [
    addressLine1,
    addressLine2,
    appliedPromo,
    billingCity,
    billingCountry,
    billingCountryCode,
    billingState,
    billingType,
    countryStates.length,
    gstin,
    postalCode,
    pricingRegion,
    resolveLegalName,
  ]);

  useEffect(() => {
    if (loading || !previewQuote) return;
    if (!appliedPromo) {
      setQuote(previewQuote);
    }
  }, [loading, previewQuote, appliedPromo]);

  const fetchPromoQuote = useCallback(async () => {
    if (!appliedPromo) return;
    setQuotePending(true);
    setError(null);
    try {
      const next = await postPublicCheckoutQuote('take-control', {
        program_slug: 'take-control',
        pricing_region: pricingRegion,
        billing_type: billingType,
        billing_country_code: billingCountryCode,
        promo_code: appliedPromo,
      });
      setQuote(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate price.');
      if (previewQuote) setQuote(previewQuote);
    } finally {
      setQuotePending(false);
    }
  }, [appliedPromo, billingCountryCode, billingType, previewQuote, pricingRegion]);

  useEffect(() => {
    if (loading || !appliedPromo) return;
    void fetchPromoQuote();
  }, [loading, appliedPromo, pricingRegion, fetchPromoQuote]);

  const handleCitySuggestion = (city: CountryCity) => {
    if (!city.state_code) return;
    const matchedState = countryStates.find((state) => state.state_code === city.state_code);
    if (matchedState) setBillingState(matchedState.name);
  };

  const handleClearPromo = () => {
    setAppliedPromo('');
    setPromoCode('');
    if (previewQuote) setQuote(previewQuote);
    setError(null);
  };

  const displayQuote = quote ?? previewQuote;

  const finishPayment = async () => {
    const checkout = lastCheckoutRef.current;
    if (checkout) {
      trackPortalPurchase({
        transactionId: checkout.sessionId,
        valuePaise: checkout.valuePaise,
        cohortName: checkout.cohortName,
        pricingRegion,
        promoCode: checkout.promoCode,
      });
    }

    setConfirmingPayment(true);
    await pollUntilEnrolled();
    router.push('/');
    router.refresh();
  };

  const trackCheckoutAbandoned = () => {
    if (!preview || !displayQuote) return;
    trackPortalCheckoutAbandoned({
      valuePaise: displayQuote.total_paise,
      cohortName: preview.cohort_name,
      pricingRegion,
      promoCode: displayQuote.promo_code,
    });
  };

  const openPayment = async () => {
    if (!enabled || !preview || !displayQuote) return;

    const trimmedLegalName = resolveLegalName();
    if (!trimmedLegalName) {
      setError('Legal name is required for billing.');
      return;
    }

    setPayPending(true);
    setError(null);

    trackPortalBeginCheckout({
      valuePaise: displayQuote.total_paise,
      cohortName: preview.cohort_name,
      pricingRegion,
      promoCode: displayQuote.promo_code,
    });

    try {
      const checkoutRequest = { ...buildCheckoutRequest(), legal_name: trimmedLegalName };
      let start;
      if (appliedPromo) {
        start = await startCheckout(checkoutRequest);
      } else {
        try {
          const resume = await getCheckoutResume('take-control');
          const expectedTotal = displayQuote?.total_paise;
          if (expectedTotal != null && resume.amount_paise === expectedTotal) {
            start = resume;
          } else {
            start = await startCheckout(checkoutRequest);
          }
        } catch {
          start = await startCheckout(checkoutRequest);
        }
      }

      lastCheckoutRef.current = {
        sessionId: start.checkout_session_id,
        valuePaise: start.amount_paise,
        cohortName: start.cohort_name || preview.cohort_name,
        promoCode: displayQuote.promo_code,
      };

      if (start.mock) {
        await mockCompleteCheckout(start.checkout_session_id);
        await finishPayment();
        return;
      }

      await openRazorpayEnrollmentCheckout({
        start,
        onSuccess: () => {
          void finishPayment();
        },
        onDismiss: () => {
          setPayPending(false);
          trackCheckoutAbandoned();
          setError('Payment was not completed. Tap Enroll to try again.');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed to start.');
    } finally {
      setPayPending(false);
    }
  };

  if (loading) {
    return <CheckoutPanelSkeleton />;
  }

  if (!preview || !displayQuote) {
    return (
      <p className="text-sm font-semibold text-danger-press" role="alert">
        {error ?? 'Checkout is unavailable right now.'}
      </p>
    );
  }

  const batchDate = new Date(`${preview.starts_on}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const showGst = pricingRegion === 'domestic';

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-slate-200 px-4 py-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-base font-bold text-slate-900">Take Control</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Starts {batchDate}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              {formatInrFromPaise(displayQuote.upfront_base_paise)}
              {showGst ? <span className="text-sm font-bold text-slate-600"> + GST</span> : null}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">first 3 months</p>
          </div>
        </div>
        {displayQuote.discount_paise > 0 ? (
          <p className="mt-2 text-xs font-semibold text-success">
            {displayQuote.promo_code ? `${displayQuote.promo_code}: ` : ''}−
            {formatInrFromPaise(displayQuote.discount_paise)} · pay {formatInrFromPaise(displayQuote.total_paise)}
          </p>
        ) : null}
        <p className="mt-2 border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-500">
          Then {formatInrFromPaise(displayQuote.monthly_base_paise)}
          {showGst ? ' + GST' : ''} / month · cancel anytime.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800"
          onClick={() => setBillingOpen((open) => !open)}
        >
          Billing details (optional)
          <ChevronDown className={cn('h-4 w-4 transition-transform', billingOpen && 'rotate-180')} />
        </button>
        {billingOpen ? (
          <div className="border-t border-slate-100 px-4 py-3">
            <BillingDetailsFields
              countries={countries}
              billingCountryCode={billingCountryCode}
              onBillingCountryChange={handleBillingCountryChange}
              billingType={billingType}
              onBillingTypeChange={setBillingType}
              pricingRegion={pricingRegion}
              gstin={gstin}
              onGstinChange={setGstin}
              legalName={legalName}
              onLegalNameChange={(value) => {
                setLegalNameTouched(true);
                setLegalName(value);
              }}
              addressLine1={addressLine1}
              onAddressLine1Change={setAddressLine1}
              addressLine2={addressLine2}
              onAddressLine2Change={setAddressLine2}
              billingCity={billingCity}
              onBillingCityChange={setBillingCity}
              billingState={billingState}
              onBillingStateChange={setBillingState}
              postalCode={postalCode}
              onPostalCodeChange={setPostalCode}
              countryCities={countryCities}
              countryStates={countryStates}
              loadingCities={loadingCities}
              loadingStates={loadingStates}
              onCitySuggestion={handleCitySuggestion}
            />
          </div>
        ) : (
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            Legal name defaults to your registration name.{' '}
            {pricingRegion === 'domestic'
              ? 'Expand to add GSTIN or a billing address.'
              : 'Expand to add a billing address.'}
          </p>
        )}
      </div>

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
            onClick={() => {
              const normalized = normalizePromoCode(promoCode);
              if (!normalized) {
                setError('Enter a discount code.');
                return;
              }
              setPromoCode(normalized);
              setAppliedPromo(normalized);
              setError(null);
            }}
            disabled={quotePending}
          >
            Apply
          </Button>
          {appliedPromo ? (
            <Button type="button" variant="light" size="md" onClick={handleClearPromo} disabled={quotePending}>
              Clear
            </Button>
          ) : null}
        </div>
      </Field>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Due today</span>
          <span className="text-lg font-extrabold text-slate-900">
            {formatInrFromPaise(displayQuote.total_paise)}
            {quotePending ? ' …' : ''}
          </span>
        </div>
      </div>

      {error ? (
        <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
          {error}
        </p>
      ) : null}

      {confirmingPayment ? (
        <div className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-brand">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirming payment…
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {!enabled ? (
            <p className="text-[12.5px] leading-snug font-medium text-slate-500">
              Generate and confirm OTP before enrolling.
            </p>
          ) : null}
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full"
            disabled={!enabled || payPending || quotePending}
            onClick={() => void openPayment()}
            rightIcon={payPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          >
            {payPending ? 'Opening payment…' : 'Enroll'}
          </Button>
        </div>
      )}
    </div>
  );
}
