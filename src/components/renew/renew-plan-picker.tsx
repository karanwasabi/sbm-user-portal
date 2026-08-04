'use client';

import { Check } from 'lucide-react';
import { renewPlanLabel } from '@/components/renew/renew-plan-label';
import { cn } from '@/lib/cn';
import { formatInrFromPaise } from '@/lib/money';

export type RenewPlanPickerOption = {
  planKey: string;
  basePaise: number;
  discountLabel?: string;
  pricingRegion?: 'domestic' | 'international';
  months?: number;
};

type RenewPlanPickerProps = {
  options: RenewPlanPickerOption[];
  selectedPlanKey: string;
  onSelect: (planKey: string) => void;
};

export function RenewPlanPicker({ options, selectedPlanKey, onSelect }: RenewPlanPickerProps) {
  const useTwoColumns = options.length === 2;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">Select your plan</p>
        <p className="mt-0.5 text-xs text-slate-500">Tap an option to see pricing below</p>
      </div>

      <div
        className={cn('grid gap-3', useTwoColumns ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}
        role="listbox"
        aria-label="Plan options"
      >
        {options.map((option) => {
          const selected = selectedPlanKey === option.planKey;
          const isDomestic = option.pricingRegion === 'domestic';
          const perMonthPaise =
            option.months && option.months > 1 ? Math.round(option.basePaise / option.months) : null;

          return (
            <button
              key={option.planKey}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(option.planKey)}
              className={cn(
                'group flex h-full flex-col rounded-2xl border p-4 text-left transition-all sm:p-5',
                selected
                  ? 'border-brand bg-linear-to-b from-brand/8 to-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] ring-2 ring-brand/25'
                  : 'border-slate-200 bg-white shadow-[0_8px_24px_-16px_rgba(15,23,42,0.28)] hover:border-slate-300 hover:shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base leading-snug font-bold text-slate-900">{renewPlanLabel(option.planKey)}</p>
                  {option.discountLabel ? (
                    <span className="mt-1.5 inline-block rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                      {option.discountLabel}
                    </span>
                  ) : null}
                </div>
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    selected ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-transparent'
                  )}
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-0.5">
                <p className="text-[1.65rem] leading-none font-extrabold tracking-tight text-slate-900">
                  {formatInrFromPaise(option.basePaise)}
                </p>
                {isDomestic ? <p className="text-sm font-semibold text-slate-500">+ GST</p> : null}
                {perMonthPaise ? (
                  <p className="text-xs font-medium text-slate-500">{formatInrFromPaise(perMonthPaise)}/month</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
