import type { ReactNode } from 'react';
import { PortalPageShell } from '@/components/layout/portal/portal-page-shell';
import { CardSkeleton, SectionHeadSkeleton } from '@/components/loading/card-skeleton';
import { Skeleton } from '@/components/loading/skeleton';

type PortalPageLayoutSkeletonProps = {
  children: ReactNode;
  highlightCount?: number;
};

function AsideSkeleton({ highlightCount = 3 }: { highlightCount?: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-200/60 p-6">
      <div className="space-y-3">
        <Skeleton className="h-2.5 w-24 bg-slate-300/80" />
        <Skeleton className="h-6 w-48 bg-slate-300/80" />
        <Skeleton className="h-4 w-full max-w-xs bg-slate-300/70" />
        <Skeleton className="mx-auto mt-6 h-28 w-28 rounded-2xl bg-slate-300/70" />
        {highlightCount > 0 ? (
          <div className="mt-4 space-y-2.5 rounded-2xl border border-slate-200/80 bg-white/40 p-4">
            {Array.from({ length: highlightCount }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-20 bg-slate-300/70" />
                <Skeleton className="h-3 w-16 bg-slate-300/70" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PortalPageLayoutSkeleton({ children, highlightCount = 3 }: PortalPageLayoutSkeletonProps) {
  const aside = <AsideSkeleton highlightCount={highlightCount} />;

  return (
    <PortalPageShell>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-10 xl:gap-14">
        <div className="min-w-0">
          <div className="mb-6 lg:hidden">{aside}</div>
          <div className="flex flex-col gap-[18px]">{children}</div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-6">{aside}</div>
        </aside>
      </div>
    </PortalPageShell>
  );
}

export function GenericPageSkeleton() {
  return (
    <PortalPageLayoutSkeleton>
      <CardSkeleton>
        <SectionHeadSkeleton />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardSkeleton>
    </PortalPageLayoutSkeleton>
  );
}
