'use client';

import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/', label: 'Shorten' },
  { href: '/stats', label: 'Statistics' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-4 z-50 flex items-center justify-between rounded-2xl border border-border/80 bg-card/80 px-4 py-3 shadow-warm backdrop-blur-md">
      <Link
        href="/"
        className="flex items-center gap-2.5 font-semibold text-foreground"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Link2 className="h-5 w-5" />
        </div>
        <span className="text-lg tracking-tight">Shortener</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex gap-1 rounded-xl bg-surface-elevated/80 p-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-card text-foreground shadow-warm border border-border/60'
                    : 'text-muted hover:text-foreground hover:bg-accent/5'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
