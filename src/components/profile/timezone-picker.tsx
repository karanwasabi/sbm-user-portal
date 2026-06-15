'use client';

import { Globe, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  filterOnboardingTimezoneGroups,
  getOnboardingTimezoneGroups,
  resolveOnboardingTimezoneId,
} from '@/domain/onboarding-timezones';
import { ChoiceCard } from '@/components/ui/choice-card';
import { TextInput } from '@/components/ui/text-input';
import { cn } from '@/lib/cn';
import { normalizeProfileTimezoneForDb } from '@/lib/profile-timezone';
import { useDismissiblePanel } from '@/lib/use-dismissible-panel';

type TimezonePickerProps = {
  value: string;
  onChange: (ianaId: string) => void;
  disabled?: boolean;
};

export function TimezonePicker({ value, onChange, disabled = false }: TimezonePickerProps) {
  const groups = useMemo(() => getOnboardingTimezoneGroups(), []);
  const { open, setOpen, rootRef, triggerProps, panelProps } = useDismissiblePanel({ disabled });
  const [query, setQuery] = useState('');
  const [triggerFocused, setTriggerFocused] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const resolvedSelectionId = value ? resolveOnboardingTimezoneId(value) : '';
  const filtered = useMemo(() => filterOnboardingTimezoneGroups(groups, query), [groups, query]);

  const selectedLabel = useMemo(() => {
    if (!resolvedSelectionId) return '';
    const group = groups.find((g) => g.ids.includes(resolvedSelectionId));
    if (!group) return resolvedSelectionId;
    return `${group.title} (${group.offsetStr})`;
  }, [groups, resolvedSelectionId]);

  useEffect(() => {
    if (!open || !resolvedSelectionId || !listRef.current) return;
    const index = filtered.findIndex((g) => g.ids.includes(resolvedSelectionId));
    if (index < 0) return;
    const item = listRef.current.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [open, filtered, resolvedSelectionId]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        {...triggerProps}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setTriggerFocused(true)}
        onBlur={() => setTriggerFocused(false)}
        className={cn(
          'flex w-full items-center rounded-2xl border-[1.5px] bg-white px-4 py-3.25 text-left text-sm font-medium transition-all duration-120',
          disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'cursor-pointer text-slate-800',
          triggerFocused ? 'border-brand' : 'border-slate-200'
        )}
      >
        <Globe size={16} className="mr-2.5 shrink-0 text-slate-400" />
        <span className={cn('min-w-0 flex-1 truncate', !selectedLabel && 'text-slate-400')}>
          {selectedLabel || 'Select timezone'}
        </span>
      </button>

      {open && !disabled ? (
        <div
          {...panelProps}
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="border-b border-slate-100 p-3">
            <TextInput
              value={query}
              onChange={setQuery}
              placeholder="Search city, region, or UTC offset"
              leftIcon={<Search size={16} />}
              autoFocus
            />
          </div>
          <ul ref={listRef} className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-slate-500">No timezones match your search.</li>
            ) : (
              filtered.map((group) => {
                const selected = resolvedSelectionId !== '' && group.ids.includes(resolvedSelectionId);
                const pickedId = group.ids.includes(resolvedSelectionId) ? resolvedSelectionId : group.ids[0]!;
                return (
                  <li key={group.key} className="py-0.5">
                    <ChoiceCard
                      role="option"
                      aria-selected={selected}
                      selected={selected}
                      accent="var(--sbm-brand)"
                      accentInk="var(--sbm-brand-press)"
                      onSelect={() => {
                        const canonical = normalizeProfileTimezoneForDb(pickedId);
                        if (canonical) onChange(canonical);
                        setOpen(false);
                        setQuery('');
                      }}
                      className="rounded-xl px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold">{group.title}</div>
                          <div
                            className={cn('mt-0.5 text-xs font-medium', selected ? 'text-white/80' : 'text-slate-500')}
                          >
                            {group.regionLabel}
                          </div>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide',
                            selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {group.offsetStr}
                        </span>
                      </div>
                    </ChoiceCard>
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
