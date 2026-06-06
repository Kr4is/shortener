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
    <nav className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-foreground"
      >
        <div className="rounded-lg bg-accent p-1.5 text-accent-foreground">
          <Link2 className="h-5 w-5" />
        </div>
        <span className="text-lg">Shortener</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex gap-1 rounded-lg bg-background p-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted hover:text-foreground'
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
