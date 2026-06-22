'use client';

import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { SettingsPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { NotificationSettingsSection } from '@/components/settings/notification-settings-section';
import { SecuritySettingsSection } from '@/components/settings/security-settings-section';
import { Card } from '@/components/ui/card';
import { SectionHead } from '@/components/ui/section-head';

type SettingsViewProps = {
  needsPassword?: boolean;
};

export function SettingsView({ needsPassword = false }: SettingsViewProps) {
  return (
    <PortalPageLayout
      eyebrow="Account"
      title="Settings"
      description="Manage your preferences and account options."
      illustration={<SettingsPageIllustration />}
      panelClassName="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800"
      glowClassName="bg-white/20"
    >
      <Card>
        <SectionHead
          title="Notification Settings"
          subtitle="Choose how we reach you with coach updates and reminders."
        />
        <NotificationSettingsSection />
      </Card>

      <Card>
        <SectionHead title="Security" subtitle="Keep your account sign-in secure." />
        <SecuritySettingsSection needsPassword={needsPassword} />
      </Card>
    </PortalPageLayout>
  );
}
