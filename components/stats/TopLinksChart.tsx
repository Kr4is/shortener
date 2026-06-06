'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { TopLink } from '@/lib/api';
import { truncateUrl } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function TopLinksChart({ links }: { links: TopLink[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const tickColor = isDark ? '#a8a29e' : '#78716c';
  const gridColor = isDark
    ? 'rgba(168,162,158,0.12)'
    : 'rgba(120,113,108,0.15)';
  const fillColor = isDark ? '#fbbf24' : '#d97706';

  if (links.length === 0) {
    return (
      <Card>
        <CardTitle className="mb-2 normal-case">Top links</CardTitle>
        <p className="text-sm text-muted">No clicks recorded yet.</p>
      </Card>
    );
  }

  const chartData = links.map((l) => ({
    name: truncateUrl(l.original_url, 28),
    clicks: l.click_count,
  }));

  return (
    <Card>
      <CardTitle className="mb-4 normal-case">Top 5 links by clicks</CardTitle>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              type="number"
              tick={{ fill: tickColor, fontSize: 11 }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: tickColor, fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#1c1917' : '#ffffff',
                border: `1px solid ${isDark ? '#44403c' : '#e7e5e4'}`,
                borderRadius: '12px',
                color: isDark ? '#fafaf9' : '#1c1917',
              }}
            />
            <Bar dataKey="clicks" fill={fillColor} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
