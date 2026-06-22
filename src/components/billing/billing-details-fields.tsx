'use client';

import { useMemo } from 'react';
import { CityCombobox } from '@/components/profile/city-combobox';
import { CountryCombobox } from '@/components/profile/country-combobox';
import { Field } from '@/components/ui/field';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { TextInput } from '@/components/ui/text-input';
import { cn } from '@/lib/cn';
import { subdivisionLabelForCountry } from '@/lib/billing-subdivision-labels';
import type { Country, CountryCity, CountryState } from '@/types/reference';

type BillingDetailsFieldsProps = {
  countries: Country[];
  billingCountryCode: string;
  onBillingCountryChange: (code: string) => void;
  billingType: 'personal' | 'business';
  onBillingTypeChange: (type: 'personal' | 'business') => void;
  pricingRegion: 'domestic' | 'international';
  gstin: string;
  onGstinChange: (value: string) => void;
  legalName: string;
  onLegalNameChange: (value: string) => void;
  addressLine1: string;
  onAddressLine1Change: (value: string) => void;
  addressLine2: string;
  onAddressLine2Change: (value: string) => void;
  billingCity: string;
  onBillingCityChange: (value: string) => void;
  billingState: string;
  onBillingStateChange: (value: string) => void;
  postalCode: string;
  onPostalCodeChange: (value: string) => void;
  countryCities: CountryCity[];
  countryStates: CountryState[];
  loadingCities?: boolean;
  loadingStates?: boolean;
  onCitySuggestion?: (city: CountryCity) => void;
  disabled?: boolean;
  showLegalName?: boolean;
};

export function BillingDetailsFields({
  countries,
  billingCountryCode,
  onBillingCountryChange,
  billingType,
  onBillingTypeChange,
  pricingRegion,
  gstin,
  onGstinChange,
  legalName,
  onLegalNameChange,
  addressLine1,
  onAddressLine1Change,
  addressLine2,
  onAddressLine2Change,
  billingCity,
  onBillingCityChange,
  billingState,
  onBillingStateChange,
  postalCode,
  onPostalCodeChange,
  countryCities,
  countryStates,
  loadingCities = false,
  loadingStates = false,
  onCitySuggestion,
  disabled = false,
  showLegalName = true,
}: BillingDetailsFieldsProps) {
  const stateOptions = useMemo(
    () =>
      countryStates.map((state) => ({
        value: state.name,
        label: state.name,
        searchText: [state.name, state.state_code ?? ''].join(' ').trim(),
      })),
    [countryStates]
  );
  const hasSubdivisions = stateOptions.length > 0;
  const subdivisionLabel = subdivisionLabelForCountry(billingCountryCode);

  return (
    <div className="flex flex-col gap-3">
      <Field label="Billing Country">
        <CountryCombobox
          value={billingCountryCode}
          onChange={onBillingCountryChange}
          countries={countries}
          disabled={disabled}
        />
      </Field>
      <Field label="Billing Type">
        <div className="grid grid-cols-2 gap-2">
          {(['personal', 'business'] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium capitalize',
                billingType === type ? 'border-brand bg-brand/10 text-brand-deep' : 'border-slate-200 text-slate-600'
              )}
              onClick={() => onBillingTypeChange(type)}
              disabled={disabled}
            >
              {type}
            </button>
          ))}
        </div>
      </Field>
      {billingType === 'business' && pricingRegion === 'domestic' ? (
        <Field label="GSTIN">
          <TextInput value={gstin} onChange={onGstinChange} placeholder="15-character GSTIN" disabled={disabled} />
        </Field>
      ) : null}
      {showLegalName ? (
        <Field label="Legal Name">
          <TextInput value={legalName} onChange={onLegalNameChange} placeholder="Name on invoice" disabled={disabled} />
        </Field>
      ) : null}
      <Field label="Address Line 1">
        <TextInput
          value={addressLine1}
          onChange={onAddressLine1Change}
          placeholder="House / street / area"
          disabled={disabled}
        />
      </Field>
      <Field label="Address Line 2 (Optional)">
        <TextInput
          value={addressLine2}
          onChange={onAddressLine2Change}
          placeholder="Apartment, landmark"
          disabled={disabled}
        />
      </Field>
      <div className={cn('grid grid-cols-1 gap-3', hasSubdivisions ? 'sm:grid-cols-2' : '')}>
        <Field label="City">
          <CityCombobox
            value={billingCity}
            onChange={onBillingCityChange}
            suggestions={countryCities}
            onSuggestionSelect={onCitySuggestion}
            loading={loadingCities}
            disabled={disabled}
            showIcon={false}
          />
        </Field>
        {hasSubdivisions ? (
          <Field label={subdivisionLabel}>
            <SearchableSelect
              value={billingState}
              onChange={onBillingStateChange}
              options={stateOptions}
              placeholder={loadingStates ? 'Loading…' : `Select ${subdivisionLabel.toLowerCase()}`}
              searchPlaceholder={`Search ${subdivisionLabel.toLowerCase()}`}
              emptyMessage={`No ${subdivisionLabel.toLowerCase()}s found.`}
              disabled={disabled || loadingStates}
              scrollToSelectedOnOpen
              clearable
              clearLabel={`Clear ${subdivisionLabel.toLowerCase()}`}
            />
          </Field>
        ) : null}
      </div>
      <Field label="Postal Code">
        <TextInput value={postalCode} onChange={onPostalCodeChange} placeholder="PIN / ZIP code" disabled={disabled} />
      </Field>
    </div>
  );
}
