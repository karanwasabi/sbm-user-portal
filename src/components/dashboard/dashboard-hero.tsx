import { PaymentRetryCard } from '@/components/dashboard/payment-retry-card';
import { PasswordSetBanner } from '@/components/dashboard/password-set-banner';
import { EnrollmentStatusCard } from '@/components/dashboard/enrollment-status-card';
import { PreStartDashboardPanel } from '@/components/dashboard/pre-start-dashboard-panel';
import { ProfileCompletionBanner } from '@/components/dashboard/profile-completion-banner';
import { isProfileFullyComplete } from '@/lib/profile-completion';
import { hasPendingPayment } from '@/types/enrollment';
import type { Enrollment } from '@/types/enrollment';
import type { Profile } from '@/types/profile';

type DashboardHeroProps = {
  firstName: string;
  profile: Profile | null;
  enrollments: Enrollment[];
  showPasswordBanner?: boolean;
  paymentRetryLegalName?: string;
};

function formatStartDate(startsOn: string): string {
  return new Date(`${startsOn}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
  });
}

export function DashboardHero({
  firstName,
  profile,
  enrollments,
  showPasswordBanner = false,
  paymentRetryLegalName = 'Member',
}: DashboardHeroProps) {
  const upcoming = enrollments.find(
    (entry) =>
      entry.status === 'upcoming' && entry.starts_on && entry.days_until_start != null && entry.days_until_start > 0
  );
  const showPreStartPanel = Boolean(upcoming && isProfileFullyComplete(profile));
  const pendingPayment = hasPendingPayment(enrollments);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Hey {firstName}</h1>
          {showPreStartPanel && upcoming ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              You&apos;re enrolled in {upcoming.program_name}
              {upcoming.starts_on ? ` — your program begins ${formatStartDate(upcoming.starts_on)}.` : '.'}
            </p>
          ) : (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Welcome to your member portal. Manage billing, update your profile, and stay on track with your program.
            </p>
          )}
        </header>

        {pendingPayment ? <PaymentRetryCard legalName={paymentRetryLegalName} /> : null}
        {showPasswordBanner ? <PasswordSetBanner /> : null}

        {showPreStartPanel && upcoming ? (
          <PreStartDashboardPanel profile={profile} enrollment={upcoming} />
        ) : (
          <ProfileCompletionBanner profile={profile} />
        )}
      </div>

      <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <EnrollmentStatusCard enrollments={enrollments} profile={profile} />
      </div>
    </section>
  );
}
