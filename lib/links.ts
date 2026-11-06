import type { ShortStats } from './api';

export type LinkState = 'active' | 'expiring' | 'expired';

const EXPIRING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function linkState(link: ShortStats, now = Date.now()): LinkState {
  if (link.is_expired) return 'expired';
  if (link.expires_at) {
    const remaining = new Date(link.expires_at).getTime() - now;
    if (remaining <= 0) return 'expired';
    if (remaining <= EXPIRING_WINDOW_MS) return 'expiring';
  }
  return 'active';
}

export function shortPath(slug: string): string {
  return `/s/${slug}`;
}

export function shortUrl(slug: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${shortPath(slug)}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
