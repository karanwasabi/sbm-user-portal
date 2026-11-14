'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { LATE_NOV16_COHORT_LABEL } from '@/lib/late-nov16-enroll';
import { trackPortalEvent } from '@/lib/gtag';
import { trackMetaCustom } from '@/lib/meta-pixel';
import { captureUtmAttributionFromLocation } from '@/lib/utm-attribution';

const optionCardClassName =
  'flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] sm:p-6';

function LateNov16RegisterInner() {
  const searchParams = useSearchParams();
  const access = (searchParams.get('access') ?? '').trim();
  const accessQuery = access ? `?access=${encodeURIComponent(access)}` : '';

  useEffect(() => {
    captureUtmAttributionFromLocation();
    trackPortalEvent('portal_register_options_viewed', {
      page_path: '/register/late/nov16',
    });
    trackMetaCustom('PortalRegisterOptionsViewed', {
      page_path: '/register/late/nov16',
    });
  }, []);

  if (!access) {
    return (
      <AuthLayout variant="register">
        <div className="py-12 text-center">
          <p className="text-sm text-slate-600">This signup link is invalid or expired.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="register">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-center sm:block">
          <SbmWordmark size="lg" showSubtitle={false} />
        </div>
        <p className="text-center text-sm font-medium text-slate-500 sm:text-left">
          Late signup for <span className="font-bold text-brand">{LATE_NOV16_COHORT_LABEL}</span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={optionCardClassName}>
          <div className="flex min-h-6 items-start justify-end">
            <span
              aria-hidden
              className="invisible rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase"
            >
              WITH MONEYBACK GUARANTEE
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-900">MONTHLY</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            <li>Experience the whole SBM package in 4 weeks.</li>
            <li>Continue the membership if it feels like a fit after 1 month.</li>
          </ul>
          <div className="mt-auto pt-6">
            <p className="text-[2rem] leading-none font-bold tracking-tight text-slate-900">
              ₹4,000 <span className="text-xl font-medium text-slate-700">+ taxes</span>
            </p>
            <div className="mt-5">
              <Button
                href={`/enroll/late/nov16/monthly${accessQuery}`}
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Register for Monthly
              </Button>
            </div>
          </div>
        </section>

        <section className={optionCardClassName}>
          <div className="flex min-h-6 items-start justify-end">
            <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
              WITH MONEYBACK GUARANTEE
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-900">3-MONTH TAKE CONTROL PROGRAM</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            <li>12-week, structured flagship program</li>
            <li>
              Our Flagship program is backed by our Refund Policy. Money back if you don&apos;t see the progress in 12
              weeks.
            </li>
          </ul>
          <div className="mt-auto pt-6">
            <p className="text-[2rem] leading-none font-bold tracking-tight text-slate-900">
              ₹10,200 <span className="text-lg font-medium text-slate-400 line-through">₹12,000</span>{' '}
              <span className="text-xl font-medium text-slate-700">+ taxes</span>
            </p>
            <div className="mt-5">
              <Button
                href={`/enroll/late/nov16${accessQuery}`}
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Register for the 3 Month Program
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}

export default function LateNov16RegisterPage() {
  return (
    <Suspense fallback={null}>
      <LateNov16RegisterInner />
    </Suspense>
  );
}
