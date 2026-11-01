import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PUBLIC_TRIAL_STARTS,
  isPublicTrialStartsOn,
  normalizePublicTrialStarts,
  publicTrialCohortLabel,
} from '@/lib/public-trial-cohort';

describe('publicTrialCohort', () => {
  it('defaults missing, closed, or invalid starts to Nov 16', () => {
    expect(DEFAULT_PUBLIC_TRIAL_STARTS).toBe('2026-11-16');
    expect(normalizePublicTrialStarts(null)).toBe('2026-11-16');
    expect(normalizePublicTrialStarts('')).toBe('2026-11-16');
    expect(normalizePublicTrialStarts('2026-11-02')).toBe('2026-11-16');
    expect(normalizePublicTrialStarts('2026-12-02')).toBe('2026-11-16');
  });

  it('keeps the open start date', () => {
    expect(isPublicTrialStartsOn('2026-11-02')).toBe(false);
    expect(isPublicTrialStartsOn('2026-11-16')).toBe(true);
    expect(normalizePublicTrialStarts('2026-11-16')).toBe('2026-11-16');
  });

  it('labels the Post Diwali batch', () => {
    expect(publicTrialCohortLabel('2026-11-16')).toBe('16 Nov 2026 · Post Diwali');
  });
});
