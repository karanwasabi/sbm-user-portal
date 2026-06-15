'use client';

import { UtensilsCrossed } from 'lucide-react';
import { useMemo } from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { MEAL_OPTIONS, type MealPreference } from '@/types/profile';

type MealPreferenceSelectProps = {
  value: MealPreference | '';
  onChange: (value: MealPreference) => void;
  disabled?: boolean;
};

export function MealPreferenceSelect({ value, onChange, disabled }: MealPreferenceSelectProps) {
  const options = useMemo(() => MEAL_OPTIONS.map((option) => ({ value: option.value, label: option.label })), []);

  return (
    <SearchableSelect
      value={value}
      onChange={(next) => onChange(next as MealPreference)}
      options={options}
      placeholder="Select meal preference"
      leftIcon={<UtensilsCrossed size={16} />}
      disabled={disabled}
      searchable={false}
    />
  );
}
