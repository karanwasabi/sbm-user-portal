'use client';

import { formatInrFromPaise } from '@/lib/money';
import type { TrialQuote } from '@/types/trial';

type EnrollPricingSummaryProps = {
  quote: TrialQuote;
  cohortName: string;
  startsOn: string;
  title?: string;
};

function formatDateLabel(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function EnrollPricingSummary({ quote, cohortName, startsOn, title = 'Due today' }: EnrollPricingSummaryProps) {
  const isDomestic = quote.pricing_region === 'domestic';

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
      <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{formatInrFromPaise(quote.total_paise)}</p>
      <dl className="mt-3 space-y-1.5 text-[12.5px] text-slate-600">
        <div className="flex justify-between gap-3">
          <dt>Program fee</dt>
          <dd className="font-medium text-slate-800">{formatInrFromPaise(quote.base_paise)}</dd>
        </div>
        {isDomestic && quote.gst_paise > 0 ? (
          <div className="flex justify-between gap-3">
            <dt>GST (18%)</dt>
            <dd className="font-medium text-slate-800">{formatInrFromPaise(quote.gst_paise)}</dd>
          </div>
        ) : null}
        {!isDomestic && (quote.conversion_paise ?? 0) > 0 ? (
          <div className="flex justify-between gap-3">
            <dt>International processing (9%)</dt>
            <dd className="font-medium text-slate-800">{formatInrFromPaise(quote.conversion_paise ?? 0)}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 text-[12px] text-slate-500">
        {cohortName} · starts {formatDateLabel(startsOn)}
      </p>
    </div>
  );
}
