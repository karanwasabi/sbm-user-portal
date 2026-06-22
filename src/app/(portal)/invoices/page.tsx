import { InvoicesView } from '@/components/invoices/invoices-view';
import { getBillingProfile, getMyInvoices, ProfileFetchError } from '@/utils/api';

export default async function InvoicesPage() {
  let invoices: Awaited<ReturnType<typeof getMyInvoices>> = [];
  let billingProfile: Awaited<ReturnType<typeof getBillingProfile>> = null;
  let error: string | null = null;

  try {
    invoices = await getMyInvoices();
  } catch (err) {
    error = err instanceof ProfileFetchError ? err.message : 'Failed to load invoices.';
  }

  try {
    billingProfile = await getBillingProfile();
  } catch {
    billingProfile = null;
  }

  return <InvoicesView invoices={invoices} billingProfile={billingProfile} error={error} />;
}
