import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PUBLIC_TRIAL_STARTS,
  isPublicTrialStartsOn,
  normalizePublicTrialStarts,
  publicTrialCohortLabel,
} from './public-trial-cohort';

describe('public trial cohort starts', () => {
  it('defaults missing, closed, or invalid starts to Dec 7', () => {
    expect(DEFAULT_PUBLIC_TRIAL_STARTS).toBe('2026-12-07');
    expect(normalizePublicTrialStarts(null)).toBe('2026-12-07');
    expect(normalizePublicTrialStarts('')).toBe('2026-12-07');
    expect(normalizePublicTrialStarts('2026-11-02')).toBe('2026-12-07');
    expect(normalizePublicTrialStarts('2026-11-16')).toBe('2026-12-07');
    expect(normalizePublicTrialStarts('2026-12-02')).toBe('2026-12-07');
  });

  it('keeps the open Dec 7 start', () => {
    expect(isPublicTrialStartsOn('2026-12-07')).toBe(true);
    expect(normalizePublicTrialStarts('2026-12-07')).toBe('2026-12-07');
  });

  it('labels the Dec 7 batch', () => {
    expect(publicTrialCohortLabel('2026-12-07')).toBe('7 Dec 2026');
  });
});
