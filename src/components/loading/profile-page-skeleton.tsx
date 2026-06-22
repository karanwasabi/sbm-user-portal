import { CardSkeleton, SectionHeadSkeleton } from '@/components/loading/card-skeleton';
import { PortalPageLayoutSkeleton } from '@/components/loading/portal-page-layout-skeleton';
import { Skeleton } from '@/components/loading/skeleton';

export function ProfilePageSkeleton() {
  return (
    <PortalPageLayoutSkeleton highlightCount={3}>
      <CardSkeleton>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[18px]">
          <Skeleton className="h-[76px] w-[76px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        </div>
      </CardSkeleton>
      <CardSkeleton>
        <SectionHeadSkeleton />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    </PortalPageLayoutSkeleton>
  );
}
