import { AccountMenuPill } from '@/components/auth/account-menu-pill';
import { SbmWordmark } from '@/components/brand/sbm-wordmark';

type OnboardingSessionHeaderProps = {
  email: string;
};

export function OnboardingSessionHeader({ email }: OnboardingSessionHeaderProps) {
  return (
    <div className="mb-7 flex w-full shrink-0 items-center justify-between gap-6">
      <SbmWordmark size="lg" className="shrink-0" />
      <AccountMenuPill email={email} />
    </div>
  );
}
