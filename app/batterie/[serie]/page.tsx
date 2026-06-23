import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBattery } from '@/lib/db';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import type { Intervention } from '@/lib/types';

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
  if (v >= 80) return 'var(--green)';
  if (v >= 60) return 'var(--orange)';
  return 'var(--red)';
}

export default async function BatteriePage({ params }: { params: Promise<{ serie: string }> }) {
  const { serie } = await params;
  const decodedSerie = decodeURIComponent(serie);

  let battery;
  try {
    battery = await getBattery(decodedSerie);
  } catch {
    return (
      <main className="page-content">
        <div className="alert alert-orange">⚠️ Base de données non configurée.</div>
      </main>
    );
  }

  if (!battery) notFound();

  const last: Partial<Intervention> = battery.interventions[0] ?? {};
  const dims = battery.longueur && battery.largeur && battery.hauteur
    ? `${battery.longueur} × ${battery.largeur} × ${battery.hauteur} mm`
    : null;

  return (
    <main className="page-content">
      <Link href="/parc" className="detail-back">← Retour au parc</Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue-dark)' }}>🔋 {battery.serie}</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
            {battery.modele}{battery.chimie ? ` · ${battery.chimie}` : ''} · Véhicule : {battery.vehicule}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>
            {battery.poids ? <><b>Poids :</b> {battery.poids} kg &nbsp;</> : null}
            {dims ? <><b>Dimensions :</b> {dims} &nbsp;</> : null}
            {battery.kwh ? <><b>Énergie :</b> {battery.kwh} kWh</> : null}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {decisionBadge(last.decision ?? null)}
          {last.soh != null && (
            <span className="badge badge-gray" style={{ color: sohColor(last.soh) }}>SOH {last.soh}%</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">⚡ Dernières mesures</div>
          <div className="card-body">
            <div className="metrics">
              <div className="metric">
                <div className="metric-val" style={{ color: sohColor(last.soh ?? null) }}>{last.soh ?? '—'}{last.soh != null ? '%' : ''}</div>
                <div className="metric-label">SOH</div>
              </div>
              <div className="metric">
                <div className="metric-val">{last.soc ?? '—'}{last.soc != null ? '%' : ''}</div>
                <div className="metric-label">SOC</div>
              </div>
              <div className="metric">
                <div className="metric-val">{last.tension ?? '—'}{last.tension != null ? 'V' : ''}</div>
                <div className="metric-label">Tension</div>
              </div>
              <div className="metric">
                <div className="metric-val">{last.temp ?? '—'}{last.temp != null ? '°C' : ''}</div>
                <div className="metric-label">Temp.</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
              Diag: {last.diag_possible ?? '—'} · Com: {last.com_possible ?? '—'} · Anomalie: {last.anomalie ?? '—'}
            </div>
            {last.decision?.includes('critique') && !last.decision?.includes('non critique') && (
              <div className="alert alert-red" style={{ marginTop: 10, fontSize: 12 }}>🔴 Quarantaine requise — Transport non autorisé en l&apos;état</div>
            )}
            {last.decision?.includes('non critique') && (
              <div className="alert alert-orange" style={{ marginTop: 10, fontSize: 12 }}>⚠️ Transport avec conditions renforcées</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">📱 QR Code</div>
          <div className="card-body">
            <QRCodeDisplay serie={battery.serie} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">📋 Historique des interventions ({battery.interventions.length})</div>
        <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
          {battery.interventions.length === 0 ? (
            <div className="empty"><p>Aucune intervention.</p></div>
          ) : (
            <table className="hist-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Technicien</th>
                  <th>Motif</th>
                  <th>SOH</th>
                  <th>Tension</th>
                  <th>État</th>
                  <th>Décision</th>
                </tr>
              </thead>
              <tbody>
                {battery.interventions.map((i) => (
                  <tr key={i.id}>
                    <td>{i.date}</td>
                    <td>{i.technicien}</td>
                    <td>{i.motif ?? '—'}</td>
                    <td style={{ color: sohColor(i.soh), fontWeight: 600 }}>{i.soh != null ? `${i.soh}%` : '—'}</td>
                    <td>{i.tension != null ? `${i.tension}V` : '—'}</td>
                    <td>{decisionBadge(i.decision)}</td>
                    <td style={{ fontSize: 11.5, maxWidth: 180 }}>{i.decision ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
