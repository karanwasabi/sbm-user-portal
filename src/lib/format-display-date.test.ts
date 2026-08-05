import { describe, expect, it } from 'vitest';

import {
  exclusiveBoundaryDateOnly,
  formatInclusiveAccessEndDate,
  inclusiveAccessEndDateOnly,
} from '@/lib/format-display-date';

describe('access-until display', () => {
  it('formats inclusive end from exclusive midnight UTC', () => {
    expect(inclusiveAccessEndDateOnly('2025-08-20T00:00:00Z')).toBe('2025-08-19');
    expect(formatInclusiveAccessEndDate('2025-08-20T00:00:00Z')).toBe('19 Aug 2025');
    expect(formatInclusiveAccessEndDate('2025-08-20T00:00:00Z', 'long')).toBe('19 August 2025');
  });

  it('round-trips exclusive boundary for API save', () => {
    const exclusive = '2025-08-20T00:00:00Z';
    const inclusive = inclusiveAccessEndDateOnly(exclusive);
    expect(exclusiveBoundaryDateOnly(inclusive)).toBe('2025-08-20');
  });

  it('handles month-end boundaries', () => {
    expect(inclusiveAccessEndDateOnly('2025-10-31T00:00:00Z')).toBe('2025-10-30');
    expect(exclusiveBoundaryDateOnly('2025-10-30')).toBe('2025-10-31');
  });

  it('mirrors TrialAccessUntil 3-month inclusive preset', () => {
    const [y, m, d] = '2025-07-20'.split('-').map(Number);
    const threeMonthBoundary = new Date(Date.UTC(y, m - 1 + 3, d));
    const boundaryStr = `${threeMonthBoundary.getUTCFullYear()}-${String(threeMonthBoundary.getUTCMonth() + 1).padStart(2, '0')}-${String(threeMonthBoundary.getUTCDate()).padStart(2, '0')}`;
    expect(boundaryStr).toBe('2025-10-20');
    expect(inclusiveAccessEndDateOnly(boundaryStr)).toBe('2025-10-19');
  });

  it('returns empty for invalid input', () => {
    expect(inclusiveAccessEndDateOnly('')).toBe('');
    expect(inclusiveAccessEndDateOnly(null)).toBe('');
    expect(formatInclusiveAccessEndDate('not-a-date')).toBeNull();
  });
});
