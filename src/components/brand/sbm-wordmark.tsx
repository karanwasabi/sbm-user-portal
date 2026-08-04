import Image from 'next/image';
import { cn } from '@/lib/cn';

type SbmWordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'dark' | 'light';
  showSubtitle?: boolean;
  className?: string;
};

const sizeConfig = {
  sm: { logo: 28, title: 'text-[13px]', subtitle: 'text-[8.5px]' },
  md: { logo: 36, title: 'text-sm', subtitle: 'text-[9px]' },
  lg: { logo: 56, title: 'text-[19px]', subtitle: 'text-[11px]' },
} as const;

export function SbmWordmark({ size = 'md', tone = 'dark', showSubtitle = true, className }: SbmWordmarkProps) {
  const config = sizeConfig[size];
  const isLg = size === 'lg';

  return (
    <div className={cn('flex max-w-full min-w-0 items-center', isLg ? 'gap-2 sm:gap-3.5' : 'gap-2.5', className)}>
      <Image
        src="/images/sbm-logo-circle.png"
        alt="Slow Burn Method"
        width={config.logo}
        height={config.logo}
        className={cn('shrink-0', isLg && 'h-10 w-10 sm:h-14 sm:w-14', tone === 'light' && 'brightness-0 invert')}
        priority
      />
      <div className="min-w-0 leading-tight">
        <div
          className={cn(
            'font-extrabold',
            isLg
              ? 'text-[13px] tracking-[0.06em] sm:text-[17px] sm:tracking-wide md:text-[19px]'
              : cn('tracking-wide whitespace-nowrap', config.title),
            tone === 'light' ? 'text-white' : 'text-brand'
          )}
        >
          SLOW BURN METHOD
        </div>
        {showSubtitle ? (
          <div
            className={cn(
              'mt-0.5 font-semibold tracking-[0.16em] uppercase',
              config.subtitle,
              tone === 'light' ? 'text-white/75' : 'text-slate-500'
            )}
          >
            Member portal
          </div>
        ) : null}
      </div>
    </div>
  );
}
