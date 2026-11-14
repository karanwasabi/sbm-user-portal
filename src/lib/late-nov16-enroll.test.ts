import { describe, expect, it } from 'vitest';
import { LATE_NOV16_COHORT_LABEL, LATE_NOV16_STARTS } from './late-nov16-enroll';
import { DEFAULT_PUBLIC_TRIAL_STARTS, normalizePublicTrialStarts } from './public-trial-cohort';

describe('late nov16 enroll constants', () => {
  it('keeps public defaults on Dec 7', () => {
    expect(DEFAULT_PUBLIC_TRIAL_STARTS).toBe('2026-12-07');
    expect(normalizePublicTrialStarts('2026-11-16')).toBe('2026-12-07');
  });

  it('uses locked Nov 16 for the late path only', () => {
    expect(LATE_NOV16_STARTS).toBe('2026-11-16');
    expect(LATE_NOV16_COHORT_LABEL).toContain('16 Nov');
  });
});
