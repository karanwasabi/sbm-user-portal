'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { ChevronLeft, Mail } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Inner glass size (px) — server rack height is 1.2× screen height. */
const PHONE_SCREEN_W = 50;
const PHONE_SCREEN_H = 96;
const SERVER_H = Math.round(PHONE_SCREEN_H * 1.2);

type EmailInFlightIllustrationProps = {
  className?: string;
};

/**
 * SBM server (~120% of phone screen height) + compact iPhone-style frame + Mail UI inside the screen.
 */
export function EmailInFlightIllustration({ className }: EmailInFlightIllustrationProps) {
  return (
    <div
      className={cn('relative mx-auto mb-1 h-48 w-full max-w-[300px]', className)}
      role="img"
      aria-label="Email sent from Slow Burn Method servers to the Mail app on your phone"
    >
      <div className="absolute top-1/2 left-1/2 h-32 w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/12 blur-2xl" />
      <div className="absolute top-[40%] left-1/2 h-24 w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-motivation/10 blur-xl" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 192" fill="none" aria-hidden>
        <path
          d="M 48 130 Q 150 34 252 130"
          stroke="rgb(203 213 225)"
          strokeWidth="2"
          strokeDasharray="7 10"
          strokeLinecap="round"
        />
      </svg>

      <motion.div
        className="absolute bottom-6 left-0 z-1"
        style={{ height: SERVER_H }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex h-full w-[50px] flex-col overflow-hidden rounded-[9px] border border-b-[3px] border-slate-700/90 border-b-slate-900 bg-linear-to-b from-slate-500 via-slate-600 to-slate-700 shadow-xl shadow-slate-900/35">
          <div className="h-2 w-full shrink-0 bg-slate-800/95" />
          <div className="flex shrink-0 flex-col gap-1.5 px-2.5 py-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-0.5 rounded-full bg-slate-800/75" />
            ))}
          </div>
          <div className="flex shrink-0 items-center justify-center gap-1.5 px-2 py-1">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_5px_#38bdf8]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.35 }}
            />
          </div>
          <div className="relative mx-1.5 mb-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-slate-900/60 ring-1 ring-white/10">
            <Image
              src="/images/sbm-logo-circle.png"
              alt=""
              width={80}
              height={80}
              className="pointer-events-none h-10 w-10 object-contain"
              aria-hidden
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute right-0 bottom-6 z-1"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-1.5 rounded-[10px] bg-brand/16 blur-md"
            animate={{ opacity: [0.28, 0.55, 0.28], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <div className="relative rounded-[10px] border-2 border-slate-900 bg-slate-950 p-[2px] shadow-lg shadow-slate-900/45">
            <div
              className="flex flex-col overflow-hidden rounded-[8px] bg-white"
              style={{ width: PHONE_SCREEN_W, height: PHONE_SCREEN_H }}
            >
              <div className="relative flex h-[9px] w-full shrink-0 items-center justify-between pr-[2px] pl-[5px]">
                <span className="relative z-3 text-[5.5px] leading-none font-semibold tracking-tight text-slate-900 tabular-nums">
                  9:41
                </span>
                <div
                  className="pointer-events-none absolute top-1/2 left-1/2 z-2 h-[4px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_0_0.5px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.35)]"
                  aria-hidden
                />
                <div className="relative z-3 flex items-end gap-px pb-px">
                  <div className="flex items-end gap-px">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-px rounded-[0.5px] bg-slate-900" style={{ height: 1.5 + i * 0.9 }} />
                    ))}
                  </div>
                  <svg width="9" height="4" viewBox="0 0 16 8" className="shrink-0 text-slate-900" aria-hidden>
                    <rect
                      x="1"
                      y="2"
                      width="11"
                      height="4.5"
                      rx="0.9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.55"
                    />
                    <rect x="12" y="3.35" width="1.2" height="1.8" rx="0.2" fill="currentColor" />
                    <rect x="1.35" y="2.3" width="8.24" height="3.9" rx="0.55" fill="currentColor" opacity="0.9" />
                  </svg>
                </div>
              </div>

              <div className="flex h-[20px] shrink-0 items-center gap-0.5 border-b border-brand-deep/40 bg-brand pr-1 pl-1 text-white">
                <ChevronLeft className="size-2.5 shrink-0 opacity-95" strokeWidth={2.4} aria-hidden />
                <Mail className="size-2.5 shrink-0 opacity-95" strokeWidth={2.2} aria-hidden />
                <span className="text-[7px] leading-none font-bold tracking-tight select-none">Mail</span>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-0.5 px-0.5 py-0.5">
                <motion.div
                  className="flex gap-0.5 rounded bg-violet-50 px-0.5 py-0.5 ring-1 ring-brand/12"
                  animate={{ opacity: [0.92, 1, 0.92] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Mail className="mt-px h-2 w-2 shrink-0 text-brand" strokeWidth={2.5} aria-hidden />
                  <div className="min-w-0 flex-1 space-y-px pt-px">
                    <div className="h-px w-full rounded-full bg-slate-400/85" />
                    <div className="h-px w-[70%] rounded-full bg-slate-300/90" />
                  </div>
                  <motion.span
                    className="mt-px h-1 w-1 shrink-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
                <div className="space-y-px px-px pt-px">
                  <div className="h-px w-full rounded-full bg-slate-200" />
                  <div className="h-px w-[88%] rounded-full bg-slate-200" />
                  <div className="h-px w-full rounded-full bg-slate-200" />
                  <div className="h-px w-[65%] rounded-full bg-slate-200" />
                </div>
              </div>

              <div className="flex shrink-0 justify-center pt-px pb-1">
                <div className="h-[2px] w-5 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[78px] left-[46px] z-20 drop-shadow-md"
        animate={{
          x: [0, 100, 188],
          y: [0, -50, 0],
          rotate: [-7, 4, -5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
          times: [0, 0.48, 1],
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-300/90 blur-[1.5px]"
            animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <svg width="36" height="27" viewBox="0 0 48 36" fill="none" aria-hidden className="h-[26px] w-[34px]">
            <rect
              x="2"
              y="4"
              width="44"
              height="28"
              rx="6"
              fill="white"
              stroke="currentColor"
              className="text-brand"
              strokeWidth="2"
            />
            <path
              d="M6 10L24 22L42 10"
              stroke="currentColor"
              className="text-brand"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M6 26L18 16" stroke="#A2A8F3" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M42 26L30 16" stroke="#A2A8F3" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>

      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute bottom-[98px] left-[58px] h-1 w-1 rounded-full bg-brand/45"
          animate={{
            x: [0, 58 + i * 18, 128 + i * 15],
            y: [0, -30 - i * 5, 8],
            opacity: [0, 0.9, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeOut',
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  );
}
