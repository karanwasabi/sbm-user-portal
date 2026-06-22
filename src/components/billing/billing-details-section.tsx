'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { BillingDetailsFields } from '@/components/billing/billing-details-fields';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHead } from '@/components/ui/section-head';
import type { BillingProfile, BillingProfilePatch } from '@/types/billing';
import { getFullName } from '@/types/profile';
import type { Country, CountryCity, CountryState } from '@/types/reference';
import { getCountries, getCountryCities, getCountryStates, patchBillingProfile } from '@/utils/client-api';

type BillingDetailsSectionProps = {
  initialProfile?: BillingProfile | null;
};

function defaultBillingProfile(memberName: string, countryCode?: string | null): BillingProfile {
  const code = countryCode?.trim().toUpperCase() || 'IN';
  return {
    pricing_region: code === 'IN' ? 'domestic' : 'international',
    billing_type: 'personal',
    billing_country_code: code,
    legal_name: memberName,
  };
}

function profileToFormState(profile: BillingProfile) {
  return {
    billingCountryCode: profile.billing_country_code || 'IN',
    billingType: profile.billing_type,
    gstin: profile.gstin ?? '',
    legalName: profile.legal_name ?? '',
    billingState: profile.billing_state ?? profile.billing_address?.state ?? '',
    addressLine1: profile.billing_address?.line1 ?? '',
    addressLine2: profile.billing_address?.line2 ?? '',
    billingCity: profile.billing_address?.city ?? '',
    postalCode: profile.billing_address?.postal_code ?? '',
  };
}

export function BillingDetailsSection({ initialProfile }: BillingDetailsSectionProps) {
  const router = useRouter();
  const { profile } = usePortalProfile();
  const memberName = profile ? getFullName(profile) : '';
  const resolvedProfile = useMemo(
    () => initialProfile ?? defaultBillingProfile(memberName, profile?.country_code),
    [initialProfile, memberName, profile?.country_code]
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCities, setCountryCities] = useState<CountryCity[]>([]);
  const [countryStates, setCountryStates] = useState<CountryState[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const initialForm = useMemo(() => profileToFormState(resolvedProfile), [resolvedProfile]);
  const [billingCountryCode, setBillingCountryCode] = useState(initialForm.billingCountryCode);
  const [billingType, setBillingType] = useState(initialForm.billingType);
  const [gstin, setGstin] = useState(initialForm.gstin);
  const [legalName, setLegalName] = useState(initialForm.legalName);
  const [billingState, setBillingState] = useState(initialForm.billingState);
  const [addressLine1, setAddressLine1] = useState(initialForm.addressLine1);
  const [addressLine2, setAddressLine2] = useState(initialForm.addressLine2);
  const [billingCity, setBillingCity] = useState(initialForm.billingCity);
  const [postalCode, setPostalCode] = useState(initialForm.postalCode);

  const pricingRegion = useMemo<'domestic' | 'international'>(
    () => (billingCountryCode === 'IN' ? 'domestic' : 'international'),
    [billingCountryCode]
  );
  const selectedCountry = useMemo(
    () => countries.find((country) => country.iso_code === billingCountryCode),
    [countries, billingCountryCode]
  );
  const billingCountry = selectedCountry?.name ?? billingCountryCode;
  const hasSubdivisions = countryStates.length > 0;

  useEffect(() => {
    const next = profileToFormState(resolvedProfile);
    setBillingCountryCode(next.billingCountryCode);
    setBillingType(next.billingType);
    setGstin(next.gstin);
    setLegalName(next.legalName);
    setBillingState(next.billingState);
    setAddressLine1(next.addressLine1);
    setAddressLine2(next.addressLine2);
    setBillingCity(next.billingCity);
    setPostalCode(next.postalCode);
  }, [resolvedProfile]);

  useEffect(() => {
    void getCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

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

  const handleBillingCountryChange = (code: string) => {
    setBillingCountryCode(code);
    setBillingCity('');
    setBillingState('');
    setSaved(false);
  };

  const handleCitySuggestion = (city: CountryCity) => {
    if (!city.state_code) return;
    const matchedState = countryStates.find((state) => state.state_code === city.state_code);
    if (matchedState) setBillingState(matchedState.name);
  };

  const buildPatch = useCallback((): BillingProfilePatch => {
    const trimmedGstin = gstin.trim().toUpperCase();
    return {
      billing_type: billingType,
      billing_country_code: billingCountryCode,
      legal_name: legalName.trim(),
      gstin: billingType === 'business' && pricingRegion === 'domestic' && trimmedGstin ? trimmedGstin : undefined,
      billing_state: billingState || undefined,
      billing_address: {
        line1: addressLine1,
        line2: addressLine2 || undefined,
        city: billingCity,
        state: hasSubdivisions ? billingState : '',
        postal_code: postalCode,
        country: billingCountry,
      },
    };
  }, [
    addressLine1,
    addressLine2,
    billingCity,
    billingCountry,
    billingCountryCode,
    billingState,
    billingType,
    gstin,
    hasSubdivisions,
    legalName,
    postalCode,
    pricingRegion,
  ]);

  const handleSave = async () => {
    const trimmedLegalName = legalName.trim();
    if (!trimmedLegalName) {
      setError('Legal name is required for billing.');
      return;
    }

    setPending(true);
    setError(null);
    setSaved(false);
    try {
      await patchBillingProfile(buildPatch());
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save billing details.');
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <SectionHead
        title="Billing details"
        subtitle="Name and address printed on tax invoices. Your coaching profile is managed separately."
      />
      <BillingDetailsFields
        countries={countries}
        billingCountryCode={billingCountryCode}
        onBillingCountryChange={handleBillingCountryChange}
        billingType={billingType}
        onBillingTypeChange={(type) => {
          setBillingType(type);
          setSaved(false);
        }}
        pricingRegion={pricingRegion}
        gstin={gstin}
        onGstinChange={(value) => {
          setGstin(value);
          setSaved(false);
        }}
        legalName={legalName}
        onLegalNameChange={(value) => {
          setLegalName(value);
          setSaved(false);
        }}
        addressLine1={addressLine1}
        onAddressLine1Change={(value) => {
          setAddressLine1(value);
          setSaved(false);
        }}
        addressLine2={addressLine2}
        onAddressLine2Change={(value) => {
          setAddressLine2(value);
          setSaved(false);
        }}
        billingCity={billingCity}
        onBillingCityChange={(value) => {
          setBillingCity(value);
          setSaved(false);
        }}
        billingState={billingState}
        onBillingStateChange={(value) => {
          setBillingState(value);
          setSaved(false);
        }}
        postalCode={postalCode}
        onPostalCodeChange={(value) => {
          setPostalCode(value);
          setSaved(false);
        }}
        countryCities={countryCities}
        countryStates={countryStates}
        loadingCities={loadingCities}
        loadingStates={loadingStates}
        onCitySuggestion={handleCitySuggestion}
        disabled={pending}
      />
      {error ? (
        <p className="mt-3 text-sm font-semibold text-danger-press" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? <p className="mt-3 text-sm font-medium text-success">Billing details saved.</p> : null}
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="primary" size="md" onClick={() => void handleSave()} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save billing details'}
        </Button>
      </div>
    </Card>
  );
}
