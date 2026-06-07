'use client';

import { Download } from 'lucide-react';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { InvoicesPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';

const invoices = [
  { id: 'INV-2026-0042', date: 'May 11, 2026', amount: '₹3,540', status: 'Paid' },
  { id: 'INV-2026-0031', date: 'Apr 11, 2026', amount: '₹3,540', status: 'Paid' },
  { id: 'INV-2026-0018', date: 'Mar 11, 2026', amount: '₹3,540', status: 'Paid' },
  { id: 'INV-2026-0009', date: 'Feb 11, 2026', amount: '₹3,540', status: 'Paid' },
];

export function InvoicesView() {
  return (
    <PortalPageLayout
      eyebrow="Billing records"
      title="Tax invoices"
      description="GST-compliant invoices for every charge. Download PDFs for your records or reimbursement."
      illustration={<InvoicesPageIllustration />}
      panelClassName="bg-gradient-to-br from-motivation via-amber to-[#E88A0C]"
      glowClassName="bg-white/35"
      highlights={[
        { label: 'Invoices on file', value: '4' },
        { label: 'Latest', value: 'May 11' },
        { label: 'Billing type', value: 'Individual' },
      ]}
    >
      <Card>
        <SectionHead title="GST billing details" subtitle="Issued on all tax invoices" />
        <div className="rounded-[14px] border border-slate-100 bg-canvas-cool p-4 text-sm text-slate-600">
          <div className="font-bold text-slate-800">Individual · no GSTIN</div>
          <div className="mt-2 leading-relaxed">
            Flat 304, Vasanth Apartments
            <br />
            14th Main, HSR Layout
            <br />
            Bengaluru, Karnataka 560102
          </div>
          <Button variant="light" size="sm" className="mt-4">
            Edit billing address
          </Button>
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
                <th className="px-4 py-3 text-right">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{inv.id}</td>
                  <td className="px-4 py-3 text-slate-700">{inv.date}</td>
                  <td className="px-4 py-3 text-slate-700">{inv.amount}</td>
                  <td className="px-4 py-3 text-right">
                    <Pill tone="success">{inv.status}</Pill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="light" size="sm" leftIcon={<Download size={14} />}>
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalPageLayout>
  );
}
