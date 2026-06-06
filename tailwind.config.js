/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
          muted: 'rgb(var(--accent-muted) / <alpha-value>)',
        },
        surface: {
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
        },
        ring: 'rgb(var(--ring) / <alpha-value>)',
        destructive: 'rgb(var(--destructive) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
      },
      boxShadow: {
        warm: '0 1px 3px 0 rgb(28 25 23 / 0.06), 0 1px 2px -1px rgb(28 25 23 / 0.06)',
        'warm-md':
          '0 4px 6px -1px rgb(28 25 23 / 0.08), 0 2px 4px -2px rgb(28 25 23 / 0.06)',
        'warm-lg':
          '0 10px 15px -3px rgb(28 25 23 / 0.08), 0 4px 6px -4px rgb(28 25 23 / 0.05)',
        'accent-sm': '0 2px 8px -2px rgb(217 119 6 / 0.25)',
      },
    },
  },
  plugins: [],
};
