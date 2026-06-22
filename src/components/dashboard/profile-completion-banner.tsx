import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProfileCompletionSummary } from '@/lib/profile-completion';
import type { Profile } from '@/types/profile';
import { Card } from '@/components/ui/card';

type ProfileCompletionBannerProps = {
  profile: Profile | null;
};

export function ProfileCompletionBanner({ profile }: ProfileCompletionBannerProps) {
  const { isComplete, missingLabels } = getProfileCompletionSummary(profile);
  if (isComplete) return null;

  const detail =
    missingLabels.length === 1
      ? missingLabels[0]
      : missingLabels.length === 2
        ? `${missingLabels[0]} and ${missingLabels[1]}`
        : `${missingLabels.slice(0, -1).join(', ')}, and ${missingLabels[missingLabels.length - 1]}`;

  return (
    <Card className="border-brand/20 bg-brand/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Complete Your Profile</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Add {detail.toLowerCase()} so your coach can personalise your program.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-press focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          Complete Profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
