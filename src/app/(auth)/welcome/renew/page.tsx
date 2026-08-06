import { WelcomeRenewView } from '@/components/renew/welcome-renew-view';
import type { RenewCategory } from '@/types/renew';

type PageProps = {
  searchParams: Promise<{ session?: string; category?: string }>;
};

function parseCategoryHint(raw?: string): RenewCategory | undefined {
  const value = raw?.trim();
  if (
    value === 'new_user' ||
    value === 'new_lead_no_sub' ||
    value === 'returnee_no_sub' ||
    value === 'old_student_active_renew' ||
    value === 'trial_extend' ||
    value === 'newbie_auto_renew' ||
    value === 'newbie_manual_renew' ||
    value === 'member_auto_renew' ||
    value === 'member_manual_renew'
  ) {
    return value;
  }
  return undefined;
}

export default async function WelcomeRenewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session?.trim() || undefined;
  const categoryHint = parseCategoryHint(params.category);
  return <WelcomeRenewView sessionId={sessionId} categoryHint={categoryHint} />;
}
