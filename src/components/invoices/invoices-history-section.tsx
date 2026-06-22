import { Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { formatInrFromPaise } from '@/lib/money';
import type { Invoice } from '@/types/checkout';
import { getMyInvoices, ProfileFetchError } from '@/utils/api';

export async function InvoicesHistorySection() {
  let invoices: Invoice[] = [];
  let error: string | null = null;

  try {
    invoices = await getMyInvoices();
  } catch (err) {
    error = err instanceof ProfileFetchError ? err.message : 'Failed to load invoices.';
  }

  return (
    <>
      {error ? (
        <p className="text-sm font-semibold text-danger-press" role="alert">
          {error}
        </p>
      ) : null}
      <Card>
        <SectionHead title="Invoice History" subtitle="Issued after each successful payment" />
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
      </Card>
    </>
  );
}
