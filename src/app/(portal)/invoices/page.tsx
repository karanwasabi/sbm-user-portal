import { InvoicesView } from '@/components/invoices/invoices-view';
import { getMyInvoices, ProfileFetchError } from '@/utils/api';

export default async function InvoicesPage() {
  let invoices: Awaited<ReturnType<typeof getMyInvoices>> = [];
  let error: string | null = null;

  try {
    invoices = await getMyInvoices();
  } catch (err) {
    error = err instanceof ProfileFetchError ? err.message : 'Failed to load invoices.';
  }

  return <InvoicesView invoices={invoices} error={error} />;
}
