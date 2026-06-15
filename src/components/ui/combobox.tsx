'use client';

import { ChevronDown, Search } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ListOption } from '@/components/ui/list-option';
import { TextInput } from '@/components/ui/text-input';
import { cn } from '@/lib/cn';
import { fieldShell } from '@/lib/field-shell';
import { useDismissiblePanel } from '@/lib/use-dismissible-panel';

export type ComboboxOption = {
  value: string;
  label: string;
  subtitle?: string;
  searchText?: string;
};

type ComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  leftIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  allowFreeText?: boolean;
  freeTextValue?: string;
  onFreeTextChange?: (value: string) => void;
  onOptionSelect?: (option: ComboboxOption) => void;
  className?: string;
};

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-brand/15 px-0.5 font-bold text-brand not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function TriggerShell({
  disabled,
  open,
  focused,
  leftIcon,
  children,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  triggerProps,
}: {
  disabled: boolean;
  open: boolean;
  focused: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  triggerProps: Record<string, unknown>;
}) {
  const active = open || focused;

  return (
    <button
      type="button"
      disabled={disabled}
      {...triggerProps}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        'flex w-full items-center px-4 py-3.25 text-left text-sm font-medium transition-all duration-120',
        fieldShell.base,
        fieldShell.focusRing,
        disabled ? fieldShell.disabled : active ? fieldShell.focused : fieldShell.default,
        !disabled && 'cursor-pointer text-slate-800'
      )}
    >
      {leftIcon ? (
        <span className={cn('mr-2.5 shrink-0', active ? 'text-brand' : 'text-slate-400')}>{leftIcon}</span>
      ) : null}
      {children}
      <ChevronDown
        size={16}
        className={cn('ml-2 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
      />
    </button>
  );
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  leftIcon,
  disabled = false,
  loading = false,
  emptyMessage = 'No matches found.',
  allowFreeText = false,
  freeTextValue,
  onFreeTextChange,
  onOptionSelect,
  className,
}: ComboboxProps) {
  const { open, setOpen, rootRef, triggerProps, panelProps } = useDismissiblePanel({ disabled });
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [triggerFocused, setTriggerFocused] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = allowFreeText ? (freeTextValue ?? selectedOption?.label ?? '') : (selectedOption?.label ?? '');

  const filtered = useMemo(() => {
    const q = (query || (allowFreeText ? freeTextValue : '') || '').trim().toLowerCase();
    if (!q) return options.slice(0, 50);
    return options
      .filter((o) => {
        const haystack = `${o.label} ${o.value} ${o.searchText ?? ''}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 50);
  }, [options, query, allowFreeText, freeTextValue]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setFocusedIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[focusedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  const selectOption = (option: ComboboxOption) => {
    onChange(option.value);
    onOptionSelect?.(option);
    setOpen(false);
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
      setFocusedIndex(0);
    }
  };

  const onSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && focusedIndex >= 0 && filtered[focusedIndex]) {
      event.preventDefault();
      selectOption(filtered[focusedIndex]!);
    }
  };

  const panelClassName =
    'absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)]';

  if (allowFreeText) {
    return (
      <div ref={rootRef} className={cn('relative', className)}>
        <TextInput
          value={freeTextValue ?? ''}
          onChange={(v) => onFreeTextChange?.(v)}
          placeholder={placeholder}
          leftIcon={leftIcon}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onKeyDown={onSearchKeyDown}
        />
        {open && !disabled ? (
          <div {...panelProps} className={panelClassName}>
            {loading ? (
              <p className="px-4 py-3 text-sm text-slate-500">Loading suggestions…</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">{emptyMessage}</p>
            ) : (
              <ul ref={listRef} className="max-h-60 overflow-y-auto p-1.5">
                {filtered.map((option, index) => (
                  <li key={option.value}>
                    <ListOption
                      aria-selected={value === option.value}
                      selected={value === option.value}
                      focused={focusedIndex === index}
                      onSelect={() => selectOption(option)}
                    >
                      <span className="text-sm font-semibold">
                        {highlightMatch(option.label, query || (freeTextValue ?? ''))}
                      </span>
                      {option.subtitle ? (
                        <span className="mt-0.5 block text-xs font-medium text-slate-500">{option.subtitle}</span>
                      ) : null}
                    </ListOption>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <TriggerShell
        disabled={disabled}
        open={open}
        focused={triggerFocused}
        leftIcon={leftIcon}
        triggerProps={triggerProps}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        onFocus={() => setTriggerFocused(true)}
        onBlur={() => setTriggerFocused(false)}
      >
        <span className={cn('min-w-0 flex-1 truncate', !displayLabel && 'text-slate-400')}>
          {displayLabel || placeholder}
        </span>
      </TriggerShell>

      {open && !disabled ? (
        <div {...panelProps} className={panelClassName}>
          <div className="border-b border-slate-100 p-3">
            <TextInput
              value={query}
              onChange={setQuery}
              placeholder={searchPlaceholder}
              leftIcon={<Search size={16} />}
              autoFocus
              onKeyDown={onSearchKeyDown}
            />
          </div>
          {loading ? (
            <p className="px-4 py-3 text-sm text-slate-500">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">{emptyMessage}</p>
          ) : (
            <ul ref={listRef} className="max-h-72 overflow-y-auto p-1.5">
              {filtered.map((option, index) => (
                <li key={option.value}>
                  <ListOption
                    aria-selected={value === option.value}
                    selected={value === option.value}
                    focused={focusedIndex === index}
                    onSelect={() => selectOption(option)}
                  >
                    <div className="text-sm font-semibold">{highlightMatch(option.label, query)}</div>
                    {option.subtitle ? (
                      <div className="mt-0.5 text-xs font-medium text-slate-500">{option.subtitle}</div>
                    ) : null}
                  </ListOption>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
