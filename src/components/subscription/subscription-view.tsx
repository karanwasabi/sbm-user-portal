'use client';

import { useRouter } from 'next/navigation';
import { Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { SubscriptionPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { openRazorpaySubscriptionCheckout } from '@/lib/razorpay-checkout';
import { formatInrFromPaise } from '@/lib/money';
import type { Subscription } from '@/types/subscription';
import type { BillingProfile } from '@/types/billing';
import { cancelSubscription, startPaymentMethodUpdate } from '@/utils/client-api';
import { SubscriptionBillingSection } from '@/components/subscription/subscription-billing-section';

type SubscriptionViewProps = {
  subscription: Subscription | null;
  billingProfile?: BillingProfile | null;
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
      return 'Payment pending';
    case 'halted':
      return 'Payment issue';
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

function scheduleStatusTone(status: string): 'success' | 'brand' {
  return status === 'paid' ? 'success' : 'brand';
}

export function SubscriptionView({ subscription, billingProfile, error }: SubscriptionViewProps) {
  const router = useRouter();
  const [cancelPending, setCancelPending] = useState(false);
  const [updatePending, setUpdatePending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error === 'no_subscription' || (!subscription && !error)) {
    return (
      <PortalPageLayout
        eyebrow="Your membership"
        title="Subscription"
        description="Enroll in Take Control to start your coach-led program with simple monthly billing."
        illustration={<SubscriptionPageIllustration />}
        panelClassName="bg-gradient-to-br from-success via-[#34D399] to-success-press"
        glowClassName="bg-white/40"
        highlights={[
          { label: 'Status', value: 'Not enrolled' },
          { label: 'Plan', value: 'Take Control' },
        ]}
      >
        <Card>
          <p className="text-sm leading-relaxed text-slate-600">
            You don&apos;t have an active subscription yet. Complete enrollment to manage billing here.
          </p>
        </Card>
      </PortalPageLayout>
    );
  }

  if (!subscription) {
    return (
      <PortalPageLayout
        eyebrow="Your membership"
        title="Subscription"
        description="Manage your plan, payment method, and billing schedule."
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
  const monthlyDisplay = `${formatInrFromPaise(subscription.monthly_base_paise)} + GST`;
  const monthlyTotalDisplay = formatInrFromPaise(subscription.monthly_total_paise);

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
        onSuccess: () => router.refresh(),
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
      eyebrow="Your membership"
      title={subscription.plan_label}
      description="Coach-led program with simple monthly billing. Update your payment method or review past charges anytime."
      illustration={<SubscriptionPageIllustration />}
      panelClassName="bg-gradient-to-br from-success via-[#34D399] to-success-press"
      glowClassName="bg-white/40"
      highlights={[
        { label: 'Status', value: statusLabel(subscription.subscription_status) },
        { label: 'Next renewal', value: formatDisplayDate(subscription.next_renewal_at).replace(/, \d{4}$/, '') },
        { label: 'Amount', value: monthlyTotalDisplay },
      ]}
    >
      {actionError ? (
        <p className="text-sm font-semibold text-danger-press" role="alert">
          {actionError}
        </p>
      ) : null}

      <Card>
        <SectionHead
          title="Current plan"
          subtitle="Coach-led program · active membership"
          right={
            <Pill tone={statusTone(subscription.subscription_status)}>
              {statusLabel(subscription.subscription_status)}
            </Pill>
          }
        />
        <div className="flex flex-col gap-4 rounded-[18px] border border-slate-100 bg-canvas-cool p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-success/10 text-success">
              <CreditCard size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-800">{monthlyDisplay} / month</div>
              <div className="mt-0.5 text-xs text-slate-500">
                Next renewal · {formatDisplayDate(subscription.next_renewal_at)}
                {subscription.payment_method_summary ? ` · ${subscription.payment_method_summary}` : ''}
              </div>
            </div>
          </div>
          {subscription.can_update_payment ? (
            <Button
              variant="light"
              size="sm"
              className="shrink-0 self-start sm:self-center"
              onClick={handleUpdatePayment}
              disabled={updatePending}
            >
              {updatePending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update payment'}
            </Button>
          ) : null}
        </div>
      </Card>

      <SubscriptionBillingSection initialProfile={billingProfile} />

      <Card>
        <SectionHead title="Billing schedule" subtitle="Upcoming and past charges" />
        {subscription.billing_schedule.length === 0 ? (
          <p className="text-sm text-slate-600">No charges recorded yet.</p>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-cool text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscription.billing_schedule.map((row) => (
                  <tr key={`${row.kind}-${row.date}-${row.status}`} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{formatDisplayDate(row.date)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatInrFromPaise(row.amount_paise)}</td>
                    <td className="px-4 py-3 text-right">
                      <Pill tone={scheduleStatusTone(row.status)}>
                        {row.status === 'paid' ? 'Paid' : row.status === 'upcoming' ? 'Upcoming' : row.status}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {subscription.can_cancel ? (
        <Card>
          <SectionHead
            title="Cancel subscription"
            subtitle="Stops the next renewal. Access continues until period end."
          />
          <div className="rounded-[14px] border border-slate-100 bg-canvas-cool p-4">
            <div className="flex gap-3">
              <Calendar size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <div>
                <p className="text-sm leading-relaxed text-slate-600">
                  If you cancel today, you keep program access until{' '}
                  <span className="font-semibold text-slate-800">{formatDisplayDate(accessEnd)}</span>. After that,
                  billing stops. You can still use the member portal to view invoices and re-enrol.
                </p>
                <Button variant="danger" size="sm" className="mt-4" onClick={handleCancel} disabled={cancelPending}>
                  {cancelPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel subscription'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : subscription.cancel_at_period_end ? (
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
