---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/stats/page.tsx"]
---

# Shortener app surfaces (/, /stats, /links/[slug], /about)

Scope: the whole web app shell plus three routes. Visitor mode: **Operate**. Redesign: the previous amber/stone card UI is evidence only (anti-reference: icon tiles, eyebrow badges, "how it works" card grid, side-stripe stat cards, radial glow, rounded-2xl everywhere).

Audience and jobs: public visitors paste a URL and leave with a copied short link; returning visitors see the links they made in this browser; the operator reads clicks, referrers and the link inventory, edits expiry, deletes, exports.

Constraints: English copy, no invented claims, standard web controls (inputs, segmented radios, tables with sortable headers, native dialogs). Light and dark both supported; default follows the system.

## Direction contract

History: a first build followed a pinned terminal/monospaced direction; the owner rejected it on review (2026-11-06) as intrusive and asked for something professional, then for more depth and an informational page. The terminal world is retired.

THESIS: A calm, professional link tool whose personality comes from the links themselves, not from chrome. Refuses both the SaaS landing template and the terminal costume.

OWN-WORLD: Public Sans for interface text, JetBrains Mono only for slugs, URLs and code. Cool grey page, white panels with soft lift, one restrained blue (#2552C7) for action, focus and data; state colours as dot plus word. Domain monograms in eight hashed hues. 6px controls, 10px panels.

STORY: Visitor pastes, watches the link assemble, presses Enter, copies. Operator reads totals, the daily chart, rankings and the sortable table; drills into one link to edit expiry. Curious visitors read /about.

FIRST VIEWPORT: Sticky white header (logo, Shorten / Stats / How it works, shortcuts, theme). Full-bleed white hero band: title and one-line lead, form panel left, live link card right (sticky). "Your links" panel below on grey.

FORM: owner-steered after review; seed:763d611e077adf53 (roll superseded by owner direction).

SIGNATURE: the live link card that becomes the result; domain monograms carried through every list.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
