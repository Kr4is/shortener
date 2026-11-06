'use client';

import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { Download } from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

function download(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
}

export default function QrDialog({
  slug,
  url,
  onClose,
}: {
  slug: string | null;
  url: string;
  onClose: () => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const saveSvg = () => {
    if (!svgRef.current) return;
    const markup = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([markup], { type: 'image/svg+xml' });
    const href = URL.createObjectURL(blob);
    download(href, `qr-${slug}.svg`);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const savePng = () => {
    if (!canvasRef.current) return;
    download(canvasRef.current.toDataURL('image/png'), `qr-${slug}.png`);
  };

  return (
    <Dialog
      open={!!slug}
      onClose={onClose}
      title={`QR code · /s/${slug ?? ''}`}
    >
      <div className="flex flex-col items-center">
        <div className="bg-white p-4">
          <QRCodeSVG
            ref={svgRef}
            value={url}
            size={208}
            marginSize={0}
            bgColor="#ffffff"
            fgColor="#111216"
          />
        </div>
        {/* Off-screen high-resolution copy for the PNG export. */}
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={1024}
          marginSize={4}
          className="hidden"
          aria-hidden
        />
        <p className="mt-4 max-w-full break-all text-center text-[13px] text-muted">
          {url}
        </p>
        <div className="mt-5 flex w-full gap-2">
          <Button className="flex-1" onClick={savePng}>
            <Download className="h-4 w-4" strokeWidth={1.75} />
            PNG
          </Button>
          <Button className="flex-1" onClick={saveSvg}>
            <Download className="h-4 w-4" strokeWidth={1.75} />
            SVG
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
