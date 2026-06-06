function apiHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const key = process.env.NEXT_PUBLIC_API_KEY;
  if (key) headers['X-API-Key'] = key;
  return headers;
}

export interface ShortStats {
  secret_key: string;
  original_url: string;
  custom_slug: string | null;
  public_slug: string;
  click_count: number;
  created_at: string;
  last_clicked_at: string | null;
  expires_at: string | null;
  is_expired: boolean;
}

export interface TopLink {
  secret_key: string;
  original_url: string;
  click_count: number;
  public_slug: string;
}

export interface DailyClicks {
  date: string;
  clicks: number;
}

export interface TopReferrer {
  referrer: string;
  clicks: number;
}

export interface StatsSummary {
  total_links: number;
  total_clicks: number;
  clicks_today: number;
  top_link: TopLink | null;
}

export interface StatsResponse {
  summary: StatsSummary;
  daily_clicks: DailyClicks[];
  top_links: TopLink[];
  top_referrers: TopReferrer[];
}

export interface UrlPreview {
  url: string;
  title: string | null;
}

export async function createShortUrl(
  url: string,
  alias?: string,
  expiresInDays?: number
): Promise<string> {
  const body: {
    url: string;
    alias?: string;
    expires_in_days?: number;
  } = { url };
  if (alias?.trim()) body.alias = alias.trim();
  if (expiresInDays) body.expires_in_days = expiresInDays;

  const res = await fetch('/api/url', {
    method: 'POST',
    headers: apiHeaders(true),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.detail || 'Failed to shorten URL');
  }

  const data = await res.json();
  return data.public_slug;
}

export async function deleteUrl(slug: string): Promise<void> {
  const res = await fetch(`/api/urls/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: apiHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.detail || 'Failed to delete URL');
  }
}

export async function fetchStats(
  from?: string,
  to?: string
): Promise<StatsResponse> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  const res = await fetch(`/api/stats${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchUrls(): Promise<ShortStats[]> {
  const res = await fetch('/api/urls');
  if (!res.ok) throw new Error('Failed to fetch URLs');
  return res.json();
}

export async function fetchUrlPreview(url: string): Promise<UrlPreview> {
  const params = new URLSearchParams({ url });
  const res = await fetch(`/api/preview?${params}`);
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.detail || 'Failed to fetch preview');
  }
  return res.json();
}

export function exportUrlsCsv(): void {
  window.location.href = '/api/urls/export';
}
