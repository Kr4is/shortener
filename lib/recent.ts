'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'shortener:recent';
const LIMIT = 12;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((s) => typeof s === 'string')
      : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    /* storage full or disabled: the list simply won't persist */
  }
}

/** Slugs created in this browser, newest first. Never sent to the server. */
export function useRecentSlugs() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSlugs(read());
    setReady(true);
  }, []);

  const add = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, LIMIT);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = prev.filter((s) => s !== slug);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setSlugs([]);
  }, []);

  return { slugs, ready, add, remove, clear };
}
