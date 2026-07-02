export type Enrollment = {
  id: string;
  program_name: string;
  program_slug: string;
  cohort_name: string;
  status: 'pending_payment' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  phase?: 'initial' | 'monthly' | null;
  starts_on?: string;
  days_until_start?: number;
};

export function hasPendingPayment(enrollments: Enrollment[]): boolean {
  const hasPaidAccess = enrollments.some(
    (entry) => entry.status === 'upcoming' || entry.status === 'active' || entry.status === 'completed'
  );
  if (hasPaidAccess) return false;
  return enrollments.some((entry) => entry.status === 'pending_payment');
}

export function hasPaidTakeControlEnrollment(enrollments: Enrollment[]): boolean {
  return enrollments.some(
    (entry) =>
      entry.program_slug === 'take-control' &&
      (entry.status === 'upcoming' || entry.status === 'active' || entry.status === 'completed')
  );
}
