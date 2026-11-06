'use client';

import { DailyClicks } from '@/lib/api';
import { useThemeColors } from '@/lib/theme-colors';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function label(iso: string, opts: Intl.DateTimeFormatOptions) {
  // Dates come as YYYY-MM-DD; parse as local midnight so the day doesn't shift.
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts);
}

export default function ClicksChart({
  data,
  title = 'Clicks per day',
  height = 220,
}: {
  data: DailyClicks[];
  title?: string;
  height?: number;
}) {
  const c = useThemeColors();
  const total = data.reduce((sum, d) => sum + d.clicks, 0);
  const peak = data.reduce(
    (best, d) => (d.clicks > best.clicks ? d : best),
    data[0] ?? { date: '', clicks: 0 }
  );

  const rows = data.map((d) => ({
    day: label(d.date, { month: 'short', day: 'numeric' }),
    full: label(d.date, { weekday: 'short', month: 'short', day: 'numeric' }),
    clicks: d.clicks,
  }));

  return (
    <section aria-labelledby="chart-title">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="chart-title" className="text-[15px] font-semibold">
          {title}
        </h2>
        <p className="text-[13px] text-muted">
          {total} total
          {peak.clicks > 0 && (
            <>
              {' · '}peak {peak.clicks} on{' '}
              {label(peak.date, { month: 'short', day: 'numeric' })}
            </>
          )}
        </p>
      </div>
      {total === 0 ? (
        <div
          className="flex items-center justify-center rounded-md border border-dashed border-rule-strong text-sm text-muted"
          style={{ height }}
        >
          No clicks in this period.
        </div>
      ) : (
        <div
          style={{ height }}
          role="img"
          aria-label={`${title}: ${total} clicks, peak ${peak.clicks}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{ top: 4, right: 0, bottom: 0, left: -12 }}
              barCategoryGap="18%"
            >
              <defs>
                <linearGradient id="clicks-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.accent} stopOpacity={1} />
                  <stop offset="100%" stopColor={c.accent} stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={c.rule} />
              <XAxis
                dataKey="day"
                tick={{
                  fill: c.muted,
                  fontSize: 11,
                  fontFamily: 'var(--font-text)',
                }}
                tickLine={false}
                axisLine={{ stroke: c['rule-strong'] }}
                dy={4}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{
                  fill: c.muted,
                  fontSize: 11,
                  fontFamily: 'var(--font-text)',
                }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={44}
              />
              <Tooltip
                cursor={{ fill: c.foreground, fillOpacity: 0.06 }}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as (typeof rows)[number];
                  return (
                    <div className="rounded-md border border-rule bg-panel px-3 py-2 text-[13px] shadow-lift">
                      <div className="text-muted">{row.full}</div>
                      <div className="font-medium">
                        {row.clicks} {row.clicks === 1 ? 'click' : 'clicks'}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="clicks"
                fill="url(#clicks-fill)"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
