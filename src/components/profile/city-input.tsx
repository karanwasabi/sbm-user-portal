'use client';

import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TextInput } from '@/components/ui/text-input';
import type { CountryCity } from '@/types/reference';

type CityInputProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: CountryCity[];
  onSuggestionSelect?: (city: CountryCity) => void;
  disabled?: boolean;
};

export function CityInput({ value, onChange, suggestions, onSuggestionSelect, disabled }: CityInputProps) {
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 8);
    return suggestions.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [suggestions, value]);

  const showSuggestions = focused && filtered.length > 0 && !disabled;

  return (
    <div className="relative">
      <TextInput
        value={value}
        onChange={onChange}
        placeholder="City"
        disabled={disabled}
        leftIcon={<MapPin size={16} className="text-slate-400" />}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setFocused(false), 120);
        }}
      />
      {showSuggestions ? (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {filtered.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50',
                  value === city.name && 'bg-brand/5 text-brand'
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(city.name);
                  onSuggestionSelect?.(city);
                  setFocused(false);
                }}
              >
                {city.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
