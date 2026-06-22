'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { BillingDetailsFields } from '@/components/billing/billing-details-fields';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { BillingAddressSkeleton } from '@/components/loading/billing-address-skeleton';
import {
  billingSnapshotsEqual,
  billingTypeLabel,
  currentBillingSnapshot,
  formatBillingAddressLine,
  type BillingFormSnapshot,
} from '@/lib/billing-display';
import type { BillingProfile, BillingProfilePatch } from '@/types/billing';
import { getFullName } from '@/types/profile';
import type { Country, CountryCity, CountryState } from '@/types/reference';
import {
  getBillingProfile,
  getCountries,
  getCountryCities,
  getCountryStates,
  patchBillingProfile,
} from '@/utils/client-api';

type BillingDetailsSectionProps = {
  initialProfile?: BillingProfile | null;
  initialCountries?: Country[];
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

function profileToFormState(profile: BillingProfile): BillingFormSnapshot {
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

function applySnapshot(snapshot: BillingFormSnapshot) {
  return {
    billingCountryCode: snapshot.billingCountryCode,
    billingType: snapshot.billingType,
    gstin: snapshot.gstin,
    legalName: snapshot.legalName,
    billingState: snapshot.billingState,
    addressLine1: snapshot.addressLine1,
    addressLine2: snapshot.addressLine2,
    billingCity: snapshot.billingCity,
    postalCode: snapshot.postalCode,
  };
}

type BillingAddressViewProps = {
  displayLegalName: string;
  displayAddressLine: string;
  displayGstin: string;
  billingType: 'personal' | 'business';
  onEdit: () => void;
};

function BillingAddressView({
  displayLegalName,
  displayAddressLine,
  displayGstin,
  billingType,
  onEdit,
}: BillingAddressViewProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[14px] border border-slate-100">
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0 text-sm leading-relaxed text-slate-700">
            <p className="font-semibold text-slate-900">{displayLegalName}</p>
            <p className="mt-1">{displayAddressLine}</p>
            {displayGstin ? <p className="mt-1 text-slate-600">GSTIN: {displayGstin}</p> : null}
          </div>
          <Pill tone="neutral" className="shrink-0">
            {billingTypeLabel(billingType)}
          </Pill>
        </div>
      </div>
      <Button type="button" variant="light" size="sm" className="shrink-0" onClick={onEdit}>
        Edit
      </Button>
    </div>
  );
}

export function BillingDetailsSection({ initialProfile, initialCountries }: BillingDetailsSectionProps) {
  const router = useRouter();
  const { profile } = usePortalProfile();
  const memberName = profile ? getFullName(profile) : '';

  const [savedProfile, setSavedProfile] = useState<BillingProfile | null>(initialProfile ?? null);
  const [viewSyncing, setViewSyncing] = useState(false);
  const [countries, setCountries] = useState<Country[]>(initialCountries ?? []);
  const [countriesLoading, setCountriesLoading] = useState(!initialCountries?.length);
  const [countryCities, setCountryCities] = useState<CountryCity[]>([]);
  const [countryStates, setCountryStates] = useState<CountryState[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const resolvedProfile = useMemo(
    () => savedProfile ?? defaultBillingProfile(memberName, profile?.country_code),
    [savedProfile, memberName, profile?.country_code]
  );
  const savedSnapshot = useMemo(() => profileToFormState(resolvedProfile), [resolvedProfile]);

  const [billingCountryCode, setBillingCountryCode] = useState(savedSnapshot.billingCountryCode);
  const [billingType, setBillingType] = useState(savedSnapshot.billingType);
  const [gstin, setGstin] = useState(savedSnapshot.gstin);
  const [legalName, setLegalName] = useState(savedSnapshot.legalName);
  const [billingState, setBillingState] = useState(savedSnapshot.billingState);
  const [addressLine1, setAddressLine1] = useState(savedSnapshot.addressLine1);
  const [addressLine2, setAddressLine2] = useState(savedSnapshot.addressLine2);
  const [billingCity, setBillingCity] = useState(savedSnapshot.billingCity);
  const [postalCode, setPostalCode] = useState(savedSnapshot.postalCode);

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

  const savedCountryName = useMemo(() => {
    const country = countries.find((entry) => entry.iso_code === savedSnapshot.billingCountryCode);
    return country?.name ?? savedSnapshot.billingCountryCode;
  }, [countries, savedSnapshot.billingCountryCode]);

  const currentSnapshot = useMemo(
    () =>
      currentBillingSnapshot({
        billingCountryCode,
        billingType,
        gstin,
        legalName,
        billingState,
        addressLine1,
        addressLine2,
        billingCity,
        postalCode,
      }),
    [
      addressLine1,
      addressLine2,
      billingCity,
      billingCountryCode,
      billingState,
      billingType,
      gstin,
      legalName,
      postalCode,
    ]
  );

  const isDirty = useMemo(
    () => !billingSnapshotsEqual(currentSnapshot, savedSnapshot),
    [currentSnapshot, savedSnapshot]
  );

  const resetForm = useCallback(() => {
    const next = applySnapshot(savedSnapshot);
    setBillingCountryCode(next.billingCountryCode);
    setBillingType(next.billingType);
    setGstin(next.gstin);
    setLegalName(next.legalName);
    setBillingState(next.billingState);
    setAddressLine1(next.addressLine1);
    setAddressLine2(next.addressLine2);
    setBillingCity(next.billingCity);
    setPostalCode(next.postalCode);
    setError(null);
    setSaved(false);
  }, [savedSnapshot]);

  useEffect(() => {
    setSavedProfile(initialProfile ?? null);
    setViewSyncing(false);
  }, [initialProfile]);

  useEffect(() => {
    if (viewSyncing) return;
    resetForm();
    setEditing(false);
  }, [resetForm, viewSyncing]);

  useEffect(() => {
    if (initialCountries?.length) {
      setCountries(initialCountries);
      setCountriesLoading(false);
      return;
    }
    setCountriesLoading(true);
    void getCountries()
      .then((rows) => {
        setCountries(rows);
      })
      .catch(() => setCountries([]))
      .finally(() => setCountriesLoading(false));
  }, [initialCountries]);

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

  const handleDiscard = () => {
    resetForm();
    setEditing(false);
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
      const updated = await patchBillingProfile(buildPatch());
      setViewSyncing(true);
      setEditing(false);
      router.refresh();
      try {
        const refreshed = await getBillingProfile();
        setSavedProfile(refreshed);
      } catch {
        setSavedProfile(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save billing details.');
    } finally {
      setPending(false);
      setViewSyncing(false);
    }
  };

  const displayLegalName = savedSnapshot.legalName.trim() || memberName.trim() || '—';
  const displayAddressLine = formatBillingAddressLine(savedSnapshot, savedCountryName);
  const displayGstin = savedSnapshot.gstin.trim();

  return (
    <Card>
      <SectionHead title="Billing Details" subtitle="Name and address printed on tax invoices." />

      {editing ? (
        <div className="flex flex-col gap-3">
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
            <p className="text-sm font-semibold text-danger-press" role="alert">
              {error}
            </p>
          ) : null}
          {saved ? <p className="text-sm font-medium text-success">Billing details saved.</p> : null}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="ghost" size="md" onClick={handleDiscard} disabled={pending}>
              {isDirty ? 'Discard' : 'Cancel'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => void handleSave()}
              disabled={pending || !isDirty}
              aria-busy={pending}
            >
              <span className="relative inline-flex items-center justify-center">
                <span className={pending ? 'opacity-0' : undefined}>Save Changes</span>
                {pending ? <Loader2 size={16} className="absolute animate-spin" aria-hidden /> : null}
              </span>
            </Button>
          </div>
        </div>
      ) : viewSyncing || countriesLoading ? (
        <BillingAddressSkeleton />
      ) : (
        <BillingAddressView
          displayLegalName={displayLegalName}
          displayAddressLine={displayAddressLine}
          displayGstin={displayGstin}
          billingType={savedSnapshot.billingType}
          onEdit={() => setEditing(true)}
        />
      )}
    </Card>
  );
}
