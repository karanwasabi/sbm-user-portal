'use client';

import { getBackendUrl, type Profile } from '@/types/profile';
import type { BillingProfile } from '@/types/billing';
import type { CheckoutPreview, CheckoutQuote, CheckoutQuoteRequest, CheckoutStartResponse } from '@/types/checkout';
import type { Country, CountryCity, CountryState } from '@/types/reference';
import type { PaymentMethodUpdateResponse, Subscription } from '@/types/subscription';
import type {
  TrialCheckoutPreview,
  TrialCheckoutStartRequest,
  TrialCheckoutStartResponse,
  TrialPaymentStatus,
  TrialProduct,
  TrialStatus,
} from '@/types/trial';
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

export type CheckoutPaymentReturnRequest = {
  checkout_session_id?: string;
  flow?: 'enrollment' | 'subscription-update' | 'subscription-continue';
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};

export type CheckoutPaymentReturnResponse = {
  status: string;
  enrolled?: boolean;
};

export async function confirmCheckoutPaymentReturn(
  body: CheckoutPaymentReturnRequest
): Promise<CheckoutPaymentReturnResponse> {
  const response = await clientApiFetch('/me/checkout/payment-return', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json() as Promise<CheckoutPaymentReturnResponse>;
}

export async function syncCheckoutPayment(): Promise<{ enrolled: boolean }> {
  const response = await clientApiFetch('/me/checkout/sync', { method: 'POST' });
  return response.json() as Promise<{ enrolled: boolean }>;
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

export async function continueBilling(): Promise<import('@/types/subscription').ContinueBillingResponse> {
  const response = await clientApiFetch('/me/subscription/continue-billing', {
    method: 'POST',
  });
  return response.json() as Promise<import('@/types/subscription').ContinueBillingResponse>;
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

export type RegistrationPromoResponse = {
  promo_code?: string | null;
};

export async function getRegistrationPromo(): Promise<RegistrationPromoResponse> {
  const response = await clientApiFetch('/me/registration/promo');
  return response.json() as Promise<RegistrationPromoResponse>;
}

export async function putRegistrationPromo(promoCode: string): Promise<RegistrationPromoResponse> {
  const response = await clientApiFetch('/me/registration/promo', {
    method: 'PUT',
    body: JSON.stringify({ promo_code: promoCode }),
  });
  return response.json() as Promise<RegistrationPromoResponse>;
}

export async function deleteRegistrationPromo(): Promise<void> {
  await clientApiFetch('/me/registration/promo', { method: 'DELETE' });
}

export type PaymentLinkResponse = {
  url: string;
  expires_at: string;
};

export class PaymentLinkError extends Error {
  constructor(
    message: string,
    readonly status: 'already_enrolled'
  ) {
    super(message);
    this.name = 'PaymentLinkError';
  }
}

export async function postRegistrationPaymentLink(): Promise<PaymentLinkResponse> {
  const response = await clientApiFetch('/me/registration/payment-link', { method: 'POST' });
  if (response.status === 409) {
    const payload = (await response.json().catch(() => null)) as { status?: string; error?: string } | null;
    if (payload?.status === 'already_enrolled') {
      throw new PaymentLinkError(
        'This customer is already enrolled. A payment link is not needed.',
        'already_enrolled'
      );
    }
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Failed to generate payment link.');
  }
  return response.json() as Promise<PaymentLinkResponse>;
}

export async function getTrialCheckoutPreview(product: TrialProduct): Promise<TrialCheckoutPreview> {
  const response = await publicApiFetch(`/public/trial/checkout-preview?product=${encodeURIComponent(product)}`);
  return response.json() as Promise<TrialCheckoutPreview>;
}

export async function startTrialCheckout(body: TrialCheckoutStartRequest): Promise<TrialCheckoutStartResponse> {
  const response = await publicApiFetch('/public/trial/checkout/start', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.json() as Promise<TrialCheckoutStartResponse>;
}

export async function getTrialPaymentStatus(sessionId: string): Promise<TrialPaymentStatus> {
  const response = await publicApiFetch(`/public/trial/payment-status?session_id=${encodeURIComponent(sessionId)}`);
  return response.json() as Promise<TrialPaymentStatus>;
}

export async function pollUntilTrialPaymentConfirmed(
  sessionId: string,
  options?: { intervalMs?: number; timeoutMs?: number }
): Promise<boolean> {
  const intervalMs = options?.intervalMs ?? 1500;
  const timeoutMs = options?.timeoutMs ?? 120000;
  const started = Date.now();

  const check = async (): Promise<boolean> => {
    try {
      const result = await getTrialPaymentStatus(sessionId);
      return result.enrolled;
    } catch {
      return false;
    }
  };

  if (await check()) {
    return true;
  }

  while (Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    if (await check()) {
      return true;
    }
  }

  return false;
}

export async function confirmTrialPaymentReturn(body: {
  checkout_session_id: string;
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
}): Promise<void> {
  await publicApiFetch('/public/trial/checkout/payment-return', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getMyTrialStatus(): Promise<TrialStatus> {
  const response = await clientApiFetch('/me/trial/status');
  return response.json() as Promise<TrialStatus>;
}

export async function continueTrialCheckout(): Promise<TrialCheckoutStartResponse> {
  const response = await clientApiFetch('/me/trial/checkout/continue', { method: 'POST' });
  return response.json() as Promise<TrialCheckoutStartResponse>;
}
