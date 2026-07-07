'use client';

import { CalendarDays } from 'lucide-react';
import { formatInrFromPaise } from '@/lib/money';
import type { TrialProduct, TrialQuote } from '@/types/trial';

type EnrollPricingSummaryProps = {
  product: TrialProduct;
  quote: TrialQuote;
  startsOn: string;
};

function formatStartDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function priceDurationLabel(product: TrialProduct): string {
  return product === 'trial_1m' ? '1 month' : '3 months';
}

export function enrollProgramLabel(product: TrialProduct): string {
  return product === 'trial_1m' ? '1 month trial' : '3 months';
}

export function EnrollPricingSummary({ product, quote, startsOn }: EnrollPricingSummaryProps) {
  const isDomestic = quote.pricing_region === 'domestic';
  const showGst = isDomestic;
  const hasDiscount = (quote.discount_paise ?? 0) > 0;
  const showBreakdown = showGst || hasDiscount;
  const detailLineClass = 'text-sm font-medium text-slate-500';

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      aria-label="Program pricing"
    >
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-end justify-between gap-4">
          <div className="shrink-0 text-left">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-brand" aria-hidden />
              <p className={detailLineClass}>Starts</p>
            </div>
            <p className={`mt-0.5 pl-6 ${detailLineClass}`}>{formatStartDate(startsOn)}</p>
          </div>
          <div className="min-w-0 shrink text-right">
            <p className="text-xl font-extrabold tracking-tight text-slate-900">
              {formatInrFromPaise(hasDiscount ? quote.total_paise : quote.base_paise)}
              {showGst && !hasDiscount ? <span className="text-base font-bold text-slate-600"> + GST</span> : null}
            </p>
            <p className={`mt-0.5 ${detailLineClass}`}>for {priceDurationLabel(product)}</p>
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
                <dt>{quote.promo_code ? `Discount (${quote.promo_code})` : 'Discount'}</dt>
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
