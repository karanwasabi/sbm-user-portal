import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle, MessageCircle, Sparkles, Target, Video } from 'lucide-react';
import { isProfileFullyComplete } from '@/lib/profile-completion';
import { cn } from '@/lib/cn';
import type { Enrollment } from '@/types/enrollment';
import type { Profile } from '@/types/profile';
import { Card } from '@/components/ui/card';

const PROGRAM_INCLUDES = [
  { icon: MessageCircle, text: 'Coach Support on WhatsApp', iconWrap: 'bg-success/12 text-success' },
  { icon: Video, text: 'Live Webinars', iconWrap: 'bg-motivation/15 text-amber' },
  { icon: Sparkles, text: 'Flexible Nutrition Guidance', iconWrap: 'bg-lilac/30 text-brand-deep' },
  { icon: Target, text: 'Weekly Goal Reviews', iconWrap: 'bg-brand/10 text-brand' },
] as const;

type PreStartDashboardPanelProps = {
  profile: Profile | null;
  enrollment: Enrollment;
};

function formatStartDate(startsOn: string): string {
  return new Date(`${startsOn}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PreStartDashboardPanel({ profile, enrollment }: PreStartDashboardPanelProps) {
  const profileComplete = isProfileFullyComplete(profile);
  const whatsappSaved = Boolean(profile?.whatsapp?.trim());
  const startDate = enrollment.starts_on ? formatStartDate(enrollment.starts_on) : null;

  const checklist = [
    {
      label: `Enrolled in ${enrollment.program_name}`,
      detail: 'Your enrollment is confirmed.',
      done: true,
    },
    {
      label: 'Profile Completed',
      detail: 'Your coach can personalise your plan from day one.',
      done: profileComplete,
    },
    {
      label: 'WhatsApp Number Saved',
      detail: whatsappSaved ? (profile?.whatsapp ?? '') : 'Add your number so your coach can reach you.',
      done: whatsappSaved,
      href: whatsappSaved ? undefined : '/profile',
    },
    {
      label: 'Program Start',
      detail: startDate ? `Your program begins on ${startDate}.` : 'Your start date will be confirmed soon.',
      done: false,
      pending: true,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">Before Day One</p>
        <p className="mt-1 text-base font-bold text-slate-900">You&apos;re ready — here&apos;s what happens next</p>
        <ul className="mt-4 space-y-3">
          {checklist.map((item) => (
            <li key={item.label} className="flex gap-3">
              {item.done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : 'pending' in item && item.pending ? (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              )}
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-semibold', item.done ? 'text-slate-800' : 'text-slate-900')}>
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{item.detail}</p>
                {'href' in item && item.href ? (
                  <Link
                    href={item.href}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-press"
                  >
                    Add WhatsApp
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">What&apos;s Included</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {PROGRAM_INCLUDES.map(({ icon: Icon, text, iconWrap }) => (
            <li
              key={text}
              className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"
            >
              <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', iconWrap)}>
                <Icon size={14} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
