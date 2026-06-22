import { CardSkeleton, SectionHeadSkeleton } from '@/components/loading/card-skeleton';
import { PortalPageLayoutSkeleton } from '@/components/loading/portal-page-layout-skeleton';
import { Skeleton } from '@/components/loading/skeleton';
import { Card } from '@/components/ui/card';

function RenewalCardSkeletonBody() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border border-slate-100 px-4 py-3">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-2 h-7 w-24" />
          <Skeleton className="mt-1 h-3 w-32" />
        </div>
        <div className="rounded-[14px] border border-slate-100 px-4 py-3">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="mt-2 h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SubscriptionRenewalCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200 p-0" aria-busy="true" aria-label="Loading Subscription">
      <div className="border-b border-slate-100 bg-gradient-to-br from-canvas-cool to-white px-5 py-6 sm:px-6">
        <RenewalCardSkeletonBody />
      </div>
      <div className="px-5 py-4 sm:px-6">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
    </Card>
  );
}

export function SubscriptionPageSkeleton() {
  return (
    <PortalPageLayoutSkeleton highlightCount={3}>
      <CardSkeleton>
        <RenewalCardSkeletonBody />
      </CardSkeleton>
      <CardSkeleton>
        <SectionHeadSkeleton />
        <Skeleton className="h-20 w-full rounded-[14px]" />
      </CardSkeleton>
    </PortalPageLayoutSkeleton>
  );
}
