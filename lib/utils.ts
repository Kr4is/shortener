import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Drop the scheme and a trailing slash: the host is what people recognise. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export function truncateMiddle(text: string, max = 48): string {
  if (text.length <= max) return text;
  const head = Math.ceil((max - 1) * 0.6);
  const tail = max - 1 - head;
  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export function relativeTime(
  iso: string | null,
  { now = Date.now(), narrow = false }: { now?: number; narrow?: boolean } = {}
): string {
  if (!iso) return 'never';
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 45) return diff < 0 ? 'just now' : 'in a moment';
  const rtf = new Intl.RelativeTimeFormat('en', {
    numeric: 'auto',
    style: narrow ? 'narrow' : 'long',
  });
  for (const [unit, seconds] of UNITS) {
    if (abs >= seconds || unit === 'minute') {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }
  return '';
}

export function isoDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
