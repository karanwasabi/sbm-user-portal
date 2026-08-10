'use client';

import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
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
import { trackPortalEvent } from '@/lib/gtag';
import { trackMetaCustom } from '@/lib/meta-pixel';
import { captureUtmAttributionFromLocation } from '@/lib/utm-attribution';

const featureCardClassName = 'rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5';
const pricingCardClassName =
  'rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] sm:p-5';
const bodyClassName = 'text-sm leading-relaxed text-slate-700 sm:text-base';

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
      <div className="mb-6 flex justify-center border-b border-slate-100 pb-5 sm:justify-start">
        <SbmWordmark size="lg" showSubtitle={false} />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <p className={bodyClassName}>{RENEWAL_LANDING_INTRO}</p>

        <ul className="flex flex-col gap-3">
          {RENEWAL_LANDING_FEATURES.map((feature) => (
            <li key={feature.slice(0, 32)} className={featureCardClassName}>
              <p className={bodyClassName}>{feature}</p>
            </li>
          ))}
        </ul>

        <p className={bodyClassName}>{RENEWAL_LANDING_VALIDATION}</p>

        <div className="flex flex-col gap-3">
          <p className={bodyClassName}>{RENEWAL_LANDING_PRICING_INTRO}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {RENEWAL_LANDING_PRICING.map((tier) => (
              <div key={tier.label} className={pricingCardClassName}>
                <p className="text-sm font-semibold text-slate-900">{tier.label}</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{tier.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 pt-2 sm:items-start">
          <p className={bodyClassName}>{RENEWAL_LANDING_CTA_LEAD_IN}</p>
          <div className="w-full sm:w-auto" onClick={handleCtaClick}>
            <Button
              href={renewHref}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {RENEWAL_LANDING_CTA_LABEL}
            </Button>
          </div>
        </div>

        <p className={bodyClassName}>{RENEWAL_LANDING_CLOSING}</p>
      </div>
    </AuthLayout>
  );
}
