import type { ReactNode } from 'react';

type PortalPageShellProps = {
  children: ReactNode;
};

export function PortalPageShell({ children }: PortalPageShellProps) {
  return (
    <div className="w-full px-6 py-6 pb-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
