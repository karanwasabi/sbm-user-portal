'use client';

import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import {
  buildRenewCheckoutHref,
  RENEWAL_LANDING_CLOSING,
  RENEWAL_LANDING_CTA_LABEL,
  RENEWAL_LANDING_CTA_LEAD_IN,
  RENEWAL_LANDING_FEATURES,
  RENEWAL_LANDING_INTRO,
  RENEWAL_LANDING_PRICING,
  RENEWAL_LANDING_PRICING_INTRO,
  RENEWAL_LANDING_VALIDATION,
  renewalAnalyticsBase,
} from '@/components/renewal/renewal-landing-content';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { trackPortalEvent } from '@/lib/gtag';
import { trackMetaCustom } from '@/lib/meta-pixel';
import { captureUtmAttributionFromLocation } from '@/lib/utm-attribution';

const bodyClassName = 'text-sm leading-relaxed text-pretty text-slate-700 sm:text-base sm:leading-relaxed';
const sectionGapClassName = 'flex flex-col gap-7 sm:gap-8';

function FeatureCard({ index, children }: { index: number; children: ReactNode }) {
  return (
    <li
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_10px_28px_-18px_rgba(43,24,101,0.18)] sm:p-5',
        'before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-brand before:content-[""]'
      )}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-[0_6px_14px_-4px_rgba(92,101,207,0.45)] sm:h-9 sm:w-9 sm:text-sm"
          aria-hidden
        >
          {index + 1}
        </span>
        <p className={cn(bodyClassName, 'min-w-0')}>{children}</p>
      </div>
    </li>
  );
}

export function RenewalLandingView() {
  const searchParams = useSearchParams();
  const renewHref = buildRenewCheckoutHref(searchParams);

  useEffect(() => {
    captureUtmAttributionFromLocation();
    const params = renewalAnalyticsBase();
    trackPortalEvent('portal_renewal_landing_viewed', params);
    trackMetaCustom('PortalRenewalLandingViewed', params);
  }, []);

  const handleCtaClick = () => {
    const params = { ...renewalAnalyticsBase(), destination_path: renewHref };
    trackPortalEvent('portal_renewal_cta_clicked', params);
    trackMetaCustom('PortalRenewalCtaClicked', params);
  };

  return (
    <AuthLayout variant="register">
      <div className="mx-auto w-full max-w-3xl pb-10 sm:pb-12">
        <div className="text-center">
          <div className="mb-5 flex justify-center overflow-x-auto">
            <SbmWordmark size="lg" showSubtitle={false} />
          </div>
        </div>

        <div className={sectionGapClassName}>
          <section className="relative overflow-hidden rounded-2xl border border-brand/15 bg-linear-to-br from-brand/10 via-white to-lilac/20 px-5 py-6 sm:px-8 sm:py-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-brand/12 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-motivation/20 blur-3xl"
            />
            <p className="relative text-base leading-relaxed font-semibold text-pretty text-slate-900 sm:text-lg sm:leading-[1.65]">
              {RENEWAL_LANDING_INTRO}
            </p>
          </section>

          <section className="rounded-3xl bg-canvas-cool/70 px-3 py-4 sm:px-4 sm:py-5">
            <ul className="flex flex-col gap-3 sm:gap-3.5">
              {RENEWAL_LANDING_FEATURES.map((feature, index) => (
                <FeatureCard key={index} index={index}>
                  {feature}
                </FeatureCard>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-brand/20 bg-brand/5 px-5 py-5 sm:px-6 sm:py-6">
            <p className={bodyClassName}>{RENEWAL_LANDING_VALIDATION}</p>
          </section>

          <section className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:pt-7">
            <p className="text-base leading-relaxed font-semibold text-pretty text-slate-900 sm:text-lg">
              {RENEWAL_LANDING_PRICING_INTRO}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5">
              {RENEWAL_LANDING_PRICING.map((tier) => (
                <div
                  key={tier.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 sm:px-4"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{tier.label}</span>
                    {tier.discountLabel ? (
                      <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                        {tier.discountLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-900 tabular-nums">{tier.amount}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-deep from-0% via-brand via-55% to-[#6A71E6] px-5 py-6 shadow-[0_20px_44px_-20px_rgba(43,24,101,0.55)] sm:px-8 sm:py-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-8 right-0 h-32 w-32 rounded-full bg-white/15 blur-2xl"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <p className="text-center text-sm leading-relaxed text-pretty text-white/92 sm:max-w-[52%] sm:text-left sm:text-base">
                {RENEWAL_LANDING_CTA_LEAD_IN}
              </p>
              <div className="w-full shrink-0 sm:w-auto" onClick={handleCtaClick}>
                <Button
                  href={renewHref}
                  variant="light"
                  size="lg"
                  className="w-full min-w-44 border-b-white/50 bg-white px-8 text-brand-deep shadow-[0_14px_32px_-10px_rgba(15,23,42,0.45)] sm:w-auto"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {RENEWAL_LANDING_CTA_LABEL}
                </Button>
              </div>
            </div>
          </section>

          <footer className="border-t border-slate-100 pt-6 pb-1 sm:pt-7">
            <p className={cn(bodyClassName, 'text-center font-medium text-slate-600 sm:text-left')}>
              {RENEWAL_LANDING_CLOSING}
            </p>
          </footer>
        </div>
      </div>
    </AuthLayout>
  );
}
