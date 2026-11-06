---
name: Shortener
description: Self-hosted URL shortener with click analytics; calm, professional working surface.
colors:
  background: 'rgb(243 245 248)'
  panel: 'rgb(255 255 255)'
  foreground: 'rgb(17 24 39)'
  muted: 'rgb(95 103 117)'
  rule: 'rgb(228 231 236)'
  rule-strong: 'rgb(206 211 219)'
  accent: 'rgb(37 82 199)'
  accent-foreground: 'rgb(255 255 255)'
  ok: 'rgb(21 128 61)'
  warn: 'rgb(161 98 7)'
  danger: 'rgb(185 28 28)'
  dark-background: 'rgb(12 14 18)'
  dark-panel: 'rgb(21 24 30)'
  dark-foreground: 'rgb(228 231 236)'
  dark-accent: 'rgb(122 160 255)'
typography:
  display:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '2.125rem'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.02em'
  heading:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '15px'
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: 1.4
  data:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: '13px'
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: '4px'
  md: '6px'
  lg: '10px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '48px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-foreground}'
    rounded: '{rounded.md}'
    height: '40px'
    padding: '0 16px'
  button-secondary:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
    height: '40px'
    padding: '0 16px'
  input:
    backgroundColor: '{colors.panel}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
    height: '40px'
  panel:
    backgroundColor: '{colors.panel}'
    rounded: '{rounded.lg}'
    padding: '20px'
---

# Design System: Shortener

## Overview

A quiet, professional tool. Two planes do the work: a cool grey page and white panels that sit on it with a soft lift. Colour is spent on one blue for the primary action, focus and data, and on state colours where they mean something. Personality comes from the data itself: each destination domain gets a coloured monogram, and the link being created assembles live in a preview card next to the form.

Light and dark are both first-class; the default follows the system.

## Colors

### Primary

- **Accent blue** `rgb(37 82 199)` (dark: `rgb(122 160 255)`): primary buttons, focus rings, active tab indicator, chart bars, rank bars, the alias being typed in the preview.

### Neutral

- **Background** `rgb(243 245 248)`: the page.
- **Panel** `rgb(255 255 255)`: every working surface.
- **Foreground / muted**: text and secondary text; muted keeps ≥4.5:1 on both background and panel.
- **Rule / rule-strong**: dividers and control borders.

### State

- **ok / warn / danger**: Active, Expiring (≤7 days), Expired. Used for text and a 6px dot, never as fills for whole rows.

### Domain marks

Eight fixed hues (221, 174, 262, 32, 346, 142, 199, 12) chosen by hashing the hostname; light tint background with dark same-hue letter (inverted in dark mode). Generated locally, no favicon requests.

### Named Rules

- One blue. Do not add a second brand colour; extra colour comes only from state or domain marks.
- Selection is a tint (`accent / 0.07`) with a 2px inset line, never reverse video.

## Typography

Public Sans for all interface text. JetBrains Mono only for data that is literally code or an address: slugs, short URLs, API snippets, `kbd` keys. Numerals are tabular everywhere.

### Hierarchy

- Page title 28–34px / 600, tight tracking.
- Section heading 15px / 600.
- Body 15px, labels 14px / 500, meta 13px muted.

## Layout

Max width 72rem with 16–24px gutters. Home is a two-column hero on a full-bleed white band (form left, live link card right, sticky), followed by "Your links" on the grey page. Stats is a single column of panels: summary, chart, two rankings side by side, the links table. The About page is a reading column (46rem) with a sticky table of contents.

## Elevation & Depth

### Shadow Vocabulary

- `card`: `0 1px 2px rgb(15 23 42 / .04), 0 6px 16px -8px rgb(15 23 42 / .10)` for panels.
- `lift`: `0 1px 2px rgb(15 23 42 / .04), 0 18px 40px -16px rgb(15 23 42 / .22)` for the form and the result card.
- `dialog`: `0 20px 50px -12px rgb(15 23 42 / .28)`.

In dark mode shadows fade out; borders carry the separation.

## Shapes

6px for controls, 10px for panels, round only for status dots and the step nodes on the About diagram.

## Components

### Buttons

Primary (accent fill), secondary (white with border), ghost (icon actions in tables), danger (white with red text). Heights 32/40/44.

### Segmented control

Radio group in a tinted track; the chosen option is a raised white chip. Full width on phones.

### Cards / Containers

`.panel`: white, 1px rule border, 10px radius, `card` shadow. Never nested.

### Inputs / Fields

40–44px, 1px rule-strong border, accent border plus 3px accent/20 ring on focus. URL and alias fields use the mono face.

### Navigation

Sticky white header with blurred backdrop; tabs are text with a 2px accent underline for the current page.

### Link card (signature)

Beside the form, a preview card assembles the link while typing (domain mark, page title, destination, `host/s/alias`, expiry). After submit it becomes the result: green "Short link ready" strip, Copy focused, `c` copies.

### Logo

Two interlocking links that form an **S**: the front link in white, the back link in `#A9C0FF`, masked where they cross, on a `#3466E6 → #1E46B4` diagonal gradient with 8/32 corner radius. Source of truth: `app/icon.svg` (inline copy in `components/layout/Logo.tsx`). `app/favicon.ico` (16/32/48) and `app/apple-icon.png` (180, square, no rounding) are rendered from it.

## Do's and Don'ts

### Do:

- Keep mono for addresses and code only.
- Show state with words plus a dot.
- Put each job in its own panel; let the page background separate them.

### Don't:

- Coloured side stripes on cards, gradient text, glows, or icon tiles above headings.
- Eyebrow labels above headings, metric-tile grids with icons.
- Third-party requests for favicons, fonts or analytics.
