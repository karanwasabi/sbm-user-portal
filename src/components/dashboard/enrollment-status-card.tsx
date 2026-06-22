import Link from 'next/link';
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';
import { getProfileCompletionSummary } from '@/lib/profile-completion';
import type { Enrollment } from '@/types/enrollment';
import type { Profile } from '@/types/profile';
import { cn } from '@/lib/cn';

type EnrollmentStatusCardProps = {
  enrollments: Enrollment[];
  profile: Profile | null;
};

function formatStartDate(startsOn: string): string {
  return new Date(`${startsOn}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function EnrollmentStatusCard({ enrollments, profile }: EnrollmentStatusCardProps) {
  const upcoming = enrollments.find((entry) => entry.status === 'upcoming');
  const active = enrollments.find((entry) => entry.status === 'active');
  const { isComplete, missingLabels } = getProfileCompletionSummary(profile);

  if (upcoming?.starts_on && upcoming.days_until_start != null && upcoming.days_until_start > 0) {
    const days = upcoming.days_until_start;
    const progress = Math.max(8, Math.min(100, Math.round(((30 - Math.min(days, 30)) / 30) * 100)));

    return (
      <div className="relative overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-br from-brand via-brand-press to-brand-deep p-6 text-white shadow-[0_20px_40px_-20px_rgba(91,45,142,0.55)]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-lilac/20 blur-2xl" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-white/75 uppercase">Countdown</p>
              <p className="mt-1 text-sm font-medium text-white/90">{upcoming.program_name}</p>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white/90">
              Upcoming
            </span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <p className="text-6xl leading-none font-extrabold tracking-tight">{days}</p>
            <p className="pb-1 text-lg font-semibold text-white/85">
              day{days === 1 ? '' : 's'}
              <span className="block text-sm font-medium text-white/70">Until Start</span>
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 shrink-0 text-white/80" />
              Starts {formatStartDate(upcoming.starts_on)}
            </div>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white/85 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (active) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-success/20 bg-gradient-to-br from-success/10 via-white to-white p-6 shadow-[0_12px_30px_-18px_rgba(16,185,129,0.35)]">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-success uppercase">Program Active</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{active.program_name}</p>
            </div>
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">Live</span>
          </div>

          <p className="mt-6 text-2xl leading-tight font-extrabold tracking-tight text-slate-900">
            {active.program_name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Your coach-led program is underway. Check WhatsApp for updates from your coach.
          </p>

          {!isComplete ? (
            <Link
              href="/profile"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-press"
            >
              Complete Your Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const missingCount = missingLabels.length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.12)]">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 text-brand">
          <Sparkles className="h-4 w-4" />
          <p className="text-xs font-semibold tracking-wide uppercase">Getting Started</p>
        </div>

        <p className="mt-4 text-2xl leading-tight font-extrabold tracking-tight text-slate-900">Your Member Hub</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Manage billing, download invoices, and keep your profile up to date so your coach can personalise your
          experience.
        </p>

        <div className="mt-5 space-y-2">
          <StatusRow
            label="Profile"
            value={isComplete ? 'Complete' : `${missingCount} item${missingCount === 1 ? '' : 's'} left`}
            ok={isComplete}
          />
          <StatusRow
            label="Enrollment"
            value={enrollments.length > 0 ? 'On File' : 'Not Enrolled Yet'}
            ok={enrollments.length > 0}
          />
        </div>

        {!isComplete ? (
          <Link
            href="/profile"
            className={cn(
              'mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white',
              'transition hover:bg-brand-press focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none'
            )}
          >
            Complete Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <span className={cn('font-semibold', ok ? 'text-success' : 'text-slate-800')}>{value}</span>
    </div>
  );
}
