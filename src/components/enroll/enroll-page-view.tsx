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
import { combineWhatsapp, formatPhoneE164, parseWhatsapp } from '@/lib/phone-number';
import { openRazorpayOrderCheckout } from '@/lib/razorpay-checkout';
import { toTitleCase } from '@/lib/title-case';
import { validateWhatsappNumber } from '@/lib/whatsapp-validation';
import { getTrialCheckoutPreview, startTrialCheckout } from '@/utils/client-api';
import type { Country } from '@/types/reference';
import type { TrialCheckoutPreview, TrialProduct } from '@/types/trial';

type EnrollPageViewProps = {
  product: TrialProduct;
  welcomeProductParam: string;
  countries: Country[];
  suggestedCountryIso?: string;
};

export function EnrollPageView({ product, welcomeProductParam, countries, suggestedCountryIso }: EnrollPageViewProps) {
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
  const [whatsappDialIso, setWhatsappDialIso] = useState(suggestedCountryIso ?? 'IN');
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
      });

      const welcomeUrl = `/welcome/take-control?product=${encodeURIComponent(welcomeProductParam)}&session=${encodeURIComponent(start.checkout_session_id)}`;

      if (start.mock || !start.razorpay_key_id || !start.razorpay_order_id) {
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
        prefill: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          contact: whatsappE164,
          contactCountryIso: dialIso,
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
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-5">
        <div className="text-center">
          <div className="mb-5 flex justify-center overflow-x-auto">
            <SbmWordmark size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Take Control: <span className="text-brand">{enrollProgramLabel(product)}</span>
          </h1>
        </div>

        {loadingPreview || !preview || !activeQuote ? (
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
            </div>

            <EnrollPricingSummary product={product} quote={activeQuote} startsOn={preview.starts_on} />

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
