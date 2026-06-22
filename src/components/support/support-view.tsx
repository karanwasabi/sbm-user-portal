'use client';

import { Check, Copy, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { SupportPageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHead } from '@/components/ui/section-head';
import { useToast } from '@/components/ui/toast';
import { buildSupportMailtoHref, SUPPORT_EMAIL } from '@/lib/support';
import { getFullName } from '@/types/profile';

export function SupportView() {
  const { toast } = useToast();
  const { profile } = usePortalProfile();
  const [copied, setCopied] = useState(false);

  const memberName = profile ? getFullName(profile) : null;
  const mailtoHref = useMemo(
    () => buildSupportMailtoHref({ memberName, memberEmail: profile?.email }),
    [memberName, profile?.email]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      toast({ message: 'Support email copied to clipboard.', variant: 'success' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ message: 'Could not copy. Tap the address to email us instead.', variant: 'error' });
    }
  };

  return (
    <PortalPageLayout
      eyebrow="Help & Support"
      title="Contact Our Team"
      description="For billing, enrollment, account or any other questions, email us and we will get back to you within one to two business days."
      illustration={<SupportPageIllustration />}
      panelClassName="bg-gradient-to-br from-brand via-brand-deep to-brand-deep-press"
      glowClassName="bg-white/30"
      highlights={[
        { label: 'Channel', value: 'Email' },
        { label: 'Reply Time', value: '1-2 business days' },
      ]}
    >
      <Card>
        <SectionHead
          title="Email Support"
          subtitle="Tap the address to compose a message. Use Copy if your device does not open a mail app."
        />
        <div className="rounded-[14px] border border-slate-100 bg-canvas-cool p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-brand/10 text-brand">
                <Mail size={18} />
              </div>
              <a
                href={mailtoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 font-mono text-base font-semibold break-all text-brand underline-offset-2 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="shrink-0"
              onClick={() => void handleCopy()}
              leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            >
              {copied ? 'Copied' : 'Copy Email'}
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
          <p>To help us resolve your request quickly, please include:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>What you were trying to do</li>
            <li>What happened instead (including any error messages)</li>
            <li>Screenshots, if relevant</li>
          </ul>
        </div>
      </Card>
    </PortalPageLayout>
  );
}
