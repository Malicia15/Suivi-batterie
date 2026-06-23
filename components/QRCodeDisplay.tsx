'use client';

import { useEffect, useRef } from 'react';

interface Props {
  serie: string;
}

export default function QRCodeDisplay({ serie }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = `${window.location.origin}/batterie/${encodeURIComponent(serie)}`;

    import('qrcode').then((QRCode) => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      const canvas = document.createElement('canvas');
      containerRef.current.appendChild(canvas);
      QRCode.toCanvas(canvas, url, { width: 140, margin: 1 });
    });
  }, [serie]);

  const handlePrint = () => {
    const url = `${window.location.origin}/batterie/${encodeURIComponent(serie)}`;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(url, { width: 200, margin: 1 }).then((dataUrl) => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>Étiquette ${serie}</title>
          <style>
            body{font-family:Arial,sans-serif;text-align:center;padding:16px;}
            .label{border:3px solid #0a2a5e;border-radius:10px;padding:14px;display:inline-block;width:200px;}
            .title{font-size:10px;font-weight:700;color:#0a2a5e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}
            .serie{font-size:15px;font-weight:700;color:#0a2a5e;margin:6px 0;}
            .scan{font-size:9px;color:#888;margin-top:6px;}
            @media print{body{margin:0;}}
          </style>
          </head><body><div class="label">
          <div class="title">⚡ Batterie Traction VE</div>
          <div class="serie">${serie}</div>
          <img src="${dataUrl}" width="140" height="140" />
          <div class="scan">Scanner pour le suivi complet</div>
          </div><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      });
    });
  };

  return (
    <div className="qr-zone">
      <div id="qrcode" ref={containerRef} style={{ display: 'inline-block', padding: 12, background: 'white', border: '2px solid var(--border)', borderRadius: 10, margin: '12px auto' }} />
      <div className="qr-label">Scanner pour accéder au suivi</div>
      <button className="btn btn-sm btn-outline" style={{ marginTop: 10 }} onClick={handlePrint}>
        🖨️ Imprimer étiquette
      </button>
    </div>
  );
}
