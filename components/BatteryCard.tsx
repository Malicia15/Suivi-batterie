'use client';

import Link from 'next/link';
import type { BatteryListItem } from '@/lib/types';

function decisionBadge(v: string | null) {
  if (!v) return <span className="badge badge-gray">—</span>;
  if (v.includes('critique') && !v.includes('non critique'))
    return <span className="badge badge-red">🔴 Critique</span>;
  if (v.includes('non critique'))
    return <span className="badge badge-orange">⚠️ Non critique</span>;
  if (v.includes('Non endommagée'))
    return <span className="badge badge-green">✅ Saine</span>;
  return <span className="badge badge-blue">{v}</span>;
}

function sohColor(v: number | null): string {
  if (!v) return '';
  if (v >= 80) return 'color:var(--green)';
  if (v >= 60) return 'color:var(--orange)';
  return 'color:var(--red)';
}

interface Props {
  battery: BatteryListItem;
  onDelete: (serie: string) => void;
}

export default function BatteryCard({ battery, onDelete }: Props) {
  const dims =
    battery.longueur && battery.largeur && battery.hauteur
      ? `${battery.longueur}×${battery.largeur}×${battery.hauteur}mm`
      : '';
  const meta = [battery.modele, battery.chimie ? `· ${battery.chimie}` : ''].filter(Boolean).join(' ');

  return (
    <div className="battery-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <Link href={`/batterie/${encodeURIComponent(battery.serie)}`} className="battery-id" style={{ textDecoration: 'none' }}>
          🔋 {battery.serie}
        </Link>
        <button
          className="btn btn-sm"
          style={{ background: '#fee2e2', color: 'var(--red)', border: 'none', padding: '4px 9px', fontSize: 12, flexShrink: 0 }}
          onClick={(e) => { e.preventDefault(); onDelete(battery.serie); }}
        >
          🗑️
        </button>
      </div>
      <Link href={`/batterie/${encodeURIComponent(battery.serie)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="battery-meta">
          {meta}<br />{battery.vehicule}
          {dims && <><br /><span style={{ fontSize: 11 }}>{battery.poids ? `${battery.poids}kg · ` : ''}{dims}</span></>}
        </div>
        <div className="battery-stats">
          {decisionBadge(battery.last_decision)}
          {battery.last_soh != null && (
            <span className="badge badge-gray" style={{ style: sohColor(battery.last_soh) } as React.CSSProperties}>
              SOH {battery.last_soh}%
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 8 }}>
          {battery.intervention_count} intervention(s) · Dernière : {battery.last_date ?? '—'}
        </div>
      </Link>
    </div>
  );
}
