/** Default marketing cohort when `starts` is missing or no longer open. */
export const DEFAULT_PUBLIC_TRIAL_STARTS = '2026-12-07';

const PUBLIC_TRIAL_COHORT_LABELS: Record<string, string> = {
  '2026-12-07': '7 Dec 2026',
};

export function isPublicTrialStartsOn(startsOn: string | null | undefined): boolean {
  const trimmed = startsOn?.trim() ?? '';
  return Boolean(trimmed && PUBLIC_TRIAL_COHORT_LABELS[trimmed]);
}

export function normalizePublicTrialStarts(startsOn: string | null | undefined): string {
  const trimmed = startsOn?.trim() ?? '';
  if (isPublicTrialStartsOn(trimmed)) return trimmed;
  return DEFAULT_PUBLIC_TRIAL_STARTS;
}

export function publicTrialCohortLabel(startsOn: string): string {
  return PUBLIC_TRIAL_COHORT_LABELS[startsOn] ?? startsOn;
}
