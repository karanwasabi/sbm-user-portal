import type { AccessClaims } from '@/lib/access';
import { getBackendUrl } from '@/types/profile';
import { createClient } from '@/utils/supabase/server';

export class AccessFetchError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'AccessFetchError';
  }
}

export async function getMyAccess(): Promise<AccessClaims> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    throw new AccessFetchError('Not authenticated.', 401);
  }

  const response = await fetch(`${getBackendUrl()}/me/access`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new AccessFetchError(`Failed to load access (${response.status})`, response.status);
  }

  return response.json() as Promise<AccessClaims>;
}
