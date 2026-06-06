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
  const tickColor = isDark ? '#a8a29e' : '#78716c';
  const gridColor = isDark
    ? 'rgba(168,162,158,0.12)'
    : 'rgba(120,113,108,0.15)';
  const strokeColor = isDark ? '#fbbf24' : '#d97706';

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    clicks: d.clicks,
  }));

  return (
    <Card>
      <CardTitle className="mb-1 normal-case">Clicks per day</CardTitle>
      <p className="text-xs text-muted mb-4">{rangeLabel}</p>
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
                background: isDark ? '#1c1917' : '#ffffff',
                border: `1px solid ${isDark ? '#44403c' : '#e7e5e4'}`,
                borderRadius: '12px',
                color: isDark ? '#fafaf9' : '#1c1917',
              }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke={strokeColor}
              strokeWidth={2}
              dot={{ fill: strokeColor, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
