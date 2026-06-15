'use client';

import { Drumstick, Egg, Leaf, Salad, type LucideIcon } from 'lucide-react';
import { ChoiceCard } from '@/components/ui/choice-card';
import type { MealPreference } from '@/types/profile';

const MEAL_CARD_OPTIONS: {
  value: MealPreference;
  label: string;
  icon: LucideIcon;
  accent: string;
  accentInk: string;
}[] = [
  { value: 'vegan', label: 'Vegan', icon: Leaf, accent: '#10B981', accentInk: '#059669' },
  { value: 'veg', label: 'Vegetarian', icon: Salad, accent: '#F97316', accentInk: '#EA580C' },
  { value: 'veg_egg', label: 'Veg + eggs', icon: Egg, accent: '#F59E0B', accentInk: '#D97706' },
  { value: 'non_veg', label: 'Non-veg', icon: Drumstick, accent: '#EF4444', accentInk: '#DC2626' },
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
          <ChoiceCard
            key={option.value}
            role="radio"
            aria-checked={selected}
            selected={selected}
            disabled={disabled}
            accent={option.accent}
            accentInk={option.accentInk}
            onSelect={() => onChange(option.value)}
            className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 text-center"
          >
            <Icon size={28} strokeWidth={selected ? 2.25 : 1.75} />
            <span className="text-sm font-bold">{option.label}</span>
          </ChoiceCard>
        );
      })}
    </div>
  );
}
