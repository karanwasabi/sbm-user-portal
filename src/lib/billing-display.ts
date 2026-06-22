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

export function billingTypeLabel(type: 'personal' | 'business'): string {
  return type === 'business' ? 'Business' : 'Personal';
}

export function formatBillingTypeDisplay(value?: string | null): string {
  if (!value) return 'Personal';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'business') return 'Business';
  if (normalized === 'personal') return 'Personal';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function formatBillingAddressLine(snapshot: BillingFormSnapshot, countryName: string): string {
  const segments: string[] = [];

  if (snapshot.addressLine1.trim()) segments.push(snapshot.addressLine1.trim());
  if (snapshot.addressLine2.trim()) segments.push(snapshot.addressLine2.trim());

  const cityParts: string[] = [];
  if (snapshot.billingCity.trim()) cityParts.push(snapshot.billingCity.trim());
  if (snapshot.billingState.trim()) cityParts.push(snapshot.billingState.trim());

  let citySegment = cityParts.join(', ');
  if (snapshot.postalCode.trim()) {
    citySegment = citySegment ? `${citySegment} - ${snapshot.postalCode.trim()}` : snapshot.postalCode.trim();
  }
  if (citySegment) segments.push(citySegment);

  segments.push(countryName.trim() || snapshot.billingCountryCode);
  return segments.join(', ');
}

export function billingSnapshotsEqual(a: BillingFormSnapshot, b: BillingFormSnapshot): boolean {
  return (
    a.billingCountryCode === b.billingCountryCode &&
    a.billingType === b.billingType &&
    a.gstin === b.gstin &&
    a.legalName === b.legalName &&
    a.billingState === b.billingState &&
    a.addressLine1 === b.addressLine1 &&
    a.addressLine2 === b.addressLine2 &&
    a.billingCity === b.billingCity &&
    a.postalCode === b.postalCode
  );
}

export function currentBillingSnapshot(state: BillingFormSnapshot): BillingFormSnapshot {
  return {
    billingCountryCode: state.billingCountryCode,
    billingType: state.billingType,
    gstin: state.gstin.trim(),
    legalName: state.legalName.trim(),
    billingState: state.billingState.trim(),
    addressLine1: state.addressLine1.trim(),
    addressLine2: state.addressLine2.trim(),
    billingCity: state.billingCity.trim(),
    postalCode: state.postalCode.trim(),
  };
}
