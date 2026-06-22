'use server';

import { markPasswordSetComplete } from '@/utils/api';
import { createClient } from '@/utils/supabase/server';

/** Marks password_set in Supabase app_metadata and refreshes the session JWT. */
export async function syncPasswordSetMetadata(): Promise<void> {
  try {
    await markPasswordSetComplete();
  } catch {
    // Password was updated in Supabase; metadata sync is best-effort.
    return;
  }

  const supabase = await createClient();
  await supabase.auth.refreshSession();
}
