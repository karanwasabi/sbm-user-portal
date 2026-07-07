'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { EnrollConsentCheckbox } from '@/components/enroll/enroll-consent-checkbox';
import { EnrollPricingSummary } from '@/components/enroll/enroll-pricing-summary';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { PhoneInput } from '@/components/profile/phone-input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast';
import { getCountryDialCode } from '@/lib/country-dial-codes';
import { openRazorpayOrderCheckout } from '@/lib/razorpay-checkout';
import { toTitleCase } from '@/lib/title-case';
import { getTrialCheckoutPreview, startTrialCheckout } from '@/utils/client-api';
import type { Country } from '@/types/reference';
import type { TrialCheckoutPreview, TrialProduct } from '@/types/trial';

type EnrollPageViewProps = {
  product: TrialProduct;
  pageTitle: string;
  welcomeProductParam: string;
  countries: Country[];
  suggestedCountryIso?: string;
};

export function EnrollPageView({
  product,
  pageTitle,
  welcomeProductParam,
  countries,
  suggestedCountryIso,
}: EnrollPageViewProps) {
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
  const whatsappDialIsoRef = useRef(suggestedCountryIso);

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

  const activeQuote = useMemo(() => {
    if (!preview) return null;
    return countryIso === 'IN' ? preview.domestic : preview.international;
  }, [preview, countryIso]);

  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c.iso_code,
        label: c.name,
      })),
    [countries]
  );

  const handleDialIsoChange = (iso: string) => {
    whatsappDialIsoRef.current = iso;
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

    setSubmitting(true);
    try {
      const start = await startTrialCheckout({
        product,
        first_name: toTitleCase(firstName.trim()),
        last_name: toTitleCase(lastName.trim()),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        country_code: countryIso,
        dpdp_consent: true,
      });

      const welcomeUrl = `/welcome/take-control?product=${encodeURIComponent(welcomeProductParam)}&session=${encodeURIComponent(start.checkout_session_id)}`;

      if (start.mock || !start.razorpay_key_id || !start.razorpay_order_id) {
        window.location.href = welcomeUrl;
        return;
      }

      await openRazorpayOrderCheckout({
        key: start.razorpay_key_id,
        orderId: start.razorpay_order_id,
        checkoutSessionId: start.checkout_session_id,
        description: `Take Control · ${start.cohort_name}`,
        pricingRegion: countryIso === 'IN' ? 'domestic' : 'international',
        returnDestination: welcomeUrl,
        prefill: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          contact: whatsapp.trim(),
        },
        onSuccess: () => {
          window.location.href = welcomeUrl;
        },
        onDismiss: () => setSubmitting(false),
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="account">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5 pb-28">
        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <SbmWordmark className="h-7 w-auto" />
          <h1 className="text-lg font-bold text-slate-900">{pageTitle}</h1>
        </div>

        {loadingPreview || !preview || !activeQuote ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <>
            <EnrollPricingSummary quote={activeQuote} cohortName={preview.cohort_name} startsOn={preview.starts_on} />

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
                  preferredDialIso={whatsappDialIsoRef.current}
                  onDialIsoChange={handleDialIsoChange}
                />
              </Field>
              <Field label="Country">
                <SearchableSelect
                  value={countryIso}
                  onChange={(value) => {
                    setCountryManuallySet(true);
                    setCountryIso(value);
                    const dial = getCountryDialCode(value);
                    if (dial && !whatsapp.trim()) {
                      whatsappDialIsoRef.current = value;
                    }
                  }}
                  options={countryOptions}
                  placeholder="Select country"
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
          </>
        )}
      </div>

      {!loadingPreview && preview && activeQuote ? (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <div className="mx-auto max-w-[420px]">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              rightIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {submitting ? 'Opening payment…' : 'Enroll & pay'}
            </Button>
          </div>
        </div>
      ) : null}
    </AuthLayout>
  );
}
