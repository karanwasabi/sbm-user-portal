export type RenewFormDraft = {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  countryIso: string;
  whatsappDialIso: string;
  countryManuallySet: boolean;
  selectedPlan?: string;
  promoCode?: string;
  appliedPromo?: string;
  savedAt: number;
};

export const RENEW_DRAFT_STORAGE_KEY = 'sbm_renew_draft';

export function saveRenewDraft(draft: Omit<RenewFormDraft, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    RENEW_DRAFT_STORAGE_KEY,
    JSON.stringify({ ...draft, savedAt: Date.now() } satisfies RenewFormDraft)
  );
}

export function readRenewDraft(): RenewFormDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(RENEW_DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RenewFormDraft;
  } catch {
    return null;
  }
}

export function clearRenewDraft(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(RENEW_DRAFT_STORAGE_KEY);
}
