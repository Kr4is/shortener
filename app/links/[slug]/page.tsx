'use client';

import QrDialog from '@/components/shorten/QrDialog';
import ClicksChart from '@/components/stats/ClicksChart';
import RankList from '@/components/stats/RankList';
import Button, { buttonClass } from '@/components/ui/Button';
import ConfirmDelete from '@/components/ui/ConfirmDelete';
import Segmented from '@/components/ui/Segmented';
import StateTag from '@/components/ui/StateTag';
import {
  deleteUrl,
  fetchUrlStats,
  LinkStatsResponse,
  updateExpiry,
} from '@/lib/api';
import { copyText, linkState, shortUrl } from '@/lib/links';
import { useHotkeys } from '@/lib/hotkeys';
import {
  displayUrl,
  formatDate,
  formatDateTime,
  relativeTime,
} from '@/lib/utils';
import { ArrowLeft, Copy, ExternalLink, QrCode, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type Days = 7 | 30 | 90;

const EXPIRY_CHOICES = [
  { label: 'Never', value: 'never' },
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
] as const;

export default function LinkDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);
  const router = useRouter();
  const [days, setDays] = useState<Days>(30);
  const [data, setData] = useState<LinkStatsResponse | null | undefined>(
    undefined
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await fetchUrlStats(slug, days));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load link');
    }
  }, [slug, days]);

  useEffect(() => {
    load();
  }, [load]);

  const full = shortUrl(slug);
  const copy = async () => {
    if (await copyText(full)) toast.success(`Copied /s/${slug}`);
    else toast.error('Clipboard blocked. Copy the link manually.');
  };
  useHotkeys({ c: copy });

  const changeExpiry = async (
    change: Parameters<typeof updateExpiry>[1],
    message: string
  ) => {
    setSaving(true);
    try {
      const link = await updateExpiry(slug, change);
      setData((d) => (d ? { ...d, link } : d));
      toast.success(message);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not update expiry'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUrl(slug);
      toast.success(`Deleted /s/${slug}`);
      router.push('/stats');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete link');
      setDeleting(false);
    }
  };

  const back = (
    <Link
      href="/stats"
      className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
      Stats
    </Link>
  );

  if (data === null) {
    return (
      <div className="max-w-measure space-y-4">
        {back}
        <h1 className="text-2xl font-semibold">
          This short link doesn’t exist
        </h1>
        <p className="font-mono text-sm">/s/{slug}</p>
        <p className="text-sm text-muted">
          It may have been deleted, or the address is mistyped.
        </p>
        <Link href="/" className={buttonClass('secondary', 'md')}>
          Shorten a new link
        </Link>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="space-y-4">
        {back}
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/[0.06] p-5"
          >
            <p className="text-sm text-danger">{error}</p>
            <Button className="mt-4" onClick={load}>
              Try again
            </Button>
          </div>
        ) : (
          <div
            aria-hidden
            className="h-40 animate-pulse rounded-lg bg-foreground/[0.04]"
          />
        )}
      </div>
    );
  }

  const { link } = data;
  const state = linkState(link);

  const facts: [string, React.ReactNode][] = [
    ['Status', <StateTag key="s" state={state} />],
    ['Clicks', link.click_count],
    [
      'Last click',
      link.last_clicked_at ? (
        <span title={formatDateTime(link.last_clicked_at)}>
          {relativeTime(link.last_clicked_at)}
        </span>
      ) : (
        'never'
      ),
    ],
    ['Created', formatDateTime(link.created_at)],
    [
      'Expires',
      link.expires_at ? (
        <span title={formatDateTime(link.expires_at)}>
          {formatDate(link.expires_at)}{' '}
          <span className="text-muted">
            · {relativeTime(link.expires_at, { narrow: true })}
          </span>
        </span>
      ) : (
        'never'
      ),
    ],
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4 pb-2">
        {back}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="break-all font-mono text-xl font-medium tracking-tight sm:text-2xl">
              /s/{link.public_slug}
            </h1>
            <a
              href={link.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm text-muted hover:text-foreground"
              title={link.original_url}
            >
              <span className="truncate">
                Redirects to {displayUrl(link.original_url)}
              </span>
              <ExternalLink
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={1.75}
              />
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={copy}>
              <Copy className="h-4 w-4" strokeWidth={1.75} />
              Copy
            </Button>
            <Button onClick={() => setQrOpen(true)}>
              <QrCode className="h-4 w-4" strokeWidth={1.75} />
              QR code
            </Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <dl className="panel grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3 lg:grid-cols-5">
        {facts.map(([term, value]) => (
          <div key={term} className="min-w-0">
            <dt className="text-[13px] text-muted">{term}</dt>
            <dd className="mt-0.5 truncate text-sm">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="panel space-y-4 p-5">
        <Segmented<Days>
          label="Period"
          hideLabel
          value={days}
          onChange={setDays}
          options={[
            { label: '7d', value: 7 },
            { label: '30d', value: 30 },
            { label: '90d', value: 90 },
          ]}
        />
        <ClicksChart
          data={data.daily_clicks}
          title={`Clicks per day · last ${days} days`}
          height={200}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <RankList
          title="Referrers"
          empty="No referrers recorded. Clicks from apps, email and typed URLs arrive without one."
          items={data.top_referrers.map((r) => ({
            key: r.referrer,
            label: displayUrl(r.referrer),
            markUrl: r.referrer,
            value: r.clicks,
          }))}
        />
        <section className="panel min-w-0 p-5">
          <h2 className="mb-2 border-b border-rule pb-2 text-[15px] font-semibold">
            Expiry
          </h2>
          <p className="mb-4 text-[13px] text-muted">
            Set a new expiry counted from now. Expired links answer with a “link
            expired” page instead of redirecting.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <Segmented<string>
              label="Expires"
              hideLabel
              disabled={saving}
              value={link.expires_at ? '' : 'never'}
              onChange={(v) =>
                v === 'never'
                  ? changeExpiry({ expiresInDays: null }, 'Expiry removed')
                  : changeExpiry(
                      { expiresInDays: Number(v) },
                      `Expires in ${v} days`
                    )
              }
              options={EXPIRY_CHOICES.map((c) => ({ ...c }))}
            />
            {state !== 'expired' && (
              <Button
                variant="danger"
                disabled={saving}
                onClick={() =>
                  changeExpiry({ expireNow: true }, 'Link expired')
                }
              >
                Expire now
              </Button>
            )}
          </div>
        </section>
      </div>

      <QrDialog
        slug={qrOpen ? slug : null}
        url={full}
        onClose={() => setQrOpen(false)}
      />
      <ConfirmDelete
        slug={confirmDelete ? slug : null}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
