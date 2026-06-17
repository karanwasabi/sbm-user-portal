'use client';

import { ChevronDown, LogOut, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { signOut } from '@/app/(auth)/actions';
import { cn } from '@/lib/cn';

type AccountMenuPillProps = {
  email: string;
};

function emailInitial(email: string): string {
  const local = email.split('@')[0]?.trim() ?? '';
  if (!local) return '?';
  return local.charAt(0).toUpperCase();
}

export function AccountMenuPill({ email }: AccountMenuPillProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = emailInitial(email);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-100 bg-white py-1 pr-2 pl-1 transition-colors hover:border-slate-200"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${email}`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-deep to-motivation text-xs font-extrabold text-white">
          {initial}
        </div>
        <span className="hidden max-w-[160px] truncate text-xs font-semibold text-slate-700 sm:inline">{email}</span>
        <ChevronDown size={14} className={cn('text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 z-50 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)]"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-start gap-2">
              <Mail size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Signed in as</div>
                <div className="mt-0.5 text-sm font-bold break-all text-slate-800">{email}</div>
              </div>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-canvas-cool"
            >
              <LogOut size={16} className="text-slate-500" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
