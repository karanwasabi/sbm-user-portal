'use client';

import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SecuritySettingsSectionProps = {
  needsPassword?: boolean;
};

export function SecuritySettingsSection({ needsPassword = false }: SecuritySettingsSectionProps) {
  const router = useRouter();
  const passwordPath = needsPassword ? '/settings/set-password' : '/settings/change-password';
  const passwordActionLabel = needsPassword ? 'Set Password' : 'Change Password';
  const passwordDescription = needsPassword
    ? 'Add a password so you can sign in with email next time'
    : 'Used to sign in to your account';

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-slate-100 bg-canvas-cool p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Lock size={16} className="shrink-0 text-brand" />
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-800">Password</div>
          <div className="text-xs text-slate-500">{passwordDescription}</div>
        </div>
      </div>
      <Button variant="light" size="sm" className="ml-auto shrink-0" onClick={() => router.push(passwordPath)}>
        {passwordActionLabel}
      </Button>
    </div>
  );
}
