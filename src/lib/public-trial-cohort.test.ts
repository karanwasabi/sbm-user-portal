import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PUBLIC_TRIAL_STARTS,
  isPublicTrialStartsOn,
  normalizePublicTrialStarts,
  publicTrialCohortLabel,
} from '@/lib/public-trial-cohort';

describe('publicTrialCohort', () => {
  it('defaults missing or invalid starts to Nov 2', () => {
    expect(DEFAULT_PUBLIC_TRIAL_STARTS).toBe('2026-11-02');
    expect(normalizePublicTrialStarts(null)).toBe('2026-11-02');
    expect(normalizePublicTrialStarts('')).toBe('2026-11-02');
    expect(normalizePublicTrialStarts('2026-12-02')).toBe('2026-11-02');
  });

  it('keeps allowlisted starts', () => {
    expect(isPublicTrialStartsOn('2026-11-02')).toBe(true);
    expect(isPublicTrialStartsOn('2026-11-16')).toBe(true);
    expect(normalizePublicTrialStarts('2026-11-16')).toBe('2026-11-16');
  });

  it('labels Pre and Post Diwali batches', () => {
    expect(publicTrialCohortLabel('2026-11-02')).toBe('2 Nov 2026 · Pre Diwali');
    expect(publicTrialCohortLabel('2026-11-16')).toBe('16 Nov 2026 · Post Diwali');
  });
});
