import type { ReactNode } from 'react';
import { Skeleton } from '@/components/loading/skeleton';

type CardSkeletonProps = {
  children: ReactNode;
};

export function CardSkeleton({ children }: CardSkeletonProps) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
      {children}
    </div>
  );
}

export function SectionHeadSkeleton() {
  return (
    <div className="mb-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-1.5 h-3 w-56" />
    </div>
  );
}
