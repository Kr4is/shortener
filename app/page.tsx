'use client';

import LinkCard from '@/components/shorten/LinkCard';
import QrDialog from '@/components/shorten/QrDialog';
import RecentLinks from '@/components/shorten/RecentLinks';
import ShortenForm, {
  CreatedLink,
  Draft,
} from '@/components/shorten/ShortenForm';
import { shortUrl } from '@/lib/links';
import { useRecentSlugs } from '@/lib/recent';
import Link from 'next/link';
import { useCallback, useState } from 'react';

export default function Home() {
  const recent = useRecentSlugs();
  const [created, setCreated] = useState<CreatedLink | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = (link: CreatedLink) => {
    setCreated(link);
    setFresh(link.slug);
    recent.add(link.slug);
    setRefreshKey((k) => k + 1);
  };

  const handleCopied = (slug: string) => {
    if (slug === fresh) setFresh(null);
  };

  const handleDraft = useCallback((d: Draft) => setDraft(d), []);
  const showCardOnMobile = !!created && !draft?.url;

  return (
    <div className="space-y-12">
      <div className="full-bleed hero-band -mt-10 border-b border-rule pb-12 pt-10 md:-mt-12 md:pb-14 md:pt-14">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2.125rem]">
              Short links you host yourself
            </h1>
            <p className="mt-2 max-w-[52ch] text-[15px] text-muted">
              Paste a long URL, share the short one, and see who clicks it.
              Everything runs and stays on this server.{' '}
              <Link
                href="/about"
                className="text-foreground underline decoration-rule-strong hover:decoration-foreground"
              >
                How it works
              </Link>
            </p>
            <div className="panel mt-8 p-5 shadow-lift sm:p-6">
              <ShortenForm onCreated={handleCreated} onDraft={handleDraft} />
            </div>
          </div>
          <div
            className={
              showCardOnMobile
                ? 'lg:sticky lg:top-24 lg:mt-[7.25rem]'
                : 'hidden lg:sticky lg:top-24 lg:mt-[7.25rem] lg:block'
            }
          >
            <LinkCard
              draft={draft}
              created={created}
              onCopied={handleCopied}
              onQr={setQrSlug}
            />
          </div>
        </div>
      </div>

      <RecentLinks
        slugs={recent.slugs}
        ready={recent.ready}
        fresh={fresh}
        refreshKey={refreshKey}
        onCopied={handleCopied}
        onQr={setQrSlug}
        onForget={recent.remove}
        onClear={recent.clear}
      />

      <QrDialog
        slug={qrSlug}
        url={qrSlug ? shortUrl(qrSlug) : ''}
        onClose={() => setQrSlug(null)}
      />
    </div>
  );
}
