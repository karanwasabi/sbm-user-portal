'use client';

import { CalendarDays } from 'lucide-react';
import { renewPlanLabel } from '@/components/renew/renew-plan-label';
import { cn } from '@/lib/cn';
import { formatShortStartDate } from '@/lib/format-display-date';
import { formatInrFromPaise } from '@/lib/money';
import type { RenewQuote } from '@/types/renew';

type RenewPricingSummaryProps = {
  planKey: string;
  quote: RenewQuote;
  startsOn: string;
  /** When set, show extension from this date instead of cohort start (active renewers). */
  renewFromDate?: string;
};

export function RenewPricingSummary({ planKey, quote, startsOn, renewFromDate }: RenewPricingSummaryProps) {
  const isDomestic = quote.pricing_region === 'domestic';
  const showGst = isDomestic;
  const hasDiscount = (quote.discount_paise ?? 0) > 0;
  const discountedBasePaise = quote.base_paise - (quote.discount_paise ?? 0);
  const showBreakdown = true;
  const detailLineClass = 'text-sm font-medium text-slate-500';
  const renewFromLabel = renewFromDate ? formatShortStartDate(renewFromDate) : null;
  const startsLabel = formatShortStartDate(startsOn);
  const dateHeading = renewFromLabel ? 'Renews from' : 'Starts';
  const dateLabel = renewFromLabel ?? startsLabel;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      aria-label="Renewal pricing"
    >
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-end justify-between gap-4">
          <div className="shrink-0 text-left">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-brand" aria-hidden />
              <p className={detailLineClass}>{dateHeading}</p>
            </div>
            <p className={`mt-0.5 pl-6 ${detailLineClass}`}>{dateLabel}</p>
          </div>
          <div className="min-w-0 shrink text-right">
            <p
              className={cn(
                'text-xl font-extrabold tracking-tight text-slate-900',
                hasDiscount && 'text-sm font-semibold text-slate-400 line-through'
              )}
            >
              {formatInrFromPaise(quote.base_paise)}
              {showGst ? (
                <span className={cn('font-bold', hasDiscount ? 'text-xs' : 'text-base text-slate-600')}> + GST</span>
              ) : null}
            </p>
            {hasDiscount ? (
              <p className="text-lg font-extrabold tracking-tight text-success">
                {formatInrFromPaise(discountedBasePaise)}
                {showGst ? <span className="text-sm font-bold"> + GST</span> : null}
              </p>
            ) : null}
            <p className={`mt-0.5 ${detailLineClass}`}>{renewPlanLabel(planKey)}</p>
          </div>
        </div>

        {showBreakdown ? (
          <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[13px]">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-500">Program fee</dt>
              <dd className="font-semibold text-slate-800">{formatInrFromPaise(quote.base_paise)}</dd>
            </div>
            {hasDiscount ? (
              <div className="flex items-baseline justify-between gap-4 text-success">
                <dt>{quote.discount_label ? quote.discount_label : 'Discount'}</dt>
                <dd className="font-semibold">−{formatInrFromPaise(quote.discount_paise ?? 0)}</dd>
              </div>
            ) : null}
            {showGst ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-slate-500">GST (18%)</dt>
                <dd className="font-semibold text-slate-800">{formatInrFromPaise(quote.gst_paise)}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-slate-200 pt-3">
              <dt className="text-sm font-semibold text-slate-700">Due today</dt>
              <dd className="text-base font-extrabold tracking-tight text-slate-900">
                {formatInrFromPaise(quote.total_paise)}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
    </section>
  );
}
