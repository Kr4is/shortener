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
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.2)';

  if (links.length === 0) {
    return (
      <Card>
        <CardTitle className="mb-2">Top links</CardTitle>
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
      <CardTitle className="mb-4">Top 5 links by clicks</CardTitle>
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
                background: isDark ? '#0f172a' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: isDark ? '#f1f5f9' : '#0f172a',
              }}
            />
            <Bar
              dataKey="clicks"
              fill={isDark ? '#818cf8' : '#4f46e5'}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
