'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const NAMES = [
  'accent',
  'foreground',
  'muted',
  'rule',
  'rule-strong',
  'panel',
] as const;
type Name = (typeof NAMES)[number];
export type ThemeColors = Record<Name, string>;

const FALLBACK: ThemeColors = {
  accent: 'rgb(47 85 255)',
  foreground: 'rgb(232 232 227)',
  muted: 'rgb(146 149 160)',
  rule: 'rgb(42 44 54)',
  'rule-strong': 'rgb(74 77 92)',
  panel: 'rgb(20 21 27)',
};

/** Resolved token colours for libraries (charts) that need literal values. */
export function useThemeColors(): ThemeColors {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ThemeColors>(FALLBACK);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const next = {} as ThemeColors;
    for (const name of NAMES) {
      const value = style.getPropertyValue(`--${name}`).trim();
      next[name] = value ? `rgb(${value})` : FALLBACK[name];
    }
    setColors(next);
  }, [resolvedTheme]);

  return colors;
}
