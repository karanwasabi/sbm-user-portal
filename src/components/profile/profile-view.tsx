'use client';

import { Cake, Globe, Lock, Mail, Phone } from 'lucide-react';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Field } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { getFullName, getInitials } from '@/types/profile';

export function ProfileView() {
  const { profile } = usePortalProfile();

  const firstName = profile?.first_name ?? '';
  const lastName = profile?.last_name ?? '';
  const email = profile?.email ?? '';
  const fullName = profile ? getFullName(profile) : 'Member';
  const initials = profile ? getInitials(profile) : 'SB';

  return (
    <div className="flex flex-col gap-[18px] px-7 pt-6 pb-10">
      <Card>
        <div className="flex items-center gap-[18px]">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-brand to-brand-press text-[26px] font-extrabold tracking-wide text-white shadow-[0_10px_20px_-8px_rgba(92,101,207,0.40)]">
            {initials}
          </div>
          <div className="flex-1">
            <Eyebrow>Member account</Eyebrow>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{fullName}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-xs font-medium text-slate-500">
              {email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  {email}
                </span>
              )}
              <Pill tone="neutral">Profile preview</Pill>
            </div>
          </div>
          <Button variant="light" size="sm" disabled>
            Change photo
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-[1.4fr_1fr] gap-[18px]">
        <div className="flex flex-col gap-[18px]">
          <Card>
            <SectionHead
              title="Personal details"
              subtitle="Name and email from your account. Other fields coming soon."
            />
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="First name">
                <TextInput value={firstName} onChange={() => {}} disabled placeholder="First name" />
              </Field>
              <Field label="Last name">
                <TextInput value={lastName} onChange={() => {}} disabled placeholder="Last name" />
              </Field>
              <Field label="Email" hint="Used to sign in. Contact support to change.">
                <TextInput
                  value={email}
                  onChange={() => {}}
                  disabled
                  leftIcon={<Mail size={16} className="text-slate-400" />}
                />
              </Field>
              <Field label="Date of birth">
                <TextInput
                  value=""
                  onChange={() => {}}
                  disabled
                  placeholder="Coming soon"
                  leftIcon={<Cake size={16} className="text-slate-400" />}
                />
              </Field>
              <Field label="Timezone">
                <TextInput
                  value="Asia/Kolkata (GMT+05:30)"
                  onChange={() => {}}
                  disabled
                  leftIcon={<Globe size={16} className="text-slate-400" />}
                />
              </Field>
              <Field label="Mobile (WhatsApp)">
                <TextInput
                  value=""
                  onChange={() => {}}
                  disabled
                  placeholder="Coming soon"
                  leftIcon={<Phone size={16} className="text-slate-400" />}
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="ghost" size="md" disabled>
                Discard
              </Button>
              <Button variant="primary" size="md" disabled>
                Save changes
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-[18px]">
          <Card>
            <SectionHead title="Security" />
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 rounded-[14px] border border-slate-100 bg-canvas-cool px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-brand" />
                  <div>
                    <div className="text-sm font-bold text-slate-800">Password</div>
                    <div className="text-xs text-slate-500">Change password coming soon</div>
                  </div>
                </div>
                <Button variant="light" size="sm" disabled>
                  Change
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-dashed border-slate-200 bg-canvas-cool/50">
            <p className="text-sm text-slate-600">
              Notification preferences and additional profile fields will be editable once profile update APIs are
              available.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
