import { StatsSummary } from '@/lib/api';
import Link from 'next/link';

export default function SummaryLine({
  summary,
  periodLabel,
}: {
  summary: StatsSummary;
  periodLabel: string;
}) {
  const items: { term: string; value: React.ReactNode; note?: string }[] = [
    { term: 'Links', value: summary.total_links, note: 'all time' },
    { term: 'Clicks', value: summary.total_clicks, note: periodLabel },
    { term: 'Today', value: summary.clicks_today, note: 'since midnight UTC' },
    {
      term: 'Top link',
      value: summary.top_link ? (
        <Link
          href={`/links/${encodeURIComponent(summary.top_link.public_slug)}`}
          className="font-mono text-lg font-medium hover:text-accent hover:underline"
        >
          /s/{summary.top_link.public_slug}
        </Link>
      ) : (
        '—'
      ),
      note: summary.top_link
        ? `${summary.top_link.click_count} clicks`
        : 'no clicks yet',
    },
  ];

  return (
    <dl className="panel grid grid-cols-2 md:grid-cols-[1fr_1fr_1fr_2fr]">
      {items.map((item, i) => (
        <div
          key={item.term}
          className={[
            'min-w-0 px-5 py-4',
            i % 2 === 1 ? 'border-l border-rule' : '',
            i >= 2 ? 'border-t border-rule md:border-t-0' : '',
            i === 2 ? 'md:border-l' : '',
          ].join(' ')}
        >
          <dt className="text-[13px] text-muted">{item.term}</dt>
          <dd className="mt-1 truncate text-2xl font-semibold tracking-tight">
            {item.value}
          </dd>
          {item.note && (
            <dd className="mt-0.5 truncate text-[13px] text-muted">
              {item.note}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
