'use client';

import DateRangeFilter from '@/components/stats/DateRangeFilter';
import ClicksChart from '@/components/stats/ClicksChart';
import LinksTable from '@/components/stats/LinksTable';
import StatsOverview from '@/components/stats/StatsOverview';
import TopLinksChart from '@/components/stats/TopLinksChart';
import TopReferrers from '@/components/stats/TopReferrers';
import Button from '@/components/ui/Button';
import { exportUrlsCsv, fetchStats, fetchUrls, StatsResponse, ShortStats } from '@/lib/api';
import { motion } from 'framer-motion';
import { BarChart3, Download, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [links, setLinks] = useState<ShortStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [statsData, urlsData] = await Promise.all([
        fetchStats(appliedFrom || undefined, appliedTo || undefined),
        fetchUrls(),
      ]);
      setStats(statsData);
      setLinks(urlsData);
      setError('');
    } catch {
      setError('Failed to load statistics. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, [appliedFrom, appliedTo]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleApplyRange = () => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
    setLoading(true);
  };

  const handleClearRange = () => {
    setDateFrom('');
    setDateTo('');
    setAppliedFrom('');
    setAppliedTo('');
    setLoading(true);
  };

  const handleExport = () => {
    exportUrlsCsv();
    toast.success('CSV export started');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-24 text-destructive">
        <p>{error || 'No data available'}</p>
        <button
          onClick={loadData}
          className="mt-4 text-sm text-muted hover:text-foreground underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const rangeLabel =
    appliedFrom && appliedTo
      ? `${appliedFrom} to ${appliedTo}`
      : 'last 30 days';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-2">
              <BarChart3 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
              <p className="text-sm text-muted">
                Auto-refreshes every 30 seconds · {rangeLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <button
              onClick={loadData}
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
        <DateRangeFilter
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          onApply={handleApplyRange}
          onClear={handleClearRange}
        />
      </motion.div>

      <StatsOverview summary={stats.summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClicksChart data={stats.daily_clicks} rangeLabel={rangeLabel} />
        <TopLinksChart links={stats.top_links} />
      </div>

      <TopReferrers referrers={stats.top_referrers} />

      <LinksTable links={links} onDelete={loadData} />
    </div>
  );
}
