'use client';

import { Check, Drumstick, Egg, Leaf, Salad, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { fieldShell } from '@/lib/field-shell';
import type { MealPreference } from '@/types/profile';

const MEAL_CARD_OPTIONS: {
  value: MealPreference;
  label: string;
  icon: LucideIcon;
}[] = [
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
    <div role="radiogroup" aria-label="Meal preference" className="grid grid-cols-2 gap-2.5">
      {MEAL_CARD_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] px-3 py-4 text-center transition-all duration-120',
              fieldShell.focusRing,
              disabled && fieldShell.disabled,
              !disabled && selected && fieldShell.selected,
              !disabled && !selected && cn(fieldShell.default, fieldShell.hover, 'text-slate-800')
            )}
          >
            {selected ? (
              <Check size={14} className="absolute top-2.5 right-2.5 text-brand" strokeWidth={2.5} aria-hidden />
            ) : null}
            <Icon
              size={26}
              strokeWidth={selected ? 2.25 : 1.75}
              className={selected ? 'text-brand' : 'text-slate-400'}
            />
            <span className={cn('text-sm font-bold', selected ? 'text-slate-900' : 'text-slate-700')}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
