'use client';

import { ArrowRight, Briefcase, Calendar, Flame, Mail, MessageCircle, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Pill } from '@/components/ui/pill';
import { SectionHead } from '@/components/ui/section-head';
import { getDisplayName } from '@/types/profile';

function HeroPreEnroll({ firstName }: { firstName: string }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border-b-8 border-[#4149AA] bg-gradient-to-br from-brand via-[#6A71E6] to-brand-press px-[30px] py-7 text-white shadow-[0_16px_36px_-10px_rgba(92,101,207,0.35)]">
      <div className="pointer-events-none absolute -top-[60px] -right-10 h-[280px] w-[280px] rounded-full bg-white/18 blur-[40px]" />
      <div className="pointer-events-none absolute right-[100px] -bottom-[100px] h-[260px] w-[260px] rounded-full bg-motivation/30 blur-[50px]" />

      <div className="relative z-10 flex items-center gap-7">
        <div className="flex-1">
          <Pill
            tone="brand"
            className="border-0 bg-white/18 text-white backdrop-blur-sm"
            icon={<Sparkles size={11} className="text-white" />}
          >
            You haven&apos;t joined a program yet
          </Pill>
          <h2 className="mt-3.5 mb-2 text-[32px] leading-[1.1] font-extrabold tracking-tight">
            Ready to take control, {firstName}?
          </h2>
          <p className="mb-[22px] max-w-[480px] text-sm leading-relaxed font-medium opacity-92">
            Take Control is our flagship coach-led program. Begin with a 3-month initiation, then continue monthly for
            as long as it serves you.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Button variant="amber" size="lg" disabled rightIcon={<ArrowRight size={16} />}>
              Enroll in Take Control
            </Button>
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-85">
              <Calendar size={13} />
              Next batch · <b className="font-bold">Mon, Jun 15</b> · 12 days away
            </div>
          </div>
        </div>

        <div className="w-[200px] shrink-0 rounded-[22px] border-b-[3px] border-black/25 bg-black/20 p-[18px] backdrop-blur-md">
          <Eyebrow color="light">Initiation</Eyebrow>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-[28px] font-extrabold tracking-tight">₹9,000</span>
            <span className="text-xs opacity-85">+ GST</span>
          </div>
          <div className="text-[11px] font-medium opacity-85">For 3 months</div>
          <div className="my-3.5 h-px bg-white/20" />
          <Eyebrow color="light">Then</Eyebrow>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-[22px] font-extrabold">₹3,000</span>
            <span className="text-xs opacity-85">+ GST / mo</span>
          </div>
          <div className="text-[11px] font-medium opacity-85">Cancel anytime</div>
        </div>
      </div>
    </div>
  );
}

function WhatYouGet() {
  const items = [
    { icon: Calendar, label: 'Weekly group webinars on practical weight loss' },
    { icon: MessageCircle, label: 'Daily WhatsApp motivation & coach feedback' },
    { icon: Briefcase, label: 'Follow-along strength training videos' },
    { icon: Sparkles, label: 'Flexible, simple nutrition plan' },
    { icon: Target, label: 'App access to track effort and progress' },
    { icon: Mail, label: 'Coach support via email and WhatsApp' },
  ];

  return (
    <Card>
      <SectionHead title="What's included in Take Control" subtitle="Same program for initiation and ongoing months." />
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-[14px] border border-slate-100 bg-canvas-cool px-3 py-2.5"
          >
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] bg-[#EEF0FF] text-brand">
              <Icon size={15} />
            </div>
            <div className="text-xs leading-snug font-semibold text-slate-700">{label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function BatchCountdownCard() {
  const units = [
    ['12', 'days'],
    ['08', 'hrs'],
    ['42', 'min'],
    ['18', 'sec'],
  ] as const;

  return (
    <Card>
      <SectionHead title="Next batch starts in" subtitle="Mon, June 15, 2026" />
      <div className="grid grid-cols-4 gap-2.5">
        {units.map(([n, l]) => (
          <div key={l} className="rounded-[14px] border border-slate-100 bg-canvas-cool px-2 py-3.5 text-center">
            <div className="text-2xl font-extrabold tracking-tight text-slate-800 tabular-nums">{n}</div>
            <Eyebrow>{l}</Eyebrow>
          </div>
        ))}
      </div>
      <div className="mt-3.5">
        <Button variant="primary" size="md" fullWidth disabled rightIcon={<ArrowRight size={14} />}>
          Reserve your seat
        </Button>
      </div>
    </Card>
  );
}

function WebinarCard() {
  return (
    <Card>
      <SectionHead title="Upcoming webinar" subtitle="Live · ask anything" />
      <div className="rounded-[18px] border border-slate-100 bg-canvas-cool p-4">
        <Eyebrow className="text-brand">Saturday · 7:00 PM IST</Eyebrow>
        <div className="mt-1.5 text-base leading-snug font-bold text-slate-800">
          The protein floor — how much you actually need
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11.5px] font-medium text-slate-500">
            Hosted by <b className="font-bold text-slate-700">Raj Ganpath</b>
          </div>
          <Button variant="primary" size="sm" disabled rightIcon={<ArrowRight size={12} />}>
            Add to calendar
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function DashboardView() {
  const { profile } = usePortalProfile();
  const firstName = profile ? getDisplayName(profile) : 'there';

  return (
    <div className="flex flex-col gap-[18px] px-7 pt-6 pb-10">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Hey {firstName}!</h1>
        <p className="mt-1 text-[13.5px] font-medium text-slate-500">
          Glad to have you here. Pick your program when you&apos;re ready.
        </p>
      </div>

      <HeroPreEnroll firstName={firstName} />

      <div className="grid grid-cols-[1.5fr_1fr] gap-[18px]">
        <WhatYouGet />
        <div className="flex flex-col gap-[18px]">
          <BatchCountdownCard />
          <WebinarCard />
        </div>
      </div>

      <Card className="border-dashed border-slate-200 bg-canvas-cool/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#EEF0FF] text-brand">
            <Flame size={20} fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-800">Explore more</div>
            <div className="text-xs text-slate-500">
              Manage billing, view invoices, or update your profile from the sidebar.
            </div>
          </div>
          <Link href="/profile">
            <Button variant="light" size="sm">
              View profile
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
