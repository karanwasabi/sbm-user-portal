'use server';

import { getBackendUrl } from '@/types/profile';
import { formatUserFacingError } from '@/lib/format-user-error';

export type UnsubscribeActionState = {
  ok: boolean;
  already?: boolean;
  error: string | null;
};

export async function confirmEmailUnsubscribe(token: string): Promise<UnsubscribeActionState> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: 'This unsubscribe link is missing required information.' };
  }

  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}/email/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: trimmed }),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again in a moment.' };
  }

  let payload: { error?: string; status?: string } = {};
  try {
    payload = (await response.json()) as { error?: string; status?: string };
  } catch {
    payload = {};
  }

  if (!response.ok) {
    return {
      ok: false,
      error: formatUserFacingError(payload.error ?? 'We could not process this unsubscribe request.'),
    };
  }

  return {
    ok: true,
    already: payload.status === 'already_unsubscribed',
    error: null,
  };
}
