'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { setInitialPassword } from '@/app/(auth)/register/actions';
import { PasswordField } from '@/components/auth/password-field';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { SettingsPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHead } from '@/components/ui/section-head';
import { PASSWORD_REQUIREMENTS_COPY } from '@/lib/password-requirements';

const initialState = { error: null as string | null, success: false };

const layoutProps = {
  eyebrow: 'Settings',
  title: 'Set Password',
  description: 'Choose a strong password for email sign-in. You will stay signed in after saving.',
  illustration: <SettingsPageIllustration />,
  panelClassName: 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800',
  glowClassName: 'bg-white/20',
  footer: PASSWORD_REQUIREMENTS_COPY,
};

export function SetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, isPending] = useActionState(setInitialPassword, initialState);
  const newRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    newRef.current?.focus();
  }, []);

  if (state.success) {
    return (
      <PortalPageLayout {...layoutProps}>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 no-underline hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          Back to Settings
        </Link>
        <Card>
          <SectionHead title="Password Saved" subtitle="You can now sign in with your email and password." />
          <Button variant="primary" size="md" className="mt-5" href="/">
            Go to Dashboard
          </Button>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout {...layoutProps}>
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 no-underline hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to Settings
      </Link>
      <Card>
        <SectionHead title="Set Password" subtitle="No password is set for your account yet." />
        <form action={formAction} className="mt-4 flex flex-col gap-3.5">
          <PasswordField
            name="newPassword"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            showPassword={showNew}
            onToggleShow={() => setShowNew(!showNew)}
            autoComplete="new-password"
            disabled={isPending}
            error={false}
            inputRef={newRef}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            showPassword={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
            autoComplete="new-password"
            disabled={isPending}
            error={false}
          />
          {state.error ? (
            <p className="text-[12.5px] font-semibold text-danger-press" role="alert">
              {state.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="submit" variant="primary" size="md" disabled={isPending} aria-busy={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Password'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </PortalPageLayout>
  );
}
