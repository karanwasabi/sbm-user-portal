import type { BillingFormSnapshot } from '@/lib/billing-form';

export const REGISTER_CHECKOUT_DRAFT_KEY = 'sbm_register_checkout_draft';

let suppressCheckoutDraftPersist = false;

/** Prevents unmount cleanup from re-writing billing/promo after assisted staff logout. */
export function suppressRegisterCheckoutDraftPersist() {
  suppressCheckoutDraftPersist = true;
}

export type RegisterCheckoutDraft = BillingFormSnapshot & {
  billingCountryTouched: boolean;
  legalNameTouched: boolean;
  promoCode: string;
  appliedPromo: string;
  billingOpen: boolean;
};

function draftHasContent(draft: RegisterCheckoutDraft): boolean {
  return Boolean(
    draft.appliedPromo.trim() ||
    draft.promoCode.trim() ||
    draft.legalName.trim() ||
    draft.gstin.trim() ||
    draft.addressLine1.trim() ||
    draft.addressLine2.trim() ||
    draft.billingCity.trim() ||
    draft.billingState.trim() ||
    draft.postalCode.trim() ||
    draft.billingCountryTouched
  );
}

export function readRegisterCheckoutDraft(): RegisterCheckoutDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(REGISTER_CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegisterCheckoutDraft;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!draftHasContent(parsed)) return null;
    return {
      billingCountryCode: parsed.billingCountryCode || 'IN',
      billingType: parsed.billingType === 'business' ? 'business' : 'personal',
      gstin: parsed.gstin ?? '',
      legalName: parsed.legalName ?? '',
      billingState: parsed.billingState ?? '',
      addressLine1: parsed.addressLine1 ?? '',
      addressLine2: parsed.addressLine2 ?? '',
      billingCity: parsed.billingCity ?? '',
      postalCode: parsed.postalCode ?? '',
      billingCountryTouched: Boolean(parsed.billingCountryTouched),
      legalNameTouched: Boolean(parsed.legalNameTouched),
      promoCode: parsed.promoCode ?? '',
      appliedPromo: parsed.appliedPromo ?? '',
      billingOpen: Boolean(parsed.billingOpen),
    };
  } catch {
    return null;
  }
}

export function writeRegisterCheckoutDraft(draft: RegisterCheckoutDraft) {
  if (typeof window === 'undefined') return;
  if (suppressCheckoutDraftPersist) {
    sessionStorage.removeItem(REGISTER_CHECKOUT_DRAFT_KEY);
    return;
  }
  if (!draftHasContent(draft)) {
    sessionStorage.removeItem(REGISTER_CHECKOUT_DRAFT_KEY);
    return;
  }
  sessionStorage.setItem(REGISTER_CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
}

export function clearRegisterCheckoutDraft() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(REGISTER_CHECKOUT_DRAFT_KEY);
  suppressCheckoutDraftPersist = false;
}
