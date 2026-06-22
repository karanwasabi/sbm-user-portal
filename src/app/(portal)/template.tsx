import { PortalPageTransition } from '@/components/layout/portal/portal-page-transition';

export default function PortalTemplate({ children }: { children: React.ReactNode }) {
  return <PortalPageTransition>{children}</PortalPageTransition>;
}
