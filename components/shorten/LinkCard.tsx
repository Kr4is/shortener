'use client';

import Button from '@/components/ui/Button';
import DomainMark, { hostOf } from '@/components/ui/DomainMark';
import { useHotkeys } from '@/lib/hotkeys';
import { copyText, shortUrl } from '@/lib/links';
import { cn, displayUrl } from '@/lib/utils';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { CreatedLink, Draft } from './ShortenForm';

function expiryLabel(days: number) {
  return days ? `Expires in ${days} days` : 'Never expires';
}

/**
 * The link being made. While typing it assembles from the form; once created
 * it becomes the result with copy, QR and open actions.
 */
export default function LinkCard({
  draft,
  created,
  onCopied,
  onQr,
}: {
  draft: Draft | null;
  created: CreatedLink | null;
  onCopied: (slug: string) => void;
  onQr: (slug: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => setOrigin(window.location.host), []);

  useEffect(() => {
    setCopied(false);
    if (created) copyRef.current?.focus({ preventScroll: true });
  }, [created]);

  const typing = !!draft?.url;
  const showCreated = created && !typing;

  const copy = async () => {
    if (!created) return;
    if (await copyText(shortUrl(created.slug))) {
      setCopied(true);
      onCopied(created.slug);
    } else {
      toast.error('Clipboard blocked. Select the link and copy it manually.');
    }
  };
  useHotkeys({ c: () => showCreated && copy() });

  if (showCreated) {
    return (
      <section
        aria-labelledby="result-title"
        className="panel land-in overflow-hidden shadow-lift"
      >
        <div className="flex items-center gap-2 border-b border-rule bg-ok/[0.07] px-5 py-2.5 text-sm font-medium text-ok">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          <h2 id="result-title">Short link ready</h2>
        </div>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <DomainMark url={created.url} size="lg" />
            <div className="min-w-0">
              <p className="break-all font-mono text-lg font-medium leading-snug">
                <span className="text-muted">{origin}</span>/s/{created.slug}
              </p>
              <p
                className="mt-0.5 truncate text-[13px] text-muted"
                title={created.url}
              >
                Redirects to {displayUrl(created.url)}
              </p>
            </div>
          </div>
          {created.aliasIgnored && (
            <p className="mt-4 rounded bg-warn/10 px-3 py-2 text-[13px] text-warn">
              This URL was already shortened, so the existing link is shown. The
              alias “{created.aliasIgnored}” was not applied.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              ref={copyRef}
              variant="primary"
              onClick={copy}
              className="min-w-[7.5rem] flex-1 sm:flex-none"
            >
              {copied ? (
                <Check className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={1.75} />
              )}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button onClick={() => onQr(created.slug)}>
              <QrCode className="h-4 w-4" strokeWidth={1.75} />
              QR
            </Button>
            <a
              href={shortUrl(created.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 px-2 text-sm text-muted hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
              Open
            </a>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-rule pt-3 text-[13px] text-muted">
            <Link
              href={`/links/${encodeURIComponent(created.slug)}`}
              className="hover:text-foreground hover:underline"
            >
              View clicks for this link
            </Link>
            <span className="hidden sm:inline">
              <kbd className="kbd">c</kbd> copies
            </span>
          </div>
        </div>
      </section>
    );
  }

  const url = draft?.url ?? '';
  const valid = !!draft?.urlValid;
  const slug = draft?.alias && draft.aliasValid ? draft.alias : null;

  return (
    <section aria-label="Link preview" className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-rule px-5 py-2.5 text-[13px] text-muted">
        <span>Preview</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
          {expiryLabel(draft?.expiresInDays ?? 0)}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          {valid ? (
            <DomainMark url={url} size="lg" />
          ) : (
            <span
              aria-hidden
              className="h-11 w-11 shrink-0 rounded-lg border border-dashed border-rule-strong"
            />
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'truncate text-[15px] font-medium',
                !valid && 'text-muted'
              )}
            >
              {valid
                ? draft?.titleLoading
                  ? 'Reading page title…'
                  : draft?.title || hostOf(url)
                : 'Your destination'}
            </p>
            <p className="truncate text-[13px] text-muted" title={url}>
              {valid ? displayUrl(url) : 'Paste a URL to see it here'}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-md border border-rule bg-background/60 px-4 py-3">
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
            Short link
          </p>
          <p className="mt-1 truncate font-mono text-[15px]">
            <span className="text-muted">{origin}/s/</span>
            {slug ? (
              <span className="text-accent">{slug}</span>
            ) : (
              <span className="text-muted/70">random-key</span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
