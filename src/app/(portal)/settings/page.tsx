import { SettingsView } from '@/components/settings/settings-view';
import { userNeedsPassword } from '@/lib/razorpay-checkout';
import { createClient } from '@/utils/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SettingsView needsPassword={userNeedsPassword(user)} />;
}
