import AppShell from '@/components/layout/AppShell';
import ThemeProvider from '@/components/layout/ThemeProvider';
import { JetBrains_Mono, Public_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const sans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'Shortener',
  description: 'Self-hosted URL shortener with click analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable}`}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  'flex w-full items-center gap-3 rounded-lg border border-rule bg-panel px-4 py-3 font-sans text-sm text-foreground shadow-dialog',
                success: '[&_[data-icon]]:text-ok',
                error: '[&_[data-icon]]:text-danger',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
