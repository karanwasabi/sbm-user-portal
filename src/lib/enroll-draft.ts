import type { TrialProduct } from '@/types/trial';

export type EnrollFormDraft = {
  product: TrialProduct;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  countryIso: string;
  whatsappDialIso: string;
  countryManuallySet: boolean;
  savedAt: number;
};

export const ENROLL_DRAFT_STORAGE_KEY = 'sbm_enroll_draft';

export function saveEnrollDraft(draft: Omit<EnrollFormDraft, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    ENROLL_DRAFT_STORAGE_KEY,
    JSON.stringify({ ...draft, savedAt: Date.now() } satisfies EnrollFormDraft)
  );
}

export function readEnrollDraft(product: TrialProduct): EnrollFormDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(ENROLL_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as EnrollFormDraft;
    if (draft.product !== product) return null;
    return draft;
  } catch {
    return null;
  }
}

export function clearEnrollDraft(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ENROLL_DRAFT_STORAGE_KEY);
}
