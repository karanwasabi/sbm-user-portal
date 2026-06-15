'use client';

import { MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { Combobox } from '@/components/ui/combobox';
import type { CountryCity } from '@/types/reference';

type CityComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: CountryCity[];
  onSuggestionSelect?: (city: CountryCity) => void;
  disabled?: boolean;
  loading?: boolean;
};

export function CityCombobox({
  value,
  onChange,
  suggestions,
  onSuggestionSelect,
  disabled,
  loading,
}: CityComboboxProps) {
  const options = useMemo(
    () =>
      suggestions.map((c) => ({
        value: c.name,
        label: c.name,
        searchText: c.name,
      })),
    [suggestions]
  );

  return (
    <Combobox
      allowFreeText
      freeTextValue={value}
      onFreeTextChange={onChange}
      value={value}
      onChange={onChange}
      options={options}
      placeholder="City"
      leftIcon={<MapPin size={16} className="text-slate-400" />}
      disabled={disabled}
      loading={loading}
      emptyMessage="No city suggestions — you can still type your city."
      onOptionSelect={(option) => {
        const city = suggestions.find((c) => c.name === option.value);
        if (city) onSuggestionSelect?.(city);
      }}
    />
  );
}
