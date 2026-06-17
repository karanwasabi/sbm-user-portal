import { ArrowRight, MessageCircle, Sparkles, Target, Video } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatInrFromPaise } from '@/lib/money';
import { Button } from '@/components/ui/button';

const includes = [
  { icon: MessageCircle, text: 'Coach support on WhatsApp', iconWrap: 'bg-success/12 text-success' },
  { icon: Video, text: 'Live webinars', iconWrap: 'bg-motivation/15 text-amber' },
  { icon: Sparkles, text: 'Flexible nutrition guidance', iconWrap: 'bg-lilac/30 text-brand-deep' },
  {
    icon: Target,
    text: 'Weekly goal reviews tailored to your progress',
    iconWrap: 'bg-brand/10 text-brand',
  },
] as const;

type TakeControlEnrollPanelProps = {
  onEnroll?: () => void;
  pending?: boolean;
  error?: string | null;
  compact?: boolean;
  hideFooter?: boolean;
  upfrontPaise?: number;
  gstPaise?: number;
  totalPaise?: number;
  monthlyBasePaise?: number;
  showGst?: boolean;
  discountPaise?: number;
  promoCode?: string | null;
};

export function TakeControlEnrollPanel({
  onEnroll,
  pending = false,
  error,
  compact = false,
  hideFooter = false,
  upfrontPaise = 1_000_000,
  gstPaise = 180_000,
  totalPaise,
  monthlyBasePaise = 150_000,
  showGst = true,
  discountPaise = 0,
  promoCode,
}: TakeControlEnrollPanelProps) {
  const displayTotal = totalPaise ?? upfrontPaise + gstPaise;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', compact && 'gap-3')}>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-900">Take Control</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Coach-led program · 3 months to start, then monthly
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="text-xl font-extrabold tracking-tight text-slate-900">
            {formatInrFromPaise(upfrontPaise)}
            {showGst ? <span className="text-base font-bold text-slate-600"> + GST</span> : null}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">for the first 3 months</p>
          {discountPaise > 0 ? (
            <p className="mt-1 text-xs font-semibold text-success">
              {promoCode ? `${promoCode}: ` : ''}−{formatInrFromPaise(discountPaise)} · pay{' '}
              {formatInrFromPaise(displayTotal)}
            </p>
          ) : null}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
        {includes.map(({ icon: Icon, text, iconWrap }) => (
          <li key={text} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', iconWrap)}>
              <Icon size={14} />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-slate-500">
        Then {formatInrFromPaise(monthlyBasePaise)}
        {showGst ? ' + GST' : ''} / month · cancel anytime after the initial period.
      </p>

      {error ? (
        <p className="text-[12.5px] leading-snug font-semibold text-danger-press" role="alert">
          {error}
        </p>
      ) : null}

      {!hideFooter ? (
        <div className="mt-auto border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            disabled={pending}
            onClick={onEnroll}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {pending ? 'Enrolling…' : 'Enroll in Take Control'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export { includes as takeControlIncludes };
