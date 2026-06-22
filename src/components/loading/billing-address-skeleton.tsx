import { Skeleton } from '@/components/loading/skeleton';

export function BillingAddressSkeleton() {
  return (
    <div className="flex items-start gap-2" aria-busy="true" aria-label="Loading billing details">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[14px] border border-slate-100">
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-4/5 max-w-sm" />
          </div>
          <Skeleton className="h-6 w-[72px] shrink-0 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-8 w-12 shrink-0 rounded-lg" />
    </div>
  );
}
