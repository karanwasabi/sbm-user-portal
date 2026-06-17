import type { Enrollment } from '@/types/enrollment';

type CohortStartBannerProps = {
  enrollments: Enrollment[];
};

export function CohortStartBanner({ enrollments }: CohortStartBannerProps) {
  const upcoming = enrollments.find((entry) => entry.status === 'upcoming');
  if (!upcoming?.starts_on || upcoming.days_until_start == null || upcoming.days_until_start <= 0) {
    return null;
  }

  const startDate = new Date(`${upcoming.starts_on}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/10 to-lilac/20 px-5 py-4">
      <p className="text-xs font-semibold tracking-wide text-brand-deep uppercase">Your program starts soon</p>
      <p className="mt-1 text-lg font-bold text-slate-900">
        {upcoming.cohort_name} begins {startDate}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {upcoming.days_until_start} day{upcoming.days_until_start === 1 ? '' : 's'} to go — we&apos;ll notify you on
        WhatsApp when it&apos;s time.
      </p>
    </div>
  );
}
