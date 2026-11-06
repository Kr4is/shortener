'use client';

import QrDialog from '@/components/shorten/QrDialog';
import Button from '@/components/ui/Button';
import ConfirmDelete from '@/components/ui/ConfirmDelete';
import Input from '@/components/ui/Input';
import Segmented from '@/components/ui/Segmented';
import DomainMark from '@/components/ui/DomainMark';
import StateTag from '@/components/ui/StateTag';
import { deleteUrl, ShortStats } from '@/lib/api';
import { useHotkeys } from '@/lib/hotkeys';
import { copyText, LinkState, linkState, shortUrl } from '@/lib/links';
import { cn, displayUrl, formatDate, relativeTime } from '@/lib/utils';
import { ArrowDown, ArrowUp, Copy, QrCode, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type SortKey =
  | 'slug'
  | 'destination'
  | 'clicks'
  | 'created'
  | 'last'
  | 'expires';
type Filter = 'all' | LinkState;

const COLUMNS: {
  key: SortKey;
  label: string;
  className?: string;
  numeric?: boolean;
}[] = [
  { key: 'slug', label: 'Short link', className: 'w-auto md:w-[22%]' },
  {
    key: 'destination',
    label: 'Destination',
    className: 'hidden md:table-cell',
  },
  { key: 'clicks', label: 'Clicks', numeric: true, className: 'w-[4.5rem]' },
  {
    key: 'last',
    label: 'Last click',
    className: 'hidden w-[8.5rem] pl-4 lg:table-cell',
  },
  {
    key: 'created',
    label: 'Created',
    className: 'hidden w-[7.5rem] lg:table-cell',
  },
  {
    key: 'expires',
    label: 'Status',
    className: 'hidden w-[10.5rem] sm:table-cell',
  },
];

function sortValue(link: ShortStats, key: SortKey): string | number {
  switch (key) {
    case 'slug':
      return link.public_slug.toLowerCase();
    case 'destination':
      return displayUrl(link.original_url).toLowerCase();
    case 'clicks':
      return link.click_count;
    case 'created':
      return new Date(link.created_at).getTime();
    case 'last':
      return link.last_clicked_at
        ? new Date(link.last_clicked_at).getTime()
        : 0;
    case 'expires':
      return link.expires_at
        ? new Date(link.expires_at).getTime()
        : Number.MAX_SAFE_INTEGER;
  }
}

export default function LinksTable({
  links,
  onChanged,
}: {
  links: ShortStats[];
  onChanged: () => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'created',
    dir: 'desc',
  });
  const [cursor, setCursor] = useState(-1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const counts = useMemo(() => {
    const c = { all: links.length, active: 0, expiring: 0, expired: 0 };
    for (const l of links) c[linkState(l)] += 1;
    return c;
  }, [links]);

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = links.filter((l) => {
      if (filter !== 'all' && linkState(l) !== filter) return false;
      if (!q) return true;
      return (
        l.original_url.toLowerCase().includes(q) ||
        l.public_slug.toLowerCase().includes(q)
      );
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      return va < vb ? -dir : va > vb ? dir : 0;
    });
  }, [links, search, filter, sort]);

  useEffect(() => {
    setCursor((c) => Math.min(c, rows.length - 1));
  }, [rows.length]);

  useEffect(() => {
    if (cursor >= 0)
      rowRefs.current[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const copy = async (slug: string) => {
    if (await copyText(shortUrl(slug))) toast.success(`Copied /s/${slug}`);
    else toast.error('Clipboard blocked. Copy the link manually.');
  };

  const selected = cursor >= 0 ? rows[cursor] : undefined;

  useHotkeys({
    '/': (e) => {
      e.preventDefault();
      searchRef.current?.focus();
    },
    j: () => rows.length && setCursor((c) => Math.min(rows.length - 1, c + 1)),
    k: () => rows.length && setCursor((c) => Math.max(0, c - 1)),
    ArrowDown: (e) => {
      if (cursor < 0) return;
      e.preventDefault();
      setCursor((c) => Math.min(rows.length - 1, c + 1));
    },
    ArrowUp: (e) => {
      if (cursor < 0) return;
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    },
    Enter: () => {
      if (selected)
        router.push(`/links/${encodeURIComponent(selected.public_slug)}`);
    },
    c: () => {
      if (selected) copy(selected.public_slug);
    },
    Escape: () => setCursor(-1),
  });

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'slug' || key === 'destination' ? 'asc' : 'desc' }
    );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUrl(deleteTarget);
      toast.success(`Deleted /s/${deleteTarget}`);
      setDeleteTarget(null);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete link');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section aria-labelledby="links-title" className="panel p-5">
      <div className="mb-3 flex flex-col gap-3 border-b border-rule pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <h2 id="links-title" className="text-[15px] font-semibold lg:pb-2.5">
            All links
          </h2>
          <Segmented<Filter>
            label="Filter by status"
            hideLabel
            value={filter}
            onChange={setFilter}
            options={[
              { label: `All ${counts.all}`, value: 'all' },
              { label: `Active ${counts.active}`, value: 'active' },
              { label: `Expiring ${counts.expiring}`, value: 'expiring' },
              { label: `Expired ${counts.expired}`, value: 'expired' },
            ]}
          />
        </div>
        <div className="relative w-full lg:w-72">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.75}
          />
          <Input
            ref={searchRef}
            type="search"
            placeholder="Search slug or URL"
            aria-label="Search links"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCursor(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
                setCursor(0);
              }
            }}
            className="pl-9 pr-10"
          />
          <kbd className="kbd pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
            /
          </kbd>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="py-10 text-sm text-muted">
          No links yet.{' '}
          <Link href="/" className="text-foreground underline">
            Shorten your first URL
          </Link>
          .
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-sm text-muted">
          Nothing matches{search ? ` “${search}”` : ''}
          {filter !== 'all' ? ` in ${filter} links` : ''}.{' '}
          <button
            type="button"
            className="text-foreground underline"
            onClick={() => {
              setSearch('');
              setFilter('all');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="text-left text-[13px] text-muted">
                {COLUMNS.map((col) => {
                  const active = sort.key === col.key;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={
                        active
                          ? sort.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                      className={cn(
                        'pb-2 font-normal',
                        col.numeric && 'text-right',
                        col.className
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          'inline-flex items-center gap-1 hover:text-foreground',
                          active && 'text-foreground'
                        )}
                      >
                        {col.label}
                        {active &&
                          (sort.dir === 'asc' ? (
                            <ArrowUp className="h-3 w-3" strokeWidth={2} />
                          ) : (
                            <ArrowDown className="h-3 w-3" strokeWidth={2} />
                          ))}
                      </button>
                    </th>
                  );
                })}
                <th
                  scope="col"
                  className="w-[6.5rem] pb-2 text-right font-normal"
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((link, i) => {
                const state = linkState(link);
                const on = i === cursor;
                const slug = link.public_slug;
                return (
                  <tr
                    key={link.secret_key}
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    aria-selected={on}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('a,button')) return;
                      setCursor(i);
                    }}
                    onDoubleClick={() =>
                      router.push(`/links/${encodeURIComponent(slug)}`)
                    }
                    className={cn(
                      'border-t border-rule transition-colors',
                      on
                        ? 'bg-accent/[0.07] shadow-[inset_2px_0_0_rgb(var(--accent))]'
                        : 'hover:bg-foreground/[0.025]'
                    )}
                  >
                    <td className="truncate py-2.5 pr-3">
                      <Link
                        href={`/links/${encodeURIComponent(slug)}`}
                        className="font-mono text-[13px] font-medium text-foreground hover:text-accent hover:underline"
                        title={`/s/${slug}`}
                      >
                        /s/{slug}
                      </Link>
                      <span
                        className={cn(
                          'block truncate text-[13px] md:hidden',
                          'text-muted'
                        )}
                      >
                        {displayUrl(link.original_url)}
                      </span>
                    </td>
                    <td
                      className={cn(
                        'hidden truncate py-2.5 pr-3 md:table-cell',
                        'text-muted'
                      )}
                      title={link.original_url}
                    >
                      <span className="flex items-center gap-2.5">
                        <DomainMark url={link.original_url} size="sm" />
                        <span className="truncate">
                          {displayUrl(link.original_url)}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-medium">
                      {link.click_count}
                    </td>
                    <td
                      className={cn(
                        'hidden py-2.5 pl-4 pr-3 lg:table-cell',
                        'text-muted'
                      )}
                      title={link.last_clicked_at ?? undefined}
                    >
                      {relativeTime(link.last_clicked_at, { narrow: true })}
                    </td>
                    <td
                      className={cn(
                        'hidden py-2.5 pr-3 lg:table-cell',
                        'text-muted'
                      )}
                    >
                      {formatDate(link.created_at)}
                    </td>
                    <td className="hidden py-2.5 pr-3 sm:table-cell">
                      <StateTag state={state} />
                      {link.expires_at && state !== 'expired' && (
                        <span
                          className={cn('ml-1.5 text-[13px]', 'text-muted')}
                        >
                          {relativeTime(link.expires_at, {
                            narrow: true,
                          }).replace(/^in /, '')}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 text-right">
                      <div className="inline-flex gap-0.5">
                        {[
                          {
                            label: 'Copy',
                            icon: Copy,
                            action: () => copy(slug),
                          },
                          {
                            label: 'QR code for',
                            icon: QrCode,
                            action: () => setQrSlug(slug),
                          },
                          {
                            label: 'Delete',
                            icon: Trash2,
                            action: () => setDeleteTarget(slug),
                            danger: true,
                          },
                        ].map(({ label, icon: Icon, action, danger }) => (
                          <Button
                            key={label}
                            size="icon"
                            variant="ghost"
                            onClick={action}
                            aria-label={`${label} /s/${slug}`}
                            className={cn(danger && 'hover:text-danger')}
                          >
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 border-t border-rule pt-3 text-[13px] text-muted">
            {rows.length} of {links.length} links · <kbd className="kbd">j</kbd>{' '}
            <kbd className="kbd">k</kbd> move · <kbd className="kbd">↵</kbd>{' '}
            open · <kbd className="kbd">c</kbd> copy
          </p>
        </div>
      )}

      <ConfirmDelete
        slug={deleteTarget}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <QrDialog
        slug={qrSlug}
        url={qrSlug ? shortUrl(qrSlug) : ''}
        onClose={() => setQrSlug(null)}
      />
    </section>
  );
}
