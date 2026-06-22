'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { InvoicesPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { formatInrFromPaise } from '@/lib/money';
import type { Invoice } from '@/types/checkout';

type InvoicesViewProps = {
  invoices: Invoice[];
  error?: string | null;
};

export function InvoicesView({ invoices, error }: InvoicesViewProps) {
  const latest = invoices[0];

  return (
    <PortalPageLayout
      eyebrow="Billing records"
      title="Tax invoices"
      description="GST-compliant invoices for every charge. Download PDFs for your records or reimbursement."
      illustration={<InvoicesPageIllustration />}
      panelClassName="bg-gradient-to-br from-motivation via-amber to-[#E88A0C]"
      glowClassName="bg-white/35"
      highlights={[
        { label: 'Invoices on file', value: String(invoices.length) },
        {
          label: 'Latest',
          value: latest
            ? new Date(latest.issued_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
            : '—',
        },
        {
          label: 'Billing type',
          value: String(latest?.billing_snapshot?.billing_type ?? 'Individual'),
        },
      ]}
    >
      {error ? (
        <p className="text-sm font-semibold text-danger-press" role="alert">
          {error}
        </p>
      ) : null}

      <Card>
        <SectionHead title="Invoice history" subtitle="Issued after each successful payment" />
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-600">
            No invoices yet. Your first invoice appears after enrollment payment.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas-cool text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="px-4 py-3 text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(inv.issued_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatInrFromPaise(inv.amount_paise)}</td>
                    <td className="px-4 py-3 text-right">
                      <Pill tone="success">{inv.status}</Pill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.pdf_url ? (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          To update billing details for future invoices, go to{' '}
          <Link href="/subscription" className="font-medium text-brand hover:text-brand-deep">
            Subscription
          </Link>
          .
        </p>
      </Card>
    </PortalPageLayout>
  );
}
