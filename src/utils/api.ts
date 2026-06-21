import type { Invoice } from '@/types/checkout';
import type { Enrollment } from '@/types/enrollment';
import type { Subscription } from '@/types/subscription';
import { getBackendUrl, type Profile, type ProfilePatch } from '@/types/profile';
import type { Country, CountryCity } from '@/types/reference';
import { formatUserFacingError } from '@/lib/format-user-error';
import { createClient } from '@/utils/supabase/server';

export class ProfileFetchError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'ProfileFetchError';
  }
}

async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

/**
 * Server-side fetch wrapper for the Go API.
 * Attaches the active Supabase session token as a Bearer header.
 * Use only in Server Components, Server Actions, or Route Handlers — never in client code.
 */
export async function apiFetch(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

async function requireApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new ProfileFetchError('Not authenticated.', 401);
  }

  let response: Response;
  try {
    response = await apiFetch(path, init);
  } catch {
    throw new ProfileFetchError('Could not reach the backend. Is it running?', 503);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ProfileFetchError('The backend rejected your session token.', response.status);
  }

  return response;
}

export async function getLatestProfile(): Promise<Profile> {
  const response = await requireApiFetch('/me');

  if (response.status === 404) {
    throw new ProfileFetchError('No profile found for your account.', 404);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ProfileFetchError(`Failed to load profile (${response.status}): ${body}`, response.status);
  }

  return response.json() as Promise<Profile>;
}

export async function patchProfile(body: ProfilePatch): Promise<Profile> {
  const response = await requireApiFetch('/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProfileFetchError(payload?.error ?? `Failed to update profile (${response.status})`, response.status);
  }

  return response.json() as Promise<Profile>;
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  const response = await requireApiFetch('/me/enrollments');
  if (!response.ok) {
    throw new ProfileFetchError('Failed to load enrollments.', response.status);
  }
  return response.json() as Promise<Enrollment[]>;
}

export async function getMyInvoices(): Promise<Invoice[]> {
  const response = await requireApiFetch('/me/invoices');
  if (!response.ok) {
    throw new ProfileFetchError('Failed to load invoices.', response.status);
  }
  return response.json() as Promise<Invoice[]>;
}

export async function getMySubscription(): Promise<Subscription> {
  const response = await requireApiFetch('/me/subscription');
  if (response.status === 404) {
    throw new ProfileFetchError('No subscription found.', 404);
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProfileFetchError(payload?.error ?? 'Failed to load subscription.', response.status);
  }
  return response.json() as Promise<Subscription>;
}

/** @deprecated Use startCheckout via client-api instead */
export async function enrollInProgram(programSlug = 'take-control'): Promise<Enrollment> {
  const response = await requireApiFetch('/me/enrollments', {
    method: 'POST',
    body: JSON.stringify({ program_slug: programSlug }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProfileFetchError(payload?.error ?? `Failed to enroll (${response.status})`, response.status);
  }

  return response.json() as Promise<Enrollment>;
}

export async function fetchCountries(): Promise<Country[]> {
  let response: Response;
  try {
    response = await apiFetch('/reference/countries');
  } catch {
    throw new ProfileFetchError('Could not reach the backend. Is it running?', 503);
  }

  if (!response.ok) {
    throw new ProfileFetchError('Failed to load countries.', response.status);
  }

  return response.json() as Promise<Country[]>;
}

export async function fetchCountryCities(countryCode: string): Promise<CountryCity[]> {
  const response = await requireApiFetch(`/reference/countries/${encodeURIComponent(countryCode)}/cities`);
  if (!response.ok) {
    throw new ProfileFetchError('Failed to load cities.', response.status);
  }
  return response.json() as Promise<CountryCity[]>;
}

export async function recordDpdpConsent(termsUrl: string, privacyUrl: string, source = 'signup'): Promise<void> {
  const response = await requireApiFetch('/me/consents/dpdp', {
    method: 'POST',
    body: JSON.stringify({
      terms_url: termsUrl,
      privacy_url: privacyUrl,
      source,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProfileFetchError(payload?.error ?? `Failed to record consent (${response.status})`, response.status);
  }
}

export type RegisterStartResponse = {
  status: 'otp_sent' | 'resume' | 'already_enrolled';
  email: string;
};

export async function registerMember(
  body: import('@/types/register').RegisterStartInput,
  extraHeaders: HeadersInit = {}
): Promise<RegisterStartResponse> {
  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ProfileFetchError('Could not reach the backend. Is it running?', 503);
  }

  const payload = (await response.json().catch(() => null)) as RegisterStartResponse & { error?: string };

  if (response.status === 409 && payload?.status === 'already_enrolled') {
    return payload;
  }

  if (!response.ok) {
    throw new ProfileFetchError(
      formatUserFacingError(payload?.error ?? `Failed to start registration (${response.status})`),
      response.status
    );
  }

  return payload;
}

export async function markPasswordSetComplete(): Promise<void> {
  const response = await requireApiFetch('/me/password-set-complete', { method: 'POST' });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProfileFetchError(payload?.error ?? 'Failed to update password status.', response.status);
  }
}

export async function registerSignup(email: string, password: string, extraHeaders: HeadersInit = {}): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch {
    throw new ProfileFetchError('Could not reach the backend. Is it running?', 503);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProfileFetchError(
      formatUserFacingError(payload?.error ?? `Failed to create account (${response.status})`),
      response.status
    );
  }
}

export async function resendSignupOTP(email: string, extraHeaders: HeadersInit = {}): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}/auth/signup/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });
  } catch {
    throw new ProfileFetchError('Could not reach the backend. Is it running?', 503);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProfileFetchError(
      formatUserFacingError(payload?.error ?? `Failed to resend verification code (${response.status})`),
      response.status
    );
  }
}

export async function resendRegisterOTP(
  email: string,
  flow: 'signup' | 'resume',
  extraHeaders: HeadersInit = {}
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}/auth/register/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify({ email, flow }),
      cache: 'no-store',
    });
  } catch {
    throw new ProfileFetchError('Could not reach the backend. Is it running?', 503);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProfileFetchError(
      formatUserFacingError(payload?.error ?? `Failed to resend verification code (${response.status})`),
      response.status
    );
  }
}
