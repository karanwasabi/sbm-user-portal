import { CardSkeleton, SectionHeadSkeleton } from '@/components/loading/card-skeleton';
import { Skeleton } from '@/components/loading/skeleton';

export function CheckoutPanelSkeleton() {
  return (
    <CardSkeleton>
      <SectionHeadSkeleton />
      <div className="space-y-3.5">
        <Skeleton className="h-16 w-full rounded-[14px]" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        ))}
        <Skeleton className="mt-2 h-12 w-full rounded-xl" />
      </div>
    </CardSkeleton>
  );
}
