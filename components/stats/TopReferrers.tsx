'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { TopReferrer } from '@/lib/api';
import { truncateUrl } from '@/lib/utils';

export default function TopReferrers({ referrers }: { referrers: TopReferrer[] }) {
  if (referrers.length === 0) {
    return (
      <Card>
        <CardTitle className="mb-2">Top referrers</CardTitle>
        <p className="text-sm text-muted">No referrer data yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-4">Top referrers</CardTitle>
      <div className="space-y-3">
        {referrers.map((item) => (
          <div
            key={item.referrer}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span
              className="text-foreground truncate"
              title={item.referrer}
            >
              {truncateUrl(item.referrer, 48)}
            </span>
            <span className="text-muted shrink-0">{item.clicks} clicks</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
