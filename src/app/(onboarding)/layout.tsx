import { ToastProvider } from '@/components/ui/toast';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
