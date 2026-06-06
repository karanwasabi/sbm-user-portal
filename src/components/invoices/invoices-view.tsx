'use client';

import { Download, Info, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';

const invoices = [
  { id: 'INV-2026-0042', date: 'May 11, 2026', amount: '₹3,540', status: 'Paid' },
  { id: 'INV-2026-0031', date: 'Apr 11, 2026', amount: '₹3,540', status: 'Paid' },
  { id: 'INV-2026-0018', date: 'Mar 11, 2026', amount: '₹3,540', status: 'Paid' },
];

export function InvoicesView() {
  return (
    <div className="flex flex-col gap-[18px] px-7 pt-6 pb-10">
      <Card className="border-dashed border-brand/30 bg-[#EEF0FF]/40">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-brand" />
          <p className="text-sm font-medium text-slate-700">
            Invoice history is coming soon. Sample rows below match the planned invoices screen.
          </p>
        </div>
      </Card>

      <Card>
        <SectionHead title="GST billing details" subtitle="Used on all future tax invoices" />
        <div className="rounded-[14px] border border-slate-100 bg-canvas-cool p-4 text-sm text-slate-600">
          <div className="font-bold text-slate-800">Individual billing</div>
          <div className="mt-1">GST address management will be editable once the billing API is available.</div>
        </div>
      </Card>

      <Card>
        <SectionHead title="Invoice history" subtitle="Download GST-compliant PDFs" />
        <div className="overflow-hidden rounded-[14px] border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas-cool text-[11px] font-bold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{inv.id}</td>
                  <td className="px-4 py-3 text-slate-700">{inv.date}</td>
                  <td className="px-4 py-3 text-slate-700">{inv.amount}</td>
                  <td className="px-4 py-3">
                    <Pill tone="success">{inv.status}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="light" size="sm" disabled leftIcon={<Download size={14} />}>
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="flex items-center gap-3 border-dashed">
        <Receipt size={20} className="text-brand" />
        <p className="text-sm text-slate-600">PDF downloads will connect to the billing API in a future release.</p>
      </Card>
    </div>
  );
}
