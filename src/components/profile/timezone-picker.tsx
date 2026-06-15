'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  filterOnboardingTimezoneGroups,
  getOnboardingTimezoneGroups,
  resolveOnboardingTimezoneId,
} from '@/domain/onboarding-timezones';
import { cn } from '@/lib/cn';
import { normalizeProfileTimezoneForDb } from '@/lib/profile-timezone';
import { TextInput } from '@/components/ui/text-input';

type TimezonePickerProps = {
  value: string;
  onChange: (ianaId: string) => void;
  disabled?: boolean;
};

export function TimezonePicker({ value, onChange, disabled = false }: TimezonePickerProps) {
  const groups = useMemo(() => getOnboardingTimezoneGroups(), []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const resolvedSelectionId = value ? resolveOnboardingTimezoneId(value) : '';
  const filtered = useMemo(() => filterOnboardingTimezoneGroups(groups, query), [groups, query]);

  const selectedLabel = useMemo(() => {
    if (!resolvedSelectionId) return '';
    const group = groups.find((g) => g.ids.includes(resolvedSelectionId));
    if (!group) return resolvedSelectionId;
    return `${group.title} (${group.offsetStr})`;
  }, [groups, resolvedSelectionId]);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center rounded-2xl border-[1.5px] border-slate-200 bg-white px-4 py-3.25 text-left text-sm font-medium text-slate-800 transition-all duration-120',
          disabled && 'cursor-not-allowed bg-slate-50 text-slate-400'
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', !selectedLabel && 'text-slate-400')}>
          {selectedLabel || 'Select timezone'}
        </span>
      </button>

      {open && !disabled ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-3">
            <TextInput
              value={query}
              onChange={setQuery}
              placeholder="Search city, country, or UTC offset"
              leftIcon={<Search size={16} />}
              autoFocus
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-slate-500">No timezones match your search.</li>
            ) : (
              filtered.map((group) => {
                const selected = resolvedSelectionId !== '' && group.ids.includes(resolvedSelectionId);
                const pickedId = group.ids.includes(resolvedSelectionId) ? resolvedSelectionId : group.ids[0]!;
                return (
                  <li key={group.key}>
                    <button
                      type="button"
                      className={cn(
                        'w-full rounded-xl px-3 py-3 text-left transition-colors',
                        selected ? 'bg-brand text-white' : 'hover:bg-slate-50'
                      )}
                      onClick={() => {
                        const canonical = normalizeProfileTimezoneForDb(pickedId);
                        if (canonical) onChange(canonical);
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <div className="text-sm font-bold">{group.title}</div>
                      <div className={cn('mt-0.5 text-xs', selected ? 'text-white/80' : 'text-slate-500')}>
                        {group.regionLabel} · {group.offsetStr}
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
