'use client';

import { Cake, Calendar, Globe, Lock, Mail, MessageCircle, Phone, Receipt, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { PortalPageLayout } from '@/components/layout/portal/portal-page-layout';
import { ProfilePageIllustration } from '@/components/layout/portal/portal-page-illustrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Field } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { TextInput } from '@/components/ui/text-input';
import { getFullName, getInitials } from '@/types/profile';

export function ProfileView() {
  const { profile } = usePortalProfile();

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const email = profile?.email ?? '';
  const fullName = profile ? getFullName(profile) : 'Member';
  const initials = profile ? getInitials(profile) : 'SB';

  const [notif, setNotif] = useState({
    coachWa: true,
    coachEmail: true,
    billing: true,
    webinars: true,
    marketing: false,
  });

  return (
    <PortalPageLayout
      eyebrow="Account"
      title={fullName}
      description="Keep your details up to date so your coach and billing stay in sync."
      illustration={<ProfilePageIllustration />}
      panelClassName="bg-gradient-to-br from-lilac via-[#B794F6] to-brand-deep"
      glowClassName="bg-white/35"
      highlights={[
        { label: 'Status', value: 'Active' },
        { label: 'Member since', value: 'Sep 2025' },
        { label: 'Timezone', value: 'IST' },
      ]}
    >
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[18px]">
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-brand-deep to-motivation text-[26px] font-extrabold tracking-wide text-white shadow-[0_10px_20px_-8px_rgba(92,101,207,0.40)]">
            {initials}
          </div>
          <div className="flex-1">
            <Eyebrow>Member since · Sep 13, 2025</Eyebrow>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{fullName}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-xs font-medium text-slate-500">
              {email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400" />
                  {email}
                </span>
              )}
              <Pill tone="success">Active member</Pill>
            </div>
          </div>
          <Button variant="light" size="sm" className="shrink-0 self-start sm:self-center">
            Change photo
          </Button>
        </div>
      </Card>

      <Card>
        <SectionHead title="Personal details" subtitle="Used to personalise your program experience." />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="First name">
            <TextInput value={firstName} onChange={setFirstName} placeholder="First name" />
          </Field>
          <Field label="Last name">
            <TextInput value={lastName} onChange={setLastName} placeholder="Last name" />
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
              value="1991-04-12"
              onChange={() => {}}
              type="date"
              leftIcon={<Cake size={16} className="text-slate-400" />}
            />
          </Field>
          <Field label="Timezone">
            <TextInput
              value="Asia/Kolkata (GMT+05:30)"
              onChange={() => {}}
              leftIcon={<Globe size={16} className="text-slate-400" />}
            />
          </Field>
          <Field label="Mobile (WhatsApp)" hint="Your coach uses this number.">
            <TextInput
              value="+91 98765 43210"
              onChange={() => {}}
              leftIcon={<Phone size={16} className="text-slate-400" />}
            />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="ghost" size="md">
            Discard
          </Button>
          <Button variant="primary" size="md">
            Save changes
          </Button>
        </div>
      </Card>

      <Card>
        <SectionHead title="Notification preferences" subtitle="Choose how we reach you." />
        <div className="flex flex-col gap-1">
          {[
            {
              key: 'coachWa' as const,
              title: 'Coach WhatsApp messages',
              sub: 'Daily check-ins and feedback from your coach',
              icon: MessageCircle,
            },
            {
              key: 'coachEmail' as const,
              title: 'Coach emails',
              sub: 'Long-form notes and weekly recaps',
              icon: Mail,
            },
            {
              key: 'billing' as const,
              title: 'Billing alerts',
              sub: 'Renewal reminders, failed payments, invoices',
              icon: Receipt,
            },
            {
              key: 'webinars' as const,
              title: 'Webinar invites',
              sub: 'Saturday live sessions and replays',
              icon: Calendar,
            },
            {
              key: 'marketing' as const,
              title: 'New program announcements',
              sub: 'Launches, batches, occasional offers',
              icon: Sparkles,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-t-0 first:pt-0"
            >
              <item.icon size={16} className="shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500">{item.sub}</div>
              </div>
              <Checkbox
                checked={notif[item.key]}
                onChange={(checked) => setNotif((prev) => ({ ...prev, [item.key]: checked }))}
                label=""
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHead title="Security" />
        <div className="flex flex-col gap-3 rounded-[14px] border border-slate-100 bg-canvas-cool px-3.5 py-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-brand" />
            <div>
              <div className="text-sm font-bold text-slate-800">Password</div>
              <div className="text-xs text-slate-500">Last changed 4 months ago</div>
            </div>
          </div>
          <Button variant="light" size="sm" className="shrink-0 self-start sm:self-center">
            Change
          </Button>
        </div>
      </Card>
    </PortalPageLayout>
  );
}
