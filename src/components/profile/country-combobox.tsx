'use client';

import { Globe } from 'lucide-react';
import { useMemo } from 'react';
import { CountryFlag } from '@/components/ui/country-flag';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { Country } from '@/types/reference';

type CountryComboboxProps = {
  value: string;
  onChange: (isoCode: string) => void;
  countries: Country[];
  disabled?: boolean;
};

export function CountryCombobox({ value, onChange, countries, disabled }: CountryComboboxProps) {
  const options = useMemo(
    () =>
      countries.map((c) => ({
        value: c.iso_code,
        label: c.name,
        icon: <CountryFlag code={c.iso_code} />,
      })),
    [countries]
  );

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select country"
      searchPlaceholder="Search country"
      leftIcon={<Globe size={16} />}
      disabled={disabled}
      emptyMessage="No countries match your search."
    />
  );
}
