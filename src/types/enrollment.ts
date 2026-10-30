export type Enrollment = {
  id: string;
  program_name: string;
  program_slug: string;
  cohort_name: string;
  status: 'pending_payment' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  phase?: 'initial' | 'monthly' | null;
  starts_on?: string;
  days_until_start?: number;
  trial_starts_on?: string;
  trial_ends_on?: string;
  trial_open?: boolean;
  trial_message?: string;
  trial_message_kind?: 'renew' | 'batch';
};

export function hasPendingPayment(enrollments: Enrollment[]): boolean {
  const hasPaidAccess = enrollments.some(
    (entry) =>
      entry.status === 'upcoming' ||
      entry.status === 'active' ||
      entry.status === 'completed' ||
      entry.status === 'cancelled'
  );
  if (hasPaidAccess) return false;
  return enrollments.some((entry) => entry.status === 'pending_payment');
}

export function hasPaidTakeControlEnrollment(enrollments: Enrollment[]): boolean {
  return enrollments.some(
    (entry) =>
      entry.program_slug === 'take-control' &&
      (entry.status === 'upcoming' ||
        entry.status === 'active' ||
        entry.status === 'completed' ||
        entry.status === 'cancelled')
  );
}
