'use client';

import QrCodeModal from '@/components/shorten/QrCodeModal';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import { deleteUrl, ShortStats } from '@/lib/api';
import { formatDate, truncateUrl } from '@/lib/utils';
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  QrCode,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

interface LinksTableProps {
  links: ShortStats[];
  onDelete?: () => void;
}

export default function LinksTable({ links, onDelete }: LinksTableProps) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ShortStats | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return links;
    return links.filter(
      (l) =>
        l.original_url.toLowerCase().includes(q) ||
        l.public_slug.toLowerCase().includes(q) ||
        (l.custom_slug && l.custom_slug.toLowerCase().includes(q)) ||
        l.secret_key.toLowerCase().includes(q)
    );
  }, [links, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUrl(deleteTarget.public_slug);
      setDeleteTarget(null);
      toast.success('Link deleted');
      onDelete?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete link');
    } finally {
      setDeleting(false);
    }
  };

  if (links.length === 0) {
    return (
      <Card className="text-center py-12">
        <Link2 className="h-12 w-12 text-muted mx-auto mb-4" />
        <CardTitle>No links yet</CardTitle>
        <p className="text-muted mt-2 text-sm">
          Create your first shortened URL on the home page.
        </p>
      </Card>
    );
  }

  const shortUrl = (link: ShortStats) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${link.public_slug}`;

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <CardTitle>All links</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <p className="text-xs text-muted mb-4">
          Showing {filtered.length} of {links.length} links
        </p>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">
            No links match your search.
          </p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-3 pr-4 font-medium">Original URL</th>
                    <th className="pb-3 pr-4 font-medium">Short link</th>
                    <th className="pb-3 pr-4 font-medium">Clicks</th>
                    <th className="pb-3 pr-4 font-medium">Created</th>
                    <th className="pb-3 pr-4 font-medium">Last click</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((link) => (
                    <tr
                      key={link.secret_key}
                      className="border-b border-border/50 hover:bg-background transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-foreground"
                            title={link.original_url}
                          >
                            {truncateUrl(link.original_url)}
                          </span>
                          <a
                            href={link.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          <code className="text-accent text-xs">
                            /s/{link.public_slug}
                          </code>
                          {link.is_expired && (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                              Expired
                            </Badge>
                          )}
                          <CopyButton text={shortUrl(link)} />
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge>{link.click_count}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {formatDate(link.created_at)}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {formatDate(link.last_clicked_at)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQrUrl(shortUrl(link))}
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(link)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {filtered.map((link) => (
                <div
                  key={link.secret_key}
                  className="rounded-lg border border-border bg-background p-4 space-y-2"
                >
                  <p className="text-foreground text-sm break-all">
                    {truncateUrl(link.original_url, 60)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-accent text-xs">
                        /s/{link.public_slug}
                      </code>
                      {link.is_expired && (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                          Expired
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge>{link.click_count} clicks</Badge>
                      <CopyButton text={shortUrl(link)} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQrUrl(shortUrl(link))}
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(link)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted">
                    Created {formatDate(link.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete link"
        message={`Are you sure you want to delete /s/${deleteTarget?.public_slug}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <QrCodeModal
        url={qrUrl || ''}
        open={!!qrUrl}
        onClose={() => setQrUrl(null)}
      />
    </>
  );
}
