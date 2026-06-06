'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { TopReferrer } from '@/lib/api';
import { truncateUrl } from '@/lib/utils';

export default function TopReferrers({
  referrers,
}: {
  referrers: TopReferrer[];
}) {
  if (referrers.length === 0) {
    return (
      <Card>
        <CardTitle className="mb-2 normal-case">Top referrers</CardTitle>
        <p className="text-sm text-muted">No referrer data yet.</p>
      </Card>
    );
  }

  const maxClicks = Math.max(...referrers.map((r) => r.clicks));

  return (
    <Card>
      <CardTitle className="mb-4 normal-case">Top referrers</CardTitle>
      <div className="space-y-4">
        {referrers.map((item) => {
          const width = maxClicks > 0 ? (item.clicks / maxClicks) * 100 : 0;
          return (
            <div key={item.referrer} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span
                  className="text-foreground truncate"
                  title={item.referrer}
                >
                  {truncateUrl(item.referrer, 48)}
                </span>
                <span className="text-muted shrink-0 tabular-nums">
                  {item.clicks} clicks
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent/70 transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
