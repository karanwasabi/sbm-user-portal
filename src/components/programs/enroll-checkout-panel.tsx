'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { BillingDetailsFields } from '@/components/billing/billing-details-fields';
import { TakeControlEnrollPanel } from '@/components/programs/take-control-enroll-panel';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { TextInput } from '@/components/ui/text-input';
import { cn } from '@/lib/cn';
import { formatInrFromPaise } from '@/lib/money';
import type { CheckoutPreview, CheckoutQuote } from '@/types/checkout';
import type { Country, CountryCity, CountryState } from '@/types/reference';
import {
  getCheckoutPreview,
  postCheckoutQuote,
  startCheckout,
  mockCompleteCheckout,
  getCountries,
  getCountryCities,
  getCountryStates,
} from '@/utils/client-api';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type EnrollCheckoutPanelProps = {
  onBack?: () => void;
  onPaid?: () => void;
  defaultLegalName?: string;
};

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
    document.body.appendChild(script);
  });
}

export function EnrollCheckoutPanel({ onBack, onPaid, defaultLegalName = '' }: EnrollCheckoutPanelProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotePending, setQuotePending] = useState(false);
  const [payPending, setPayPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingOpen, setBillingOpen] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCities, setCountryCities] = useState<CountryCity[]>([]);
  const [countryStates, setCountryStates] = useState<CountryState[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [billingCountryCode, setBillingCountryCode] = useState('IN');
  const pricingRegion = useMemo<'domestic' | 'international'>(
    () => (billingCountryCode === 'IN' ? 'domestic' : 'international'),
    [billingCountryCode]
  );
  const [billingType, setBillingType] = useState<'personal' | 'business'>('personal');
  const [gstin, setGstin] = useState('');
  const [legalName, setLegalName] = useState(defaultLegalName.trim());
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
    let cancelled = false;
    (async () => {
      try {
        const [data, countryRows] = await Promise.all([getCheckoutPreview('take-control'), getCountries()]);
        if (cancelled) return;
        setPreview(data);
        setQuote(data.domestic);
        setCountries(countryRows);
        if (countryRows.some((entry) => entry.iso_code === 'IN')) {
          setBillingCountryCode('IN');
        } else if (countryRows[0]) {
          setBillingCountryCode(countryRows[0].iso_code);
        }
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

  useEffect(() => {
    if (legalNameTouched) return;
    setLegalName(defaultLegalName.trim());
  }, [defaultLegalName, legalNameTouched]);

  useEffect(() => {
    if (!billingCountryCode) {
      setCountryCities([]);
      return;
    }

    let cancelled = false;
    setLoadingCities(true);
    getCountryCities(billingCountryCode)
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
    getCountryStates(billingCountryCode)
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

  const hasSubdivisions = countryStates.length > 0;

  const refreshQuote = useCallback(async () => {
    setQuotePending(true);
    setError(null);
    try {
      const trimmedGstin = gstin.trim().toUpperCase();
      const next = await postCheckoutQuote({
        program_slug: 'take-control',
        pricing_region: pricingRegion,
        billing_type: billingType,
        billing_country_code: billingCountryCode,
        gstin: billingType === 'business' && pricingRegion === 'domestic' && trimmedGstin ? trimmedGstin : undefined,
        legal_name: legalName || undefined,
        billing_state: billingState || undefined,
        billing_address: {
          line1: addressLine1,
          line2: addressLine2 || undefined,
          city: billingCity,
          state: hasSubdivisions ? billingState : '',
          postal_code: postalCode,
          country: billingCountry,
        },
        promo_code: appliedPromo || undefined,
      });
      setQuote(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate price.');
    } finally {
      setQuotePending(false);
    }
  }, [
    addressLine1,
    addressLine2,
    appliedPromo,
    billingCity,
    billingCountry,
    billingCountryCode,
    billingState,
    billingType,
    gstin,
    legalName,
    postalCode,
    pricingRegion,
    countryStates.length,
  ]);

  useEffect(() => {
    if (loading) return;
    void refreshQuote();
  }, [loading, pricingRegion, billingType, appliedPromo, refreshQuote]);

  const handleApplyPromo = () => {
    setAppliedPromo(promoCode.trim().toUpperCase());
  };

  const handleLegalNameChange = (value: string) => {
    setLegalNameTouched(true);
    setLegalName(value);
  };

  const handleCitySuggestion = (city: CountryCity) => {
    if (!city.state_code) return;
    const matchedState = countryStates.find((state) => state.state_code === city.state_code);
    if (matchedState) {
      setBillingState(matchedState.name);
    }
  };

  const handlePay = async () => {
    const trimmedGstin = gstin.trim().toUpperCase();
    const trimmedLegalName = legalName.trim();
    if (!trimmedLegalName) {
      setError('Legal name is required for billing.');
      return;
    }
    if (billingType === 'business' && pricingRegion === 'domestic') {
      if (!trimmedGstin) {
        setError('GSTIN is required for India business billing.');
        return;
      }
      if (trimmedGstin.length !== 15) {
        setError('GSTIN must be 15 characters.');
        return;
      }
    }

    setPayPending(true);
    setError(null);
    try {
      const start = await startCheckout({
        program_slug: 'take-control',
        pricing_region: pricingRegion,
        billing_type: billingType,
        billing_country_code: billingCountryCode,
        gstin: billingType === 'business' && pricingRegion === 'domestic' ? trimmedGstin : undefined,
        legal_name: trimmedLegalName,
        billing_state: billingState || undefined,
        billing_address: {
          line1: addressLine1,
          line2: addressLine2 || undefined,
          city: billingCity,
          state: hasSubdivisions ? billingState : '',
          postal_code: postalCode,
          country: billingCountry,
        },
        promo_code: appliedPromo || undefined,
      });

      if (start.mock) {
        await mockCompleteCheckout(start.checkout_session_id);
        onPaid?.();
        router.push('/');
        router.refresh();
        return;
      }

      if (!start.razorpay_key_id || !start.razorpay_subscription_id) {
        throw new Error('Payment is not configured yet.');
      }

      await loadRazorpayScript();
      if (!window.Razorpay) {
        throw new Error('Razorpay checkout failed to load.');
      }

      const rzp = new window.Razorpay({
        key: start.razorpay_key_id,
        subscription_id: start.razorpay_subscription_id,
        name: 'Strong Body Method',
        description: `Take Control · ${start.cohort_name}`,
        handler: () => {
          onPaid?.();
          router.push('/');
          router.refresh();
        },
        modal: {
          ondismiss: () => setPayPending(false),
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed to start.');
    } finally {
      setPayPending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!preview || !quote) {
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

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">Your batch</p>
        <p className="mt-1 text-sm font-bold text-slate-900">
          {preview.cohort_name} · starts {batchDate}
        </p>
        {preview.days_until_start > 0 ? (
          <p className="mt-0.5 text-xs text-slate-600">{preview.days_until_start} days until program start</p>
        ) : null}
      </div>

      <TakeControlEnrollPanel
        compact
        hideFooter
        upfrontPaise={quote.upfront_base_paise}
        gstPaise={quote.gst_paise}
        totalPaise={quote.total_paise}
        monthlyBasePaise={quote.monthly_base_paise}
        showGst={pricingRegion === 'domestic'}
        discountPaise={quote.discount_paise}
        promoCode={quote.promo_code}
      />

      <div className="rounded-xl border border-slate-200">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800"
          onClick={() => setBillingOpen((open) => !open)}
        >
          Billing & promo
          <ChevronDown className={cn('h-4 w-4 transition-transform', billingOpen && 'rotate-180')} />
        </button>
        {billingOpen ? (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3">
            <BillingDetailsFields
              countries={countries}
              billingCountryCode={billingCountryCode}
              onBillingCountryChange={setBillingCountryCode}
              billingType={billingType}
              onBillingTypeChange={setBillingType}
              pricingRegion={pricingRegion}
              gstin={gstin}
              onGstinChange={setGstin}
              legalName={legalName}
              onLegalNameChange={handleLegalNameChange}
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

            <Field label="Promo code">
              <div className="flex gap-2">
                <TextInput value={promoCode} onChange={setPromoCode} placeholder="Enter code" />
                <Button type="button" variant="light" size="md" onClick={handleApplyPromo} disabled={quotePending}>
                  Apply
                </Button>
              </div>
            </Field>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Due today</span>
          <span className="text-lg font-extrabold text-slate-900">
            {formatInrFromPaise(quote.total_paise)}
            {quotePending ? ' …' : ''}
          </span>
        </div>
        {quote.discount_paise > 0 ? (
          <p className="mt-1 text-xs text-success">
            Promo {quote.promo_code}: −{formatInrFromPaise(quote.discount_paise)}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
          {error}
        </p>
      ) : null}

      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-stretch gap-2.5">
          {onBack ? (
            <Button
              type="button"
              variant="light"
              size="md"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={onBack}
              disabled={payPending}
              className="shrink-0 px-4"
            >
              Back
            </Button>
          ) : null}
          <Button
            type="button"
            variant="primary"
            size="md"
            className="flex-1"
            disabled={payPending || quotePending}
            onClick={() => void handlePay()}
            rightIcon={payPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          >
            {payPending ? 'Opening payment…' : `Pay ${formatInrFromPaise(quote.total_paise)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
