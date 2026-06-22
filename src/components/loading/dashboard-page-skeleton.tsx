import { PortalPageShell } from '@/components/layout/portal/portal-page-shell';
import { CardSkeleton, SectionHeadSkeleton } from '@/components/loading/card-skeleton';
import { Skeleton } from '@/components/loading/skeleton';

export function DashboardPageSkeleton() {
  return (
    <PortalPageShell>
      <div className="flex flex-col gap-8">
        <CardSkeleton>
          <Skeleton className="h-7 w-64" />
          <Skeleton className="mt-2 h-4 w-96 max-w-full" />
          <Skeleton className="mt-4 h-24 w-full rounded-[14px]" />
        </CardSkeleton>
        <div>
          <SectionHeadSkeleton />
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    </PortalPageShell>
  );
}
