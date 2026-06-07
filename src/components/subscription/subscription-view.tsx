'use client';

import { Calendar, CreditCard } from 'lucide-react';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { SubscriptionPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';

const billingRows = [
  { date: 'Jun 11, 2026', amount: '₹3,540', status: 'Upcoming' },
  { date: 'May 11, 2026', amount: '₹3,540', status: 'Paid' },
  { date: 'Apr 11, 2026', amount: '₹3,540', status: 'Paid' },
];

export function SubscriptionView() {
  return (
    <PortalPageLayout
      eyebrow="Your membership"
      title="Take Control · Monthly"
      description="Coach-led program with simple monthly billing. Update your payment method or review past charges anytime."
      illustration={<SubscriptionPageIllustration />}
      panelClassName="bg-gradient-to-br from-success via-[#34D399] to-success-press"
      glowClassName="bg-white/40"
      highlights={[
        { label: 'Status', value: 'Active' },
        { label: 'Next renewal', value: 'Jun 11' },
        { label: 'Amount', value: '₹3,540' },
      ]}
    >
      <Card>
        <SectionHead
          title="Current plan"
          subtitle="Coach-led program · active membership"
          right={<Pill tone="success">Active</Pill>}
        />
        <div className="flex flex-col gap-4 rounded-[18px] border border-slate-100 bg-canvas-cool p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-success/10 text-success">
              <CreditCard size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-800">₹3,540 / month incl. GST</div>
              <div className="mt-0.5 text-xs text-slate-500">Next renewal · Jun 11, 2026 · UPI · anjali@okhdfcbank</div>
            </div>
          </div>
          <Button variant="light" size="sm" className="shrink-0 self-start sm:self-center">
            Update payment
          </Button>
        </div>
      </Card>

      <Card>
        <SectionHead title="Billing schedule" subtitle="Upcoming and past charges" />
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
              {billingRows.map((row) => (
                <tr key={row.date} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.date}</td>
                  <td className="px-4 py-3 text-slate-700">{row.amount}</td>
                  <td className="px-4 py-3 text-right">
                    <Pill tone={row.status === 'Paid' ? 'success' : 'brand'}>{row.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
                If you cancel today, you keep access until{' '}
                <span className="font-semibold text-slate-800">Jun 11, 2026</span>.
              </p>
              <Button variant="danger" size="sm" className="mt-4">
                Cancel subscription
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </PortalPageLayout>
  );
}
