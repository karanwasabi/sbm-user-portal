import type { BillingProfile, BillingProfilePatch } from '@/types/billing';

export type BillingFormSnapshot = {
  billingCountryCode: string;
  billingType: 'personal' | 'business';
  gstin: string;
  legalName: string;
  billingState: string;
  addressLine1: string;
  addressLine2: string;
  billingCity: string;
  postalCode: string;
};

export function billingProfileToFormState(profile: BillingProfile): BillingFormSnapshot {
  return {
    billingCountryCode: profile.billing_country_code || 'IN',
    billingType: profile.billing_type,
    gstin: profile.gstin ?? '',
    legalName: profile.legal_name ?? '',
    billingState: profile.billing_state ?? profile.billing_address?.state ?? '',
    addressLine1: profile.billing_address?.line1 ?? '',
    addressLine2: profile.billing_address?.line2 ?? '',
    billingCity: profile.billing_address?.city ?? '',
    postalCode: profile.billing_address?.postal_code ?? '',
  };
}

type BuildBillingPatchInput = BillingFormSnapshot & {
  billingCountry: string;
  hasSubdivisions: boolean;
  pricingRegion: 'domestic' | 'international';
};

export function buildBillingProfilePatch(input: BuildBillingPatchInput): BillingProfilePatch {
  const trimmedGstin = input.gstin.trim().toUpperCase();
  return {
    billing_type: input.billingType,
    billing_country_code: input.billingCountryCode,
    legal_name: input.legalName.trim(),
    gstin:
      input.billingType === 'business' && input.pricingRegion === 'domestic' && trimmedGstin ? trimmedGstin : undefined,
    billing_state: input.billingState || undefined,
    billing_address: {
      line1: input.addressLine1,
      line2: input.addressLine2 || undefined,
      city: input.billingCity,
      state: input.hasSubdivisions ? input.billingState : '',
      postal_code: input.postalCode,
      country: input.billingCountry,
    },
  };
}

export function isBillingPatchValid(patch: BillingProfilePatch): boolean {
  return Boolean(patch.legal_name?.trim());
}
