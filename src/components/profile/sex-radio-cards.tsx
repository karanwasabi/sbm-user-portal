'use client';

import { ChoiceCard } from '@/components/ui/choice-card';
import type { Sex } from '@/types/profile';

const SEX_CARD_OPTIONS: { value: Sex; label: string; accent: string; accentInk: string }[] = [
  { value: 'female', label: 'Female', accent: '#E83D84', accentInk: '#C02D69' },
  { value: 'male', label: 'Male', accent: '#3B82F6', accentInk: '#2563EB' },
  { value: 'others', label: 'Others', accent: '#64748B', accentInk: '#475569' },
];

type SexRadioCardsProps = {
  value: Sex | '';
  onChange: (value: Sex) => void;
  disabled?: boolean;
};

export function SexRadioCards({ value, onChange, disabled }: SexRadioCardsProps) {
  return (
    <div role="radiogroup" aria-label="Sex" className="flex flex-col gap-2">
      {SEX_CARD_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          selected={value === option.value}
          disabled={disabled}
          accent={option.accent}
          accentInk={option.accentInk}
          onSelect={() => onChange(option.value)}
          className="rounded-2xl px-4 py-3.25 text-sm font-bold"
        >
          {option.label}
        </ChoiceCard>
      ))}
    </div>
  );
}
