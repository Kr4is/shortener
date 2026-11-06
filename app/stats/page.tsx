'use client';

import ClicksChart from '@/components/stats/ClicksChart';
import LinksTable from '@/components/stats/LinksTable';
import RangeControl, {
  Range,
  rangeBounds,
  rangeLabel,
} from '@/components/stats/RangeControl';
import RankList from '@/components/stats/RankList';
import SummaryLine from '@/components/stats/SummaryLine';
import Button from '@/components/ui/Button';
import {
  exportUrlsCsv,
  fetchStats,
  fetchUrls,
  ShortStats,
  StatsResponse,
} from '@/lib/api';
import { displayUrl, relativeTime } from '@/lib/utils';
import { Download, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const REFRESH_MS = 30_000;

export default function StatsPage() {
  const [range, setRange] = useState<Range>({ kind: 'preset', days: 30 });
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [links, setLinks] = useState<ShortStats[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { from, to } = rangeBounds(range);
    try {
      const [s, l] = await Promise.all([fetchStats(from, to), fetchUrls()]);
      setStats(s);
      setLinks(l);
      setError('');
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load stats');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  // Keep the "updated … ago" line honest.
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const period = rangeLabel(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 pb-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            Stats
          </h1>
          <p className="mt-1 text-[13px] text-muted" aria-live="polite">
            {loading && !stats
              ? 'Loading…'
              : error && stats
                ? `Refresh failed: ${error}`
                : updatedAt
                  ? `Updated ${relativeTime(new Date(updatedAt).toISOString())} · refreshes every 30s`
                  : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <RangeControl value={range} onChange={setRange} />
          <Button
            onClick={load}
            disabled={loading}
            aria-label="Refresh now"
            size="icon"
            className="h-10 w-10"
            variant="secondary"
          >
            <RefreshCw
              className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
              strokeWidth={1.75}
            />
          </Button>
          <Button onClick={exportUrlsCsv}>
            <Download className="h-4 w-4" strokeWidth={1.75} />
            CSV
          </Button>
        </div>
      </div>

      {!stats ? (
        error ? (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/[0.06] p-5"
          >
            <p className="text-sm text-danger">{error}</p>
            <p className="mt-1 text-[13px] text-muted">
              Check that the API container is running and reachable from the web
              container.
            </p>
            <Button className="mt-4" onClick={load}>
              Try again
            </Button>
          </div>
        ) : (
          <div aria-hidden className="space-y-6">
            <div className="h-24 animate-pulse rounded-lg bg-foreground/[0.04]" />
            <div className="h-56 animate-pulse rounded-lg bg-foreground/[0.04]" />
          </div>
        )
      ) : (
        <>
          <SummaryLine summary={stats.summary} periodLabel={period} />
          <div className="panel p-5">
            <ClicksChart
              data={stats.daily_clicks}
              title={`Clicks per day · ${period}`}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <RankList
              title="Top links"
              empty="No clicks in this period."
              items={stats.top_links.map((l) => ({
                key: l.secret_key,
                label: `/s/${l.public_slug}`,
                mono: true,
                sublabel: displayUrl(l.original_url),
                markUrl: l.original_url,
                href: `/links/${encodeURIComponent(l.public_slug)}`,
                value: l.click_count,
              }))}
            />
            <RankList
              title="Top referrers"
              empty="No referrer data in this period. Direct visits and apps that strip the Referer header are not listed."
              items={stats.top_referrers.map((r) => ({
                key: r.referrer,
                label: displayUrl(r.referrer),
                markUrl: r.referrer,
                value: r.clicks,
              }))}
            />
          </div>
          <LinksTable links={links} onChanged={load} />
        </>
      )}
    </div>
  );
}
