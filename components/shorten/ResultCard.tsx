'use client';

import Button from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import QrCodeModal from './QrCodeModal';

export default function ResultCard({ url }: { url: string }) {
  const [qrOpen, setQrOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-accent/25 bg-accent/5">
          <CardTitle className="flex items-center gap-2 !text-success normal-case tracking-normal text-base font-semibold mb-3">
            <Check className="h-5 w-5" />
            Your link is ready
          </CardTitle>
          <p className="font-mono text-sm text-foreground break-all bg-surface-elevated border border-accent/20 rounded-xl px-4 py-3 mb-4">
            {url}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium px-3 py-1.5 text-sm border border-border text-foreground hover:border-accent/30 hover:bg-accent/5 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          </div>
        </Card>
      </motion.div>
      <QrCodeModal url={url} open={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
}
