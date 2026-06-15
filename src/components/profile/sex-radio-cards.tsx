'use client';

import { ChoiceOption } from '@/components/ui/choice-option';
import { SEX_OPTIONS, type Sex } from '@/types/profile';

type SexRadioCardsProps = {
  value: Sex | '';
  onChange: (value: Sex) => void;
  disabled?: boolean;
};

export function SexRadioCards({ value, onChange, disabled }: SexRadioCardsProps) {
  return (
    <div role="radiogroup" aria-label="Sex" className="flex flex-col gap-2">
      {SEX_OPTIONS.map((option) => (
        <ChoiceOption
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          selected={value === option.value}
          disabled={disabled}
          onSelect={() => onChange(option.value)}
          className="px-4 py-3.25"
        >
          {option.label}
        </ChoiceOption>
      ))}
    </div>
  );
}
