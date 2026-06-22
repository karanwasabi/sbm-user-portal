export type BillingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export type BillingProfile = {
  pricing_region: 'domestic' | 'international';
  billing_type: 'personal' | 'business';
  legal_name?: string;
  gstin?: string;
  billing_state?: string;
  billing_address?: BillingAddress;
  billing_country_code: string;
};

export type BillingProfilePatch = {
  billing_type: 'personal' | 'business';
  billing_country_code: string;
  legal_name: string;
  gstin?: string;
  billing_state?: string;
  billing_address?: BillingAddress;
};
