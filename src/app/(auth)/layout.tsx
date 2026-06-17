import { ToastProvider } from '@/components/ui/toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-1 flex-col">{children}</div>
    </ToastProvider>
  );
}
