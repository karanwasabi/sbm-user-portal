import type { ReactNode } from 'react';

type PortalPageShellProps = {
  children: ReactNode;
};

export function PortalPageShell({ children }: PortalPageShellProps) {
  return (
    <div className="w-full px-4 py-5 pb-8 sm:px-6 sm:py-6 sm:pb-10 lg:px-10">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
