export type Enrollment = {
  id: string;
  program_name: string;
  program_slug: string;
  cohort_name: string;
  status: 'upcoming' | 'active' | 'completed';
  phase?: 'initial' | 'monthly' | null;
  starts_on?: string;
};
