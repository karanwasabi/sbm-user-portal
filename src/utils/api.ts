import { createClient } from '@/utils/supabase/server';

/**
 * Server-side fetch wrapper for the Go API.
 * Attaches the active Supabase session token as a Bearer header.
 * Use only in Server Components, Server Actions, or Route Handlers — never in client code.
 */
export async function apiFetch(path: string, init?: RequestInit) {
  const baseUrl = process.env.NEXT_PUBLIC_GO_API_URL;

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_GO_API_URL is not configured.');
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init?.headers);

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });
}
