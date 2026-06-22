import { Suspense } from 'react';
import { BillingDetailsSection } from '@/components/billing/billing-details-section';
import { BillingAddressSkeleton } from '@/components/loading/billing-address-skeleton';
import { CardSkeleton, SectionHeadSkeleton } from '@/components/loading/card-skeleton';
import { InvoiceTableSkeleton } from '@/components/loading/invoices-page-skeleton';
import { InvoicesHistorySection } from '@/components/invoices/invoices-history-section';
import { InvoicesPageShell } from '@/components/invoices/invoices-page-shell';
import { fetchCountries, getBillingProfile } from '@/utils/api';

function BillingSectionFallback() {
  return (
    <CardSkeleton>
      <SectionHeadSkeleton />
      <BillingAddressSkeleton />
    </CardSkeleton>
  );
}

function HistorySectionFallback() {
  return (
    <CardSkeleton>
      <SectionHeadSkeleton />
      <InvoiceTableSkeleton />
    </CardSkeleton>
  );
}

async function InvoicesBillingSection() {
  const [billingProfile, countries] = await Promise.all([
    getBillingProfile().catch(() => null),
    fetchCountries().catch(() => []),
  ]);

  return <BillingDetailsSection initialProfile={billingProfile} initialCountries={countries} />;
}

export function InvoicesPageContent() {
  return (
    <InvoicesPageShell>
      <Suspense fallback={<BillingSectionFallback />}>
        <InvoicesBillingSection />
      </Suspense>
      <Suspense fallback={<HistorySectionFallback />}>
        <InvoicesHistorySection />
      </Suspense>
    </InvoicesPageShell>
  );
}
