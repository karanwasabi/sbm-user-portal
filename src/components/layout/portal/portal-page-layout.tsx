import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { PortalPageShell } from '@/components/layout/portal/portal-page-shell';

type PortalPageAsideHighlight = {
  label: string;
  value: string;
};

type PortalPageLayoutProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  illustration: ReactNode;
  panelClassName: string;
  glowClassName?: string;
  highlights?: PortalPageAsideHighlight[];
  footer?: string;
};

export function PortalPageLayout({
  children,
  eyebrow,
  title,
  description,
  illustration,
  panelClassName,
  glowClassName = 'bg-white/30',
  highlights,
  footer,
}: PortalPageLayoutProps) {
  const aside = (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-slate-100/80 p-6 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.10)]',
        panelClassName
      )}
    >
      <div
        className={cn('pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl', glowClassName)}
      />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />

      <div className="relative z-10">
        {eyebrow && <p className="text-[10px] font-bold tracking-[0.16em] text-white/80 uppercase">{eyebrow}</p>}
        <h2 className={cn('text-xl font-extrabold tracking-tight text-white', eyebrow && 'mt-2')}>{title}</h2>
        <p className="mt-2 text-sm leading-relaxed font-medium text-white/85">{description}</p>

        <div className="my-6 flex justify-center">{illustration}</div>

        {highlights && highlights.length > 0 && (
          <div className="space-y-2.5 rounded-2xl border border-white/20 bg-black/10 p-4 backdrop-blur-sm">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-white/75">{item.label}</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {footer && (
          <div
            className={cn(
              'rounded-2xl border border-white/20 bg-black/10 p-4 backdrop-blur-sm',
              (highlights?.length ?? 0) > 0 ? 'mt-4' : 'mt-0'
            )}
          >
            <p className="text-sm leading-relaxed font-medium text-white/85">{footer}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PortalPageShell>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-10 xl:gap-14">
        <div className="min-w-0">
          <div className="mb-6 lg:hidden">{aside}</div>
          <div className="flex flex-col gap-[18px]">{children}</div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6">{aside}</div>
        </aside>
      </div>
    </PortalPageShell>
  );
}
