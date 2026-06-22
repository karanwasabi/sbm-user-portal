import { BillingAddressSkeleton } from '@/components/loading/billing-address-skeleton';
import { CardSkeleton, SectionHeadSkeleton } from '@/components/loading/card-skeleton';
import { PortalPageLayoutSkeleton } from '@/components/loading/portal-page-layout-skeleton';
import { Skeleton } from '@/components/loading/skeleton';

export function InvoiceTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-100">
      <div className="flex gap-4 bg-canvas-cool px-4 py-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, row) => (
        <div key={row} className="flex gap-4 border-t border-slate-100 px-4 py-3">
          {Array.from({ length: 5 }).map((_, col) => (
            <Skeleton key={col} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function InvoicesPageSkeleton() {
  return (
    <PortalPageLayoutSkeleton highlightCount={3}>
      <CardSkeleton>
        <SectionHeadSkeleton />
        <BillingAddressSkeleton />
      </CardSkeleton>
      <CardSkeleton>
        <SectionHeadSkeleton />
        <InvoiceTableSkeleton />
      </CardSkeleton>
    </PortalPageLayoutSkeleton>
  );
}
