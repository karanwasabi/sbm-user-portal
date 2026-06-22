import { CardSkeleton, SectionHeadSkeleton } from '@/components/loading/card-skeleton';
import { PortalPageLayoutSkeleton } from '@/components/loading/portal-page-layout-skeleton';
import { Skeleton } from '@/components/loading/skeleton';

export function SettingsPageSkeleton() {
  return (
    <PortalPageLayoutSkeleton highlightCount={0}>
      <CardSkeleton>
        <SectionHeadSkeleton />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </CardSkeleton>
      <CardSkeleton>
        <SectionHeadSkeleton />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </CardSkeleton>
    </PortalPageLayoutSkeleton>
  );
}

export function FormPageSkeleton() {
  return (
    <PortalPageLayoutSkeleton highlightCount={0}>
      <CardSkeleton>
        <SectionHeadSkeleton />
        <div className="space-y-3.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
          <Skeleton className="mt-2 h-10 w-32 rounded-xl" />
        </div>
      </CardSkeleton>
    </PortalPageLayoutSkeleton>
  );
}

export function RegisterPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-6 py-8">
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-sm" />
      <CardSkeleton>
        <div className="space-y-3.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    </div>
  );
}
