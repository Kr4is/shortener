import DomainMark from '@/components/ui/DomainMark';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface RankItem {
  key: string;
  label: string;
  sublabel?: string;
  href?: string;
  value: number;
  mono?: boolean;
  markUrl?: string;
}

export default function RankList({
  title,
  items,
  empty,
  unit = 'clicks',
}: {
  title: string;
  items: RankItem[];
  empty: string;
  unit?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <section className="panel min-w-0 p-5">
      <div className="mb-2 flex items-baseline justify-between border-b border-rule pb-2">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <span className="text-[13px] text-muted">{unit}</span>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-sm text-muted">{empty}</p>
      ) : (
        <ol>
          {items.map((item, i) => {
            const share = total ? Math.round((item.value / total) * 100) : 0;
            const body = (
              <>
                <span className="w-4 shrink-0 text-[13px] text-muted">
                  {i + 1}
                </span>
                {item.markUrl && <DomainMark url={item.markUrl} />}
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate',
                      item.mono
                        ? 'font-mono text-[13px] font-medium'
                        : 'text-sm'
                    )}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                  {item.sublabel && (
                    <span
                      className="block truncate text-[13px] text-muted"
                      title={item.sublabel}
                    >
                      {item.sublabel}
                    </span>
                  )}
                  <span
                    aria-hidden
                    className="mt-1.5 block h-1 overflow-hidden rounded-full bg-rule"
                  >
                    <span
                      className="block h-full rounded-full bg-accent/80"
                      style={{ width: `${(item.value / max) * 100}%` }}
                    />
                  </span>
                </span>
                <span className="w-24 shrink-0 text-right text-sm font-medium">
                  {item.value}
                  <span className="ml-1.5 inline-block w-9 text-[13px] font-normal text-muted">
                    {share}%
                  </span>
                </span>
              </>
            );
            return (
              <li
                key={item.key}
                className="border-b border-rule/60 last:border-0"
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded px-1 py-2.5 hover:bg-foreground/[0.03]"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-1 py-2.5">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
