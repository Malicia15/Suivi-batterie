import { getStats } from '@/lib/db';

function sohColor(v: number | null): string {
  if (!v) return '';
  if (v >= 80) return 'var(--green)';
  if (v >= 60) return 'var(--orange)';
  return 'var(--red)';
}

function Bar({ value, total, color }: { value: number; total: number; color: string }) {
  const width = total ? Math.round((value / total) * 140) : 0;
  return <div style={{ width, height: 14, background: color, borderRadius: 4, minWidth: value ? 6 : 0 }} />;
}

export default async function StatsPage() {
  let stats;
  try {
    stats = await getStats();
  } catch {
    return (
      <main className="page-content">
        <div className="card">
          <div className="card-header">📊 Tableau de bord</div>
          <div className="card-body">
            <div className="alert alert-orange">⚠️ Base de données non configurée. Visitez <code>/api/setup</code> pour initialiser le schéma.</div>
          </div>
        </div>
      </main>
    );
  }

  const { totals, decisions, motifs } = stats;
  const totalInterventions = totals?.interventions ?? 0;

  const critiques = decisions.filter(d => d.decision?.includes('critique') && !d.decision?.includes('non critique')).reduce((s, d) => s + d.count, 0);
  const nonCritiques = decisions.filter(d => d.decision?.includes('non critique')).reduce((s, d) => s + d.count, 0);
  const saines = decisions.filter(d => d.decision?.includes('Non endommagée')).reduce((s, d) => s + d.count, 0);

  if (!totals?.batteries) {
    return (
      <main className="page-content">
        <div className="card">
          <div className="card-header">📊 Tableau de bord</div>
          <div className="card-body">
            <div className="empty"><div className="empty-icon">📊</div><p>Enregistrez des diagnostics pour voir les statistiques.</p></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      <div className="card">
        <div className="card-header">📊 Tableau de bord</div>
        <div className="card-body">
          <div className="metrics" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            <div className="metric"><div className="metric-val">{totals.batteries}</div><div className="metric-label">Batteries</div></div>
            <div className="metric"><div className="metric-val">{totals.interventions}</div><div className="metric-label">Interventions</div></div>
            <div className="metric">
              <div className="metric-val" style={{ color: sohColor(totals.avg_soh) }}>{totals.avg_soh ?? '—'}{totals.avg_soh ? '%' : ''}</div>
              <div className="metric-label">SOH moyen</div>
            </div>
            <div className="metric"><div className="metric-val" style={{ color: 'var(--green)' }}>{saines}</div><div className="metric-label">Non endommagées</div></div>
            <div className="metric"><div className="metric-val" style={{ color: 'var(--orange)' }}>{nonCritiques}</div><div className="metric-label">Non critiques</div></div>
            <div className="metric"><div className="metric-val" style={{ color: 'var(--red)' }}>{critiques}</div><div className="metric-label">Critiques</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>
            <div>
              <div className="section-title">État pour le transport</div>
              {decisions.map((d) => (
                <div key={d.decision} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}>{d.decision?.split('—')[0] ?? '—'}</div>
                  <Bar value={d.count} total={totalInterventions} color="var(--blue-mid)" />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-dark)', width: 22, textAlign: 'right' }}>{d.count}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="section-title">Motifs d&apos;intervention</div>
              {motifs.map((m) => (
                <div key={m.motif} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}>{m.motif}</div>
                  <Bar value={m.count} total={totalInterventions} color="var(--accent)" />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-dark)', width: 22, textAlign: 'right' }}>{m.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
