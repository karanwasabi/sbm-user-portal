'use client';

import { getBackendUrl, type Profile } from '@/types/profile';
import type { BillingProfile } from '@/types/billing';
import type { CheckoutPreview, CheckoutQuote, CheckoutQuoteRequest, CheckoutStartResponse } from '@/types/checkout';
import type { Country, CountryCity, CountryState } from '@/types/reference';
import type { PaymentMethodUpdateResponse, Subscription } from '@/types/subscription';
import { createClient } from '@/utils/supabase/client';

async function publicApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed (${response.status})`);
  }

  return response;
}

export async function getPublicCheckoutPreview(programSlug = 'take-control'): Promise<CheckoutPreview> {
  const response = await publicApiFetch(`/reference/programs/${encodeURIComponent(programSlug)}/checkout-preview`);
  return response.json() as Promise<CheckoutPreview>;
}

export async function postPublicCheckoutQuote(programSlug: string, body: CheckoutQuoteRequest): Promise<CheckoutQuote> {
  const response = await publicApiFetch(`/reference/programs/${encodeURIComponent(programSlug)}/checkout-quote`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { quote: CheckoutQuote };
  return payload.quote;
}

export async function getPublicCountryCities(countryCode: string): Promise<CountryCity[]> {
  const response = await publicApiFetch(`/reference/countries/${encodeURIComponent(countryCode)}/cities`);
  return response.json() as Promise<CountryCity[]>;
}

export async function getPublicCountryStates(countryCode: string): Promise<CountryState[]> {
  const response = await publicApiFetch(`/reference/countries/${encodeURIComponent(countryCode)}/states`);
  return response.json() as Promise<CountryState[]>;
}

async function clientApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    throw new Error('Not authenticated.');
  }

  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed (${response.status})`);
  }

  return response;
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const response = await fetch(`${getBackendUrl()}/me`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<Profile>;
}

export async function getBillingProfileOrNull(): Promise<BillingProfile | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const response = await fetch(`${getBackendUrl()}/me/billing-profile`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) return null;
  return response.json() as Promise<BillingProfile>;
}

export async function getCheckoutPreview(programSlug = 'take-control'): Promise<CheckoutPreview> {
  const response = await clientApiFetch(`/me/checkout/preview?program_slug=${encodeURIComponent(programSlug)}`);
  return response.json() as Promise<CheckoutPreview>;
}

export async function postCheckoutQuote(body: CheckoutQuoteRequest): Promise<CheckoutQuote> {
  const response = await clientApiFetch('/me/checkout/quote', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { quote: CheckoutQuote };
  return payload.quote;
}

export async function startCheckout(body: CheckoutQuoteRequest): Promise<CheckoutStartResponse> {
  const response = await clientApiFetch('/me/checkout/start', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json() as Promise<CheckoutStartResponse>;
}

export async function getCheckoutResume(
  programSlug = 'take-control'
): Promise<import('@/types/checkout').CheckoutResumeResponse> {
  const response = await clientApiFetch(`/me/checkout/resume?program_slug=${encodeURIComponent(programSlug)}`);
  return response.json() as Promise<import('@/types/checkout').CheckoutResumeResponse>;
}

export async function getMyEnrollments(): Promise<import('@/types/enrollment').Enrollment[]> {
  const response = await clientApiFetch('/me/enrollments');
  return response.json() as Promise<import('@/types/enrollment').Enrollment[]>;
}

export async function mockCompleteCheckout(checkoutSessionId: string): Promise<void> {
  await clientApiFetch('/me/checkout/mock-pay', {
    method: 'POST',
    body: JSON.stringify({ checkout_session_id: checkoutSessionId }),
  });
}

export async function abandonCheckout(checkoutSessionId: string): Promise<void> {
  await clientApiFetch('/me/checkout/abandon', {
    method: 'POST',
    body: JSON.stringify({ checkout_session_id: checkoutSessionId }),
  });
}

export async function getCountries(): Promise<Country[]> {
  const response = await clientApiFetch('/reference/countries');
  return response.json() as Promise<Country[]>;
}

export async function getCountryCities(countryCode: string): Promise<CountryCity[]> {
  const response = await clientApiFetch(`/reference/countries/${encodeURIComponent(countryCode)}/cities`);
  return response.json() as Promise<CountryCity[]>;
}

export async function getCountryStates(countryCode: string): Promise<CountryState[]> {
  const response = await clientApiFetch(`/reference/countries/${encodeURIComponent(countryCode)}/states`);
  return response.json() as Promise<CountryState[]>;
}

export async function cancelSubscription(cancelAtPeriodEnd = true): Promise<Subscription> {
  const response = await clientApiFetch('/me/subscription/cancel', {
    method: 'POST',
    body: JSON.stringify({ cancel_at_period_end: cancelAtPeriodEnd }),
  });
  return response.json() as Promise<Subscription>;
}

export async function startPaymentMethodUpdate(): Promise<PaymentMethodUpdateResponse> {
  const response = await clientApiFetch('/me/subscription/payment-method', {
    method: 'POST',
  });
  return response.json() as Promise<PaymentMethodUpdateResponse>;
}

export async function getBillingProfile(): Promise<import('@/types/billing').BillingProfile> {
  const response = await clientApiFetch('/me/billing-profile');
  return response.json() as Promise<import('@/types/billing').BillingProfile>;
}

export async function patchBillingProfile(
  body: import('@/types/billing').BillingProfilePatch
): Promise<import('@/types/billing').BillingProfile> {
  const response = await clientApiFetch('/me/billing-profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return response.json() as Promise<import('@/types/billing').BillingProfile>;
}
