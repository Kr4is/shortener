'use client';

import Button from '@/components/ui/Button';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QrCodeModalProps {
  url: string;
  open: boolean;
  onClose: () => void;
}

export default function QrCodeModal({ url, open, onClose }: QrCodeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          QR Code
        </h3>
        <div className="inline-block rounded-lg bg-white p-4">
          <QRCodeSVG value={url} size={200} />
        </div>
        <p className="mt-4 text-xs text-muted break-all max-w-[240px]">{url}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
