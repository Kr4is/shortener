import {
  ArrowRight,
  Database,
  Globe,
  MousePointerClick,
  Server,
} from 'lucide-react';

const steps = [
  {
    icon: MousePointerClick,
    title: 'Someone opens the short link',
    detail: 'GET /s/launch',
    body: 'From a post, a chat message, a QR code or a typed address.',
  },
  {
    icon: Server,
    title: 'The web app hands it to the API',
    detail: 'Next.js rewrites /s/* → FastAPI',
    body: 'The browser never talks to the database directly; one service owns every rule.',
  },
  {
    icon: Database,
    title: 'The API looks it up and records the click',
    detail: 'INSERT INTO click_events (time, referrer, user_agent)',
    body: 'The slug is matched against custom aliases and random keys, and the expiry is checked before anything is written.',
    branches: [
      { code: '404', text: 'Unknown slug: a “link not found” page' },
      {
        code: '410',
        text: 'Past its expiry: a “link expired” page, no click counted',
      },
    ],
  },
  {
    icon: Globe,
    title: 'The visitor lands on the destination',
    detail: '307 Temporary Redirect → https://example.com/…',
    body: 'A temporary redirect, so browsers keep asking this server and every visit is counted.',
  },
];

export default function ClickJourney() {
  return (
    <div className="panel mt-6 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-rule bg-foreground/[0.02] px-5 py-3 font-mono text-[13px]">
        <span className="rounded bg-accent/10 px-2 py-0.5 text-accent">
          your-host/s/launch
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
        <span className="truncate text-muted">
          example.com/a/very/long/path
        </span>
      </div>
      <ol className="relative px-5 py-6">
        <span
          aria-hidden
          className="absolute bottom-10 left-[2.4rem] top-10 w-px bg-gradient-to-b from-accent/60 via-accent/30 to-accent/60"
        />
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={
              i > 0 ? 'relative mt-7 flex gap-4' : 'relative flex gap-4'
            }
          >
            <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-panel text-accent shadow-card">
              <step.icon className="h-4 w-4" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 pt-1">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 break-words font-mono text-[12.5px] text-accent">
                {step.detail}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
              {step.branches && (
                <ul className="mt-3 flex flex-col gap-2 sm:flex-row">
                  {step.branches.map((b) => (
                    <li
                      key={b.code}
                      className="flex items-start gap-2 rounded-md border border-rule px-3 py-2 text-[13px]"
                    >
                      <span className="rounded bg-danger/10 px-1.5 font-mono text-[12px] font-medium text-danger">
                        {b.code}
                      </span>
                      <span className="text-muted">{b.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
