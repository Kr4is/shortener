import CodeBlock from '@/components/about/CodeBlock';
import ClickJourney from '@/components/about/ClickJourney';
import Link from 'next/link';

export const metadata = {
  title: 'How it works · Shortener',
  description:
    'What Shortener does, how a click is handled, and how to use its API.',
};

const sections = [
  { id: 'journey', label: 'The journey of a click' },
  { id: 'features', label: 'What you can do' },
  { id: 'data', label: 'Your data' },
  { id: 'api', label: 'Use the API' },
  { id: 'shortcuts', label: 'Keyboard shortcuts' },
];

const features: { term: string; body: React.ReactNode }[] = [
  {
    term: 'Shorten',
    body: (
      <>
        Paste any <code>http</code> or <code>https</code> URL. Pick a custom
        alias (3–32 letters, digits or hyphens) or let the server generate a
        random key, and optionally make the link expire after 7, 30 or 90 days.
        Shortening the same URL twice returns the existing link instead of
        creating a duplicate.
      </>
    ),
  },
  {
    term: 'Track',
    body: (
      <>
        Every visit to a short link is recorded before the redirect: clicks per
        day, the referring site and the browser’s user agent. The stats page
        shows totals, a daily chart, top links and top referrers for the last 7,
        30 or 90 days or any custom range.
      </>
    ),
  },
  {
    term: 'Manage',
    body: (
      <>
        Search, sort and filter every link by status. Open a link to see its own
        chart and referrers, change or remove its expiry, expire it immediately,
        or delete it with its click history. Export the full list as CSV and
        download QR codes as PNG or SVG.
      </>
    ),
  },
];

const shortcuts: [string, string][] = [
  ['/', 'Focus the URL field (home) or search (stats)'],
  ['Ctrl V', 'Paste a URL anywhere on the home page'],
  ['c', 'Copy the link you just created, or the selected one'],
  ['j  k', 'Move through the links table'],
  ['Enter', 'Open the selected link’s details'],
  ['?', 'Show all shortcuts'],
];

export default function AboutPage() {
  return (
    <div className="grid gap-12 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav aria-label="On this page" className="sticky top-24">
          <p className="mb-3 text-[13px] font-medium text-muted">
            On this page
          </p>
          <ul className="space-y-1 border-l border-rule text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ml-px block border-l border-transparent py-1 pl-4 text-muted hover:border-foreground hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <article className="min-w-0 max-w-[46rem] [&_code]:rounded [&_code]:bg-foreground/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.86em]">
        <header>
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2.125rem]">
            How Shortener works
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-muted">
            Shortener turns long URLs into short <code>/s/</code> links and
            counts the clicks. It is a small Next.js app, a FastAPI service and
            a PostgreSQL database, packaged with Docker so it runs entirely on
            infrastructure you control.
          </p>
        </header>

        <section id="journey" className="mt-14 scroll-mt-24">
          <h2 className="text-xl font-semibold tracking-tight">
            The journey of a click
          </h2>
          <p className="mt-2 text-muted">
            What happens between someone tapping a short link and arriving at
            the destination.
          </p>
          <ClickJourney />
        </section>

        <section id="features" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold tracking-tight">
            What you can do
          </h2>
          <dl className="mt-6 divide-y divide-rule border-y border-rule">
            {features.map((f) => (
              <div
                key={f.term}
                className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6"
              >
                <dt className="font-semibold">{f.term}</dt>
                <dd className="leading-relaxed text-muted">{f.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="data" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold tracking-tight">Your data</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-muted">
            <p>
              Links and clicks are stored in the PostgreSQL volume of this
              deployment and nowhere else. A click record holds the time, the
              referrer and the user agent; IP addresses are used in memory for
              rate limiting and are not saved. Fonts are served from this server
              and the coloured domain marks are drawn locally, so pages make no
              third-party requests.
            </p>
            <p>
              The <span className="text-foreground">Your links</span> list on
              the home page lives in your browser’s local storage. Clearing it
              only hides links from that list; the links keep working.
            </p>
            <p>
              Upgrades rebuild the containers without touching the database
              volume, and the repository ships backup and restore scripts in{' '}
              <code>scripts/</code>.
            </p>
          </div>
        </section>

        <section id="api" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold tracking-tight">Use the API</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Everything the interface does goes through a JSON API you can script
            against. If the server sets <code>ADMIN_API_KEY</code>, creating,
            editing and deleting links require it in the <code>X-API-Key</code>{' '}
            header. The full reference is at{' '}
            <a
              href="/docs"
              className="text-foreground underline decoration-rule-strong hover:decoration-foreground"
            >
              /docs
            </a>
            .
          </p>
          <div className="mt-6 space-y-5">
            <CodeBlock
              title="Create a link"
              code={`curl -X POST https://your-host/api/url \\
  -H 'Content-Type: application/json' \\
  -d '{"url": "https://example.com/a/very/long/path", "alias": "launch", "expires_in_days": 30}'

# → {"public_slug": "launch"}`}
            />
            <CodeBlock
              title="Read one link’s clicks"
              code={`curl 'https://your-host/api/urls/launch/stats?days=30'`}
            />
            <CodeBlock
              title="Remove the expiry, or delete"
              code={`curl -X PATCH https://your-host/api/urls/launch \\
  -H 'Content-Type: application/json' -d '{"expires_in_days": null}'

curl -X DELETE https://your-host/api/urls/launch -H 'X-API-Key: <key>'`}
            />
          </div>
        </section>

        <section id="shortcuts" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold tracking-tight">
            Keyboard shortcuts
          </h2>
          <table className="mt-5 w-full text-sm">
            <tbody className="divide-y divide-rule border-y border-rule">
              {shortcuts.map(([keys, label]) => (
                <tr key={keys}>
                  <td className="w-32 py-2.5">
                    <span className="flex gap-1">
                      {keys.split(/\s+/).map((k) => (
                        <kbd key={k} className="kbd">
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted">{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-rule pt-6">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded bg-accent px-4 text-sm font-medium text-accent-foreground shadow-card hover:bg-accent/90"
          >
            Shorten a link
          </Link>
          <Link
            href="/stats"
            className="text-sm text-muted hover:text-foreground hover:underline"
          >
            Open stats
          </Link>
        </div>
      </article>
    </div>
  );
}
