import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
  side: ReactNode;
};

export function AuthLayout({ children, side }: AuthLayoutProps) {
  return (
    <div className="relative grid min-h-full w-full overflow-hidden bg-canvas lg:grid-cols-[1fr_1.05fr]">
      <div className="relative z-1 flex flex-col items-center justify-center overflow-auto px-8 py-10 sm:px-14">
        <div
          aria-hidden="true"
          className="absolute -top-25 -left-25 h-80 w-80 rounded-full bg-brand-glow opacity-16 blur-[60px]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-35 -left-15 h-70 w-70 rounded-full bg-amber opacity-12 blur-[60px]"
        />
        <div className="relative z-1 w-full max-w-[440px]">{children}</div>
      </div>
      <div className="hidden lg:block">{side}</div>
    </div>
  );
}
