import { redirect } from 'next/navigation';
import { UserProfileCard } from '@/components/user-profile-card';
import { getDisplayName } from '@/types/profile';
import { getLatestProfile, ProfileFetchError } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let profile = null;
  let profileError: string | null = null;

  try {
    profile = await getLatestProfile();
  } catch (error) {
    profileError = error instanceof ProfileFetchError ? error.message : 'Failed to load profile.';
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-canvas p-8">
      <div className="text-center">
        {profile ? (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {getDisplayName(profile)}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">SBM User Portal</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">SBM User Portal</p>
            {profileError && <p className="mt-4 text-sm font-medium text-danger-press">{profileError}</p>}
          </>
        )}
      </div>
      <UserProfileCard />
    </main>
  );
}
