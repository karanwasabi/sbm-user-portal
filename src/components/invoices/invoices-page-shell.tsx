import type { ReactNode } from 'react';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { InvoicesPageIllustration } from '@/components/layout/portal/portal-page-illustrations';

type InvoicesPageShellProps = {
  children: ReactNode;
};

export function InvoicesPageShell({ children }: InvoicesPageShellProps) {
  return (
    <PortalPageLayout
      eyebrow="Billing Records"
      title="Tax Invoices"
      description="Manage billing details for your invoices and download GST-compliant PDFs for your records."
      illustration={<InvoicesPageIllustration />}
      panelClassName="bg-gradient-to-br from-motivation via-amber to-[#E88A0C]"
      glowClassName="bg-white/35"
      highlights={[
        { label: 'Invoices on File', value: '—' },
        { label: 'Latest', value: '—' },
        { label: 'Billing Type', value: '—' },
      ]}
    >
      {children}
    </PortalPageLayout>
  );
}
