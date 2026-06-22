'use client';

import Link from 'next/link';
import { Bell, Loader2, Mail, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { updateNotificationPreferences } from '@/app/(portal)/profile/actions';
import { usePortalProfile } from '@/components/layout/portal/portal-profile-context';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { NotificationPreferences } from '@/types/profile';

type NotificationChannel = keyof NotificationPreferences;

const CHANNELS: {
  key: NotificationChannel;
  title: string;
  subtitle: string;
  icon: typeof MessageCircle;
}[] = [
  {
    key: 'notify_whatsapp',
    title: 'WhatsApp',
    subtitle: 'Coach updates and reminders via WhatsApp',
    icon: MessageCircle,
  },
  {
    key: 'notify_email',
    title: 'Email',
    subtitle: 'Coach updates and reminders via email',
    icon: Mail,
  },
  {
    key: 'notify_push',
    title: 'Push Notifications',
    subtitle: 'Coach updates and reminders in the app',
    icon: Bell,
  },
];

function preferencesFromProfile(profile: ReturnType<typeof usePortalProfile>['profile']): NotificationPreferences {
  return {
    notify_whatsapp: profile?.notify_whatsapp ?? true,
    notify_email: profile?.notify_email ?? true,
    notify_push: profile?.notify_push ?? true,
  };
}

export function NotificationSettingsSection() {
  const router = useRouter();
  const { profile } = usePortalProfile();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => preferencesFromProfile(profile));
  const [savingChannel, setSavingChannel] = useState<NotificationChannel | null>(null);

  useEffect(() => {
    setPreferences(preferencesFromProfile(profile));
  }, [profile]);

  const handleToggle = async (channel: NotificationChannel, enabled: boolean) => {
    const previous = preferences;
    setPreferences((current) => ({ ...current, [channel]: enabled }));
    setSavingChannel(channel);

    const result = await updateNotificationPreferences({ [channel]: enabled });

    setSavingChannel(null);

    if (result.error) {
      setPreferences(previous);
      toast({ message: result.error, variant: 'error' });
      return;
    }

    toast({ message: 'Preferences saved', variant: 'success' });
    startTransition(() => router.refresh());
  };

  const whatsappMissing = !profile?.whatsapp?.trim();

  return (
    <div className="flex flex-col gap-1">
      {CHANNELS.map((item) => {
        const checked = preferences[item.key];
        const isSaving = savingChannel === item.key;

        return (
          <div key={item.key} className="border-t border-slate-100 py-3 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-3">
              <item.icon size={16} className="shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-500">{item.subtitle}</div>
              </div>
              <div className={cn('flex shrink-0 items-center', isSaving && 'opacity-60')}>
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin text-slate-400" aria-hidden />
                ) : (
                  <Checkbox
                    checked={checked}
                    onChange={(next) => {
                      void handleToggle(item.key, next);
                    }}
                    disabled={isSaving}
                    label=""
                  />
                )}
              </div>
            </div>
            {item.key === 'notify_whatsapp' && checked && whatsappMissing ? (
              <p className="mt-1.5 pl-7 text-[11.5px] font-medium text-muted-foreground">
                <Link href="/profile" className="font-semibold text-brand hover:text-brand-press">
                  Add your mobile number on Profile
                </Link>{' '}
                to receive WhatsApp messages.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
