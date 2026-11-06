import { cn } from '@/lib/utils';

const HUES = [221, 174, 262, 32, 346, 142, 199, 12];

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split(/[/?#]/)[0];
  }
}

function hueFor(host: string): number {
  let hash = 0;
  for (let i = 0; i < host.length; i++)
    hash = (hash * 31 + host.charCodeAt(i)) >>> 0;
  return HUES[hash % HUES.length];
}

/** Coloured monogram for a destination; no third-party favicon requests. */
export default function DomainMark({
  url,
  size = 'md',
  className,
}: {
  url: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const host = hostOf(url);
  const letter = (host.match(/[a-z0-9]/i)?.[0] ?? '?').toUpperCase();
  return (
    <span
      aria-hidden
      style={{ ['--h' as string]: hueFor(host) }}
      className={cn(
        'domain-mark inline-flex shrink-0 select-none items-center justify-center font-semibold',
        size === 'sm' && 'h-6 w-6 rounded text-[11px]',
        size === 'md' && 'h-8 w-8 rounded-md text-[13px]',
        size === 'lg' && 'h-11 w-11 rounded-lg text-base',
        className
      )}
    >
      {letter}
    </span>
  );
}
