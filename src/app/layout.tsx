import type { Metadata } from 'next';
import { Poppins, Geist } from 'next/font/google';
import './globals.css';
import { siteMetadata } from '@/lib/site-metadata';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', 'antialiased', poppins.variable, 'font-sans', geist.variable)}>
      <body className="flex min-h-dvh flex-col font-sans text-slate-900">
        <GoogleAnalytics />
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
