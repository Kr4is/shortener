'use client';

import Button from '@/components/ui/Button';
import DomainMark from '@/components/ui/DomainMark';
import StateTag from '@/components/ui/StateTag';
import { fetchUrl, ShortStats } from '@/lib/api';
import { copyText, linkState, shortUrl } from '@/lib/links';
import { cn, displayUrl, relativeTime } from '@/lib/utils';
import { Copy, QrCode, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RecentLinksProps {
  slugs: string[];
  ready: boolean;
  fresh: string | null;
  refreshKey: number;
  onCopied: (slug: string) => void;
  onQr: (slug: string) => void;
  onForget: (slug: string) => void;
  onClear: () => void;
}

export default function RecentLinks({
  slugs,
  ready,
  fresh,
  refreshKey,
  onCopied,
  onQr,
  onForget,
  onClear,
}: RecentLinksProps) {
  const [links, setLinks] = useState<Record<string, ShortStats | null>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      slugs.map((slug) =>
        fetchUrl(slug)
          .then((link) => [slug, link] as const)
          .catch(() => [slug, undefined] as const)
      )
    ).then((entries) => {
      if (cancelled) return;
      setLinks((prev) => {
        const next = { ...prev };
        for (const [slug, link] of entries) {
          if (link !== undefined) next[slug] = link;
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [slugs, refreshKey]);

  if (!ready) return null;

  const copy = async (slug: string) => {
    if (await copyText(shortUrl(slug))) {
      onCopied(slug);
      toast.success(`Copied /s/${slug}`);
    } else {
      toast.error('Clipboard blocked. Copy the link manually.');
    }
  };

  return (
    <section aria-labelledby="recent-title" className="panel overflow-hidden">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule px-5 py-3.5">
        <h2 id="recent-title" className="text-[15px] font-semibold">
          Your links
          {slugs.length > 0 && (
            <span className="ml-2 font-normal text-muted">{slugs.length}</span>
          )}
        </h2>
        {slugs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[13px] text-muted hover:text-foreground hover:underline"
          >
            Clear list
          </button>
        )}
      </div>

      {slugs.length === 0 ? (
        <p className="max-w-measure px-5 py-8 text-sm text-muted">
          Links you shorten in this browser show up here with their click
          counts. The list is kept on this device only.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead className="sr-only">
            <tr>
              <th scope="col">Short link</th>
              <th scope="col">Destination</th>
              <th scope="col">Clicks</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slugs.map((slug) => {
              const link = links[slug];
              const gone = link === null;
              const landed = slug === fresh;
              return (
                <tr
                  key={slug}
                  className={cn(
                    'border-b border-rule last:border-0',
                    landed && 'row-landed land-in',
                    gone && 'opacity-60'
                  )}
                >
                  <td className="max-w-[11rem] py-3 pl-5 pr-4 sm:max-w-[18rem] sm:pr-6">
                    <div className="flex items-center gap-3">
                      {link ? (
                        <DomainMark url={link.original_url} />
                      ) : (
                        <span className="h-8 w-8 shrink-0 rounded-md bg-rule" />
                      )}
                      <div className="min-w-0 truncate">
                        <Link
                          href={`/links/${encodeURIComponent(slug)}`}
                          className="font-mono text-[13px] font-medium text-foreground hover:text-accent hover:underline"
                          title={`/s/${slug}`}
                        >
                          /s/{slug}
                        </Link>
                        <span
                          className={cn(
                            'block truncate text-[13px] sm:hidden',
                            'text-muted'
                          )}
                        >
                          {gone
                            ? 'deleted'
                            : link
                              ? displayUrl(link.original_url)
                              : '…'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td
                    className={cn(
                      'hidden w-full max-w-0 truncate py-2.5 pr-6 sm:table-cell',
                      'text-muted'
                    )}
                    title={link?.original_url}
                  >
                    {gone
                      ? 'deleted'
                      : link
                        ? displayUrl(link.original_url)
                        : '…'}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-6 text-right">
                    {link && (
                      <>
                        {link.click_count}
                        <span className="ml-1 hidden text-[13px] text-muted sm:inline">
                          {link.click_count === 1 ? 'click' : 'clicks'}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap py-2.5 pr-6 md:table-cell">
                    {link &&
                      (landed ? (
                        <span className="text-[13px] font-medium text-accent">
                          {link.expires_at
                            ? `New · expires ${relativeTime(link.expires_at)}`
                            : 'New'}
                        </span>
                      ) : (
                        <StateTag state={linkState(link)} />
                      ))}
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-3 text-right">
                    <div className="inline-flex gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copy(slug)}
                        disabled={gone}
                        aria-label={`Copy /s/${slug}`}
                      >
                        <Copy className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onQr(slug)}
                        disabled={gone}
                        aria-label={`QR code for /s/${slug}`}
                        className="hidden sm:inline-flex"
                      >
                        <QrCode className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onForget(slug)}
                        aria-label={`Remove /s/${slug} from this list`}
                        title="Remove from this list (the link keeps working)"
                        className="hidden sm:inline-flex"
                      >
                        <X className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
