'use client';

import { Calendar, CreditCard, Info } from 'lucide-react';
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
    <div className="flex flex-col gap-[18px] px-7 pt-6 pb-10">
      <Card className="border-dashed border-brand/30 bg-[#EEF0FF]/40">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-brand" />
          <p className="text-sm font-medium text-slate-700">
            Subscription management is coming soon. Below is a preview of the planned layout.
          </p>
        </div>
      </Card>

      <Card>
        <SectionHead
          title="Take Control · Monthly"
          subtitle="Active subscription preview"
          right={<Pill tone="success">Active</Pill>}
        />
        <div className="flex items-center gap-4 rounded-[18px] border border-slate-100 bg-canvas-cool p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EEF0FF] text-brand">
            <CreditCard size={22} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-800">₹3,540 / month incl. GST</div>
            <div className="mt-0.5 text-xs text-slate-500">Next renewal · Jun 11, 2026 · UPI</div>
          </div>
          <Button variant="light" size="sm" disabled>
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
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {billingRows.map((row) => (
                <tr key={row.date} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.date}</td>
                  <td className="px-4 py-3 text-slate-700">{row.amount}</td>
                  <td className="px-4 py-3">
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
        <div className="flex items-center justify-between gap-4 rounded-[14px] border border-slate-100 bg-canvas-cool p-4">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-slate-500" />
            <div className="text-sm text-slate-600">Cancel flow will be available when billing API is connected.</div>
          </div>
          <Button variant="danger" size="sm" disabled>
            Cancel subscription
          </Button>
        </div>
      </Card>
    </div>
  );
}
