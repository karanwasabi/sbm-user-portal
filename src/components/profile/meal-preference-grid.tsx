'use client';

import { Drumstick, Egg, Leaf, Salad, type LucideIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { MealPreference } from '@/types/profile';

const MEAL_OPTIONS: { value: MealPreference; label: string; icon: LucideIcon }[] = [
  { value: 'vegan', label: 'Vegan', icon: Leaf },
  { value: 'veg', label: 'Vegetarian', icon: Salad },
  { value: 'veg_egg', label: 'Veg + eggs', icon: Egg },
  { value: 'non_veg', label: 'Non-veg', icon: Drumstick },
];

type MealPreferenceGridProps = {
  value: MealPreference | '';
  onChange: (value: MealPreference) => void;
  disabled?: boolean;
};

export function MealPreferenceGrid({ value, onChange, disabled }: MealPreferenceGridProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as MealPreference)}
      disabled={disabled}
      aria-label="Meal preference"
      className="grid grid-cols-2 gap-2"
    >
      {MEAL_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        return (
          <RadioGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className={cn(
              'relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border border-input bg-background p-3',
              'aspect-auto size-auto shadow-none after:hidden',
              'focus-visible:ring-2 focus-visible:ring-ring/40',
              selected
                ? 'border-primary bg-accent text-foreground ring-1 ring-primary/20'
                : 'text-muted-foreground hover:bg-muted/40',
              '[&_[data-slot=radio-group-indicator]]:hidden'
            )}
          >
            <Icon
              size={24}
              className={selected ? 'text-primary' : 'text-muted-foreground'}
              strokeWidth={selected ? 2.25 : 1.75}
            />
            <span className={cn('text-sm font-semibold', selected && 'text-foreground')}>{option.label}</span>
          </RadioGroupItem>
        );
      })}
    </RadioGroup>
  );
}
