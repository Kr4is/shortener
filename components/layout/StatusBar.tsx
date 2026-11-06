'use client';

import { cn } from '@/lib/utils';
import { Keyboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const tabs: {
  href: string;
  label: string;
  short?: string;
  match: (p: string) => boolean;
}[] = [
  { href: '/', label: 'Shorten', match: (p: string) => p === '/' },
  {
    href: '/stats',
    label: 'Stats',
    match: (p: string) => p.startsWith('/stats') || p.startsWith('/links'),
  },
  {
    href: '/about',
    label: 'How it works',
    short: 'About',
    match: (p: string) => p.startsWith('/about'),
  },
];

export default function StatusBar({ onHelp }: { onHelp: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-panel/90 backdrop-blur supports-[backdrop-filter]:bg-panel/80">
      <div className="mx-auto flex h-14 max-w-6xl items-stretch px-4 sm:px-6">
        <Link
          href="/"
          className="mr-3 flex items-center gap-2.5 text-[15px] font-semibold sm:mr-10"
        >
          <Logo className="h-7 w-7 shrink-0" />
          <span className="sr-only sm:not-sr-only">Shortener</span>
        </Link>
        <nav aria-label="Main" className="flex items-stretch gap-1">
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center px-2.5 text-sm transition-colors sm:px-3',
                  active
                    ? 'font-medium text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-accent'
                    : 'text-muted hover:text-foreground'
                )}
              >
                {tab.short ? (
                  <>
                    <span className="sm:hidden">{tab.short}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </>
                ) : (
                  tab.label
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onHelp}
            className="hidden h-9 w-9 items-center justify-center rounded text-muted hover:bg-foreground/[0.05] hover:text-foreground sm:inline-flex"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
