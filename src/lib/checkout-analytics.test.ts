import { describe, expect, it } from 'vitest';
import { shouldSkipMetaPurchasePixel } from '@/lib/checkout-analytics';

describe('shouldSkipMetaPurchasePixel', () => {
  it('skips Meta Purchase for renewals', () => {
    expect(shouldSkipMetaPurchasePixel({ renewPlanKey: 'renewal_1m' })).toBe(true);
    expect(shouldSkipMetaPurchasePixel({ renewPlanKey: 'trial_extend_2m' })).toBe(true);
  });

  it('keeps Meta Purchase for new enrollments', () => {
    expect(shouldSkipMetaPurchasePixel({})).toBe(false);
    expect(shouldSkipMetaPurchasePixel({ renewPlanKey: '' })).toBe(false);
    expect(shouldSkipMetaPurchasePixel({ renewPlanKey: '   ' })).toBe(false);
  });
});
