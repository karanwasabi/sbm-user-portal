import { describe, expect, it } from 'vitest';
import { isTrialEarlyBirdActive, registerTrialPriceCopy } from './trial-early-bird';

describe('trial early bird', () => {
  it('is active through end of 28 Nov IST', () => {
    expect(isTrialEarlyBirdActive(new Date('2026-11-28T18:29:59.000Z'))).toBe(true);
    expect(isTrialEarlyBirdActive(new Date('2026-11-28T18:30:00.000Z'))).toBe(false);
  });

  it('shows early-bird register copy before cutoff', () => {
    const copy = registerTrialPriceCopy(new Date('2026-11-20T00:00:00.000Z'));
    expect(copy.earlyBird).toBe(true);
    expect(copy.monthlyChargedLabel).toBe('₹6,000');
    expect(copy.monthlyStrikeLabel).toBe('₹7,000');
    expect(copy.prepaidChargedLabel).toBe('₹15,000');
    expect(copy.prepaidStrikeLabel).toBe('₹18,000');
    expect(copy.prepaidCompareMonthlyLabel).toBe('₹21,000');
  });

  it('shows regular register copy after cutoff', () => {
    const copy = registerTrialPriceCopy(new Date('2026-11-28T18:30:00.000Z'));
    expect(copy.earlyBird).toBe(false);
    expect(copy.monthlyChargedLabel).toBe('₹7,000');
    expect(copy.monthlyStrikeLabel).toBeNull();
    expect(copy.prepaidChargedLabel).toBe('₹18,000');
    expect(copy.prepaidStrikeLabel).toBe('₹21,000');
  });
});
