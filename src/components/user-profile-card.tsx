'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getBackendUrl, type Profile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

type FetchState = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
};

async function loadProfile(): Promise<Pick<FetchState, 'profile' | 'error'>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { profile: null, error: 'Not authenticated.' };
  }

  try {
    const response = await fetch(`${getBackendUrl()}/me`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        profile: null,
        error: `Failed to load profile (${response.status}): ${body}`,
      };
    }

    const profile = (await response.json()) as Profile;
    return { profile, error: null };
  } catch {
    return { profile: null, error: 'Failed to load profile.' };
  }
}

export function UserProfileCard() {
  const [state, setState] = useState<FetchState>({
    profile: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await loadProfile();
    setState({ ...result, loading: false });
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadProfile().then((result) => {
      if (!cancelled) {
        setState({ ...result, loading: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_-8px_rgba(43,24,101,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-brand uppercase">Your profile</h2>
        <Button variant="light" size="sm" onClick={refresh} disabled={state.loading}>
          Refresh
        </Button>
      </div>

      {state.loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          Loading profile…
        </div>
      )}

      {!state.loading && state.error && <p className="text-sm font-medium text-danger-press">{state.error}</p>}

      {!state.loading && state.profile && (
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Email</dt>
            <dd className="mt-0.5 font-medium text-slate-800">{state.profile.email}</dd>
          </div>
          {state.profile.first_name && (
            <div>
              <dt className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">First name</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{state.profile.first_name}</dd>
            </div>
          )}
          {state.profile.last_name && (
            <div>
              <dt className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">Last name</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{state.profile.last_name}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
