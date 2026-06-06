'use client';

import { StatCard } from '@/components/ui/StatCard';
import { StatsSummary } from '@/lib/api';
import { truncateUrl } from '@/lib/utils';
import { Link2, MousePointerClick, TrendingUp, Zap } from 'lucide-react';

export default function StatsOverview({ summary }: { summary: StatsSummary }) {
  const topSubtitle = summary.top_link
    ? `${truncateUrl(summary.top_link.original_url, 32)} (${summary.top_link.click_count} clicks)`
    : 'No clicks yet';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Links" value={summary.total_links} icon={Link2} />
      <StatCard
        title="Total Clicks"
        value={summary.total_clicks}
        icon={MousePointerClick}
        delay={0.05}
      />
      <StatCard
        title="Clicks Today"
        value={summary.clicks_today}
        icon={Zap}
        delay={0.1}
      />
      <StatCard
        title="Most Popular"
        value={summary.top_link?.click_count ?? 0}
        subtitle={topSubtitle}
        icon={TrendingUp}
        delay={0.15}
      />
    </div>
  );
}
