export interface ShortStats {
  secret_key: string;
  original_url: string;
  custom_slug: string | null;
  public_slug: string;
  click_count: number;
  created_at: string;
  last_clicked_at: string | null;
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
}

export async function createShortUrl(
  url: string,
  alias?: string
): Promise<string> {
  const body: { url: string; alias?: string } = { url };
  if (alias?.trim()) body.alias = alias.trim();

  const res = await fetch('/api/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.detail || 'Failed to delete URL');
  }
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchUrls(): Promise<ShortStats[]> {
  const res = await fetch('/api/urls');
  if (!res.ok) throw new Error('Failed to fetch URLs');
  return res.json();
}
