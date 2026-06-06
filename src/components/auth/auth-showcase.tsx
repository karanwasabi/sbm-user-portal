import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';

export type ShowcaseBullet = {
  icon: ReactNode;
  eyebrow: string;
  text: string;
};

type AuthShowcaseProps = {
  eyebrow: string;
  headline: ReactNode;
  bullets: ShowcaseBullet[];
  footer?: ReactNode;
};

export function AuthShowcase({ eyebrow, headline, bullets, footer }: AuthShowcaseProps) {
  return (
    <div className="relative flex h-full min-h-full items-center justify-center overflow-hidden bg-linear-to-br from-brand-deep from-0% via-brand via-60% to-[#6A71E6] to-100% p-12">
      <div aria-hidden="true" className="absolute -top-10 -right-10 h-80 w-80 rounded-full bg-white/18 blur-[50px]" />
      <div
        aria-hidden="true"
        className="absolute -bottom-22 -left-15 h-70 w-70 rounded-full bg-motivation opacity-40 blur-[60px]"
      />
      <div className="relative z-1 max-w-[460px] text-white">
        <Eyebrow color="light" className="mb-3.5">
          {eyebrow}
        </Eyebrow>
        <div className="text-[34px] leading-[1.08] font-extrabold tracking-tight">{headline}</div>
        <div className="mt-6.5 flex flex-col gap-3">
          {bullets.map((bullet) => (
            <div
              key={bullet.eyebrow}
              className="flex items-center gap-3.5 rounded-[18px] border-b-2 border-black/18 bg-white/14 px-4 py-3 backdrop-blur-md"
            >
              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-white/22">
                {bullet.icon}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold tracking-[0.14em] text-white/75 uppercase">{bullet.eyebrow}</div>
                <div className="mt-0.5 text-sm font-bold">{bullet.text}</div>
              </div>
            </div>
          ))}
        </div>
        {footer && <div className="mt-7 text-xs opacity-85">{footer}</div>}
      </div>
    </div>
  );
}
