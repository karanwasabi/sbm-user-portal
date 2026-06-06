import { getBackendUrl, type Profile } from '@/types/profile';
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

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}

export async function getLatestProfile(): Promise<Profile> {
  const token = await getAccessToken();

  if (!token) {
    throw new ProfileFetchError('Not authenticated.', 401);
  }

  let response: Response;

  try {
    response = await fetch(`${getBackendUrl()}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
  } catch {
    throw new ProfileFetchError('Could not reach the backend. Is it running?', 503);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ProfileFetchError('The backend rejected your session token.', response.status);
  }

  if (response.status === 404) {
    throw new ProfileFetchError('No profile found for your account.', 404);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ProfileFetchError(`Failed to load profile (${response.status}): ${body}`, response.status);
  }

  return response.json() as Promise<Profile>;
}
