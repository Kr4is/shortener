/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

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
        background: token('background'),
        foreground: token('foreground'),
        panel: token('panel'),
        rule: { DEFAULT: token('rule'), strong: token('rule-strong') },
        muted: token('muted'),
        accent: {
          DEFAULT: token('accent'),
          foreground: token('accent-foreground'),
        },
        ok: token('ok'),
        warn: token('warn'),
        danger: token('danger'),
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        lg: '10px',
      },
      boxShadow: {
        dialog: '0 20px 50px -12px rgb(15 23 42 / 0.28)',
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 6px 16px -8px rgb(15 23 42 / 0.10)',
        lift: '0 1px 2px rgb(15 23 42 / 0.04), 0 18px 40px -16px rgb(15 23 42 / 0.22)',
      },
      maxWidth: {
        measure: '72ch',
      },
    },
  },
  plugins: [],
};
