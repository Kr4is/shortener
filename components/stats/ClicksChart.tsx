'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { DailyClicks } from '@/lib/api';
import { useTheme } from 'next-themes';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function ClicksChart({
  data,
  rangeLabel = 'last 30 days',
}: {
  data: DailyClicks[];
  rangeLabel?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.2)';

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    clicks: d.clicks,
  }));

  return (
    <Card>
      <CardTitle className="mb-4">Clicks per day ({rangeLabel})</CardTitle>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tick={{ fill: tickColor, fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: tickColor, fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#0f172a' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: isDark ? '#f1f5f9' : '#0f172a',
              }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke={isDark ? '#818cf8' : '#4f46e5'}
              strokeWidth={2}
              dot={{ fill: isDark ? '#818cf8' : '#4f46e5', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
