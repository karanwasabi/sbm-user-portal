'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { SEX_OPTIONS, type Sex } from '@/types/profile';

type SexSegmentedRadioProps = {
  value: Sex | '';
  onChange: (value: Sex) => void;
  disabled?: boolean;
};

export function SexSegmentedRadio({ value, onChange, disabled }: SexSegmentedRadioProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as Sex)}
      disabled={disabled}
      aria-label="Sex"
      className="flex w-full rounded-2xl border border-input bg-muted/50 p-1"
    >
      {SEX_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <RadioGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className={cn(
              'relative flex h-10 flex-1 items-center justify-center rounded-xl border-0 bg-transparent p-0 shadow-none',
              'aspect-auto size-auto after:hidden focus-visible:ring-2 focus-visible:ring-ring/40',
              'text-sm font-semibold transition-all',
              selected
                ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
              '[&_[data-slot=radio-group-indicator]]:hidden'
            )}
          >
            {option.label}
          </RadioGroupItem>
        );
      })}
    </RadioGroup>
  );
}
