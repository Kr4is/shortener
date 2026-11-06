'use client';

import { useHotkeys } from '@/lib/hotkeys';
import { useState } from 'react';
import ShortcutsDialog from './ShortcutsDialog';
import StatusBar from './StatusBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [helpOpen, setHelpOpen] = useState(false);
  useHotkeys({ '?': () => setHelpOpen(true) });

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-panel focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <StatusBar onHelp={() => setHelpOpen(true)} />
      <main
        id="main"
        className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-10 sm:px-6 md:pt-12"
      >
        {children}
      </main>
      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[13px] text-muted sm:px-6">
          <span>Self-hosted. Links and click data stay on this server.</span>
          <span className="flex gap-5">
            <a href="/about" className="hover:text-foreground hover:underline">
              How it works
            </a>
            <a href="/docs" className="hover:text-foreground hover:underline">
              API reference
            </a>
          </span>
        </div>
      </footer>
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
