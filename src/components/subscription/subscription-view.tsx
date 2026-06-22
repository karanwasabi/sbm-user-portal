'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calendar, CreditCard, Loader2, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { SubscriptionPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { SubscriptionRenewalCardSkeleton } from '@/components/loading/subscription-page-skeleton';
import { openRazorpaySubscriptionCheckout } from '@/lib/razorpay-checkout';
import { formatInrFromPaise } from '@/lib/money';
import type { Subscription } from '@/types/subscription';
import { cancelSubscription, startPaymentMethodUpdate } from '@/utils/client-api';

type SubscriptionViewProps = {
  subscription: Subscription | null;
  error?: string | null;
};

function formatDisplayDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRenewalDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function renewalCountdownLabel(days: number | null): string {
  if (days == null) return 'Renewal Date Pending';
  if (days < 0) return 'Renewal Overdue';
  if (days === 0) return 'Renews Today';
  if (days === 1) return 'Renews Tomorrow';
  return `Renews in ${days} days`;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'active':
    case 'authenticated':
      return 'Active';
    case 'cancelling':
      return 'Cancelling';
    case 'cancelled':
      return 'Cancelled';
    case 'pending':
      return 'Payment Pending';
    case 'halted':
      return 'Payment Issue';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function statusTone(status: string): 'success' | 'brand' | 'danger' | 'neutral' {
  if (status === 'active' || status === 'authenticated') return 'success';
  if (status === 'cancelling' || status === 'pending') return 'brand';
  if (status === 'halted') return 'danger';
  return 'neutral';
}

export function SubscriptionView({ subscription, error }: SubscriptionViewProps) {
  const router = useRouter();
  const [cancelPending, setCancelPending] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [pageRefreshing, setPageRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setPageRefreshing(false);
  }, [subscription]);

  if (error === 'no_subscription' || (!subscription && !error)) {
    return (
      <PortalPageLayout
        eyebrow="Your Membership"
        title="Subscription"
        description="Enroll in Take Control to start your coach-led program. Your subscription and payment method live here once enrolled."
        illustration={<SubscriptionPageIllustration />}
        panelClassName="bg-gradient-to-br from-success via-[#34D399] to-success-press"
        glowClassName="bg-white/40"
        highlights={[
          { label: 'Status', value: 'Not Enrolled' },
          { label: 'Plan', value: 'Take Control' },
        ]}
      >
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">
            You don&apos;t have an active subscription yet. Complete enrollment to manage your plan and payment here.
          </p>
        </Card>
      </PortalPageLayout>
    );
  }

  if (!subscription) {
    return (
      <PortalPageLayout
        eyebrow="Your Membership"
        title="Subscription"
        description="Manage your plan renewal and payment method."
        illustration={<SubscriptionPageIllustration />}
        panelClassName="bg-gradient-to-br from-success via-[#34D399] to-success-press"
        glowClassName="bg-white/40"
        highlights={[]}
      >
        <p className="text-sm font-semibold text-danger-press" role="alert">
          {error ?? 'Failed to load subscription.'}
        </p>
      </PortalPageLayout>
    );
  }

  const accessEnd = subscription.access_until ?? subscription.next_renewal_at;
  const isCancelling = subscription.cancel_at_period_end || subscription.subscription_status === 'cancelling';
  const renewalDays = daysUntil(subscription.next_renewal_at);
  const monthlyTotalDisplay = formatInrFromPaise(subscription.monthly_total_paise);
  const monthlyBaseDisplay = formatInrFromPaise(subscription.monthly_base_paise);
  const monthlyGstDisplay = formatInrFromPaise(subscription.monthly_gst_paise);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      accessEnd
        ? `Cancel your subscription? You'll keep program access until ${formatDisplayDate(accessEnd)}. After that, billing stops but you can still use the member portal to re-enrol.`
        : 'Cancel your subscription? Billing will stop at the end of the current period.'
    );
    if (!confirmed) return;

    setCancelPending(true);
    setActionError(null);
    try {
      setPageRefreshing(true);
      await cancelSubscription(true);
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel subscription.');
    } finally {
      setCancelPending(false);
    }
  };

  const handleUpdatePayment = async () => {
    setUpdatePending(true);
    setActionError(null);
    try {
      const payload = await startPaymentMethodUpdate();
      await openRazorpaySubscriptionCheckout({
        key: payload.razorpay_key_id,
        subscriptionId: payload.subscription_id,
        description: subscription.plan_label,
        onSuccess: () => {
          setPageRefreshing(true);
          router.refresh();
        },
        onDismiss: () => setUpdatePending(false),
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to open payment update.');
    } finally {
      setUpdatePending(false);
    }
  };

  return (
    <PortalPageLayout
      eyebrow="Your Membership"
      title={subscription.program_name}
      description="Manage your monthly membership and payment method."
      illustration={<SubscriptionPageIllustration />}
      panelClassName="bg-gradient-to-br from-success via-[#34D399] to-success-press"
      glowClassName="bg-white/40"
      highlights={[
        { label: 'Status', value: statusLabel(subscription.subscription_status) },
        {
          label: isCancelling ? 'Access Until' : 'Next Renewal',
          value: formatDisplayDate(isCancelling ? accessEnd : subscription.next_renewal_at),
        },
      ]}
    >
      {actionError ? (
        <p className="text-sm font-semibold text-danger-press" role="alert">
          {actionError}
        </p>
      ) : null}

      {pageRefreshing ? (
        <SubscriptionRenewalCardSkeleton />
      ) : (
        <Card className="overflow-hidden border-slate-200 p-0">
          <div className="border-b border-slate-100 bg-gradient-to-br from-canvas-cool to-white px-5 py-6 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                  {isCancelling ? 'Access Ends' : 'Next Renewal'}
                </p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {formatRenewalDate(isCancelling ? accessEnd : subscription.next_renewal_at)}
                </p>
                {!isCancelling ? (
                  <p className="mt-2 text-sm font-semibold text-brand">{renewalCountdownLabel(renewalDays)}</p>
                ) : (
                  <p className="mt-2 text-sm font-medium text-slate-600">Billing stops after this date.</p>
                )}
              </div>
              <Pill tone={statusTone(subscription.subscription_status)}>
                {statusLabel(subscription.subscription_status)}
              </Pill>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[14px] border border-slate-100 bg-white px-4 py-3">
                <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">Amount Due</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{monthlyTotalDisplay}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {monthlyBaseDisplay} + {monthlyGstDisplay} GST
                </p>
              </div>
              <div className="rounded-[14px] border border-slate-100 bg-white px-4 py-3">
                <p className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">Payment Method</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="min-w-0 text-sm font-bold text-slate-800">
                    {subscription.payment_method_summary ?? 'Card on File'}
                  </p>
                  {subscription.can_update_payment ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 px-0 text-brand hover:bg-transparent hover:text-brand-deep"
                      onClick={handleUpdatePayment}
                      disabled={updatePending}
                    >
                      {updatePending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Update Payment
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-success/10 text-success">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{subscription.program_name}</p>
                <p className="text-xs text-slate-500">Monthly membership · auto-renews</p>
              </div>
            </div>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep"
            >
              <Receipt className="h-4 w-4" />
              View Invoice History
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      )}

      {!pageRefreshing && subscription.can_cancel ? (
        <Card>
          <SectionHead
            title="Cancel Subscription"
            subtitle="Stops the next renewal. Access continues until period end."
          />
          <div className="flex items-center justify-between gap-4 rounded-[14px] border border-slate-100 bg-canvas-cool p-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Calendar size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <p className="text-sm leading-relaxed text-slate-600">
                If you cancel today, you keep program access until{' '}
                <span className="font-semibold text-slate-800">{formatDisplayDate(accessEnd)}</span>.
              </p>
            </div>
            <Button variant="danger" size="sm" className="shrink-0" onClick={handleCancel} disabled={cancelPending}>
              {cancelPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Subscription'}
            </Button>
          </div>
        </Card>
      ) : !pageRefreshing && subscription.cancel_at_period_end ? (
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">
            Your subscription is set to cancel. Program access continues until{' '}
            <span className="font-semibold text-slate-800">{formatDisplayDate(accessEnd)}</span>.
          </p>
        </Card>
      ) : null}
    </PortalPageLayout>
  );
}
