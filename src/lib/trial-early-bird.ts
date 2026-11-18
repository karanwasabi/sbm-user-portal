/** Matches backend TrialEarlyBirdCutoffIST (29 Nov 2026 00:00 Asia/Kolkata). */
const EARLY_BIRD_CUTOFF_UTC_MS = Date.parse('2026-11-28T18:30:00.000Z');

export function isTrialEarlyBirdActive(now: Date = new Date()): boolean {
  return now.getTime() < EARLY_BIRD_CUTOFF_UTC_MS;
}

export type RegisterTrialPriceCopy = {
  earlyBird: boolean;
  monthlyChargedLabel: string;
  monthlyStrikeLabel: string | null;
  prepaidChargedLabel: string;
  prepaidStrikeLabel: string | null;
  /** Marketing-only “pay monthly × 3” comparison. */
  prepaidCompareMonthlyLabel: string;
};

export function registerTrialPriceCopy(now: Date = new Date()): RegisterTrialPriceCopy {
  const earlyBird = isTrialEarlyBirdActive(now);
  if (earlyBird) {
    return {
      earlyBird: true,
      monthlyChargedLabel: '₹6,000',
      monthlyStrikeLabel: '₹7,000',
      prepaidChargedLabel: '₹15,000',
      prepaidStrikeLabel: '₹18,000',
      prepaidCompareMonthlyLabel: '₹21,000',
    };
  }
  return {
    earlyBird: false,
    monthlyChargedLabel: '₹7,000',
    monthlyStrikeLabel: null,
    prepaidChargedLabel: '₹18,000',
    // Marketing list = 3 × ₹7,000 month-by-month.
    prepaidStrikeLabel: '₹21,000',
    prepaidCompareMonthlyLabel: '₹21,000',
  };
}
