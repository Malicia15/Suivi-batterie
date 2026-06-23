'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import BatteryCard from '@/components/BatteryCard';
import type { BatteryListItem } from '@/lib/types';

export default function ParcPage() {
  const [batteries, setBatteries] = useState<BatteryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchBatteries = useCallback(async () => {
    try {
      const res = await fetch('/api/batteries');
      if (res.ok) setBatteries(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatteries(); }, [fetchBatteries]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/batteries/${encodeURIComponent(deleteTarget)}`, { method: 'DELETE' });
    if (res.ok) {
      setBatteries((b) => b.filter((x) => x.serie !== deleteTarget));
      showToast(`🗑️ Batterie ${deleteTarget} supprimée`);
    } else {
      showToast('❌ Erreur lors de la suppression', 'error');
    }
    setDeleteTarget(null);
  }

  return (
    <main className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue-dark)' }}>Parc Batteries</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)' }}>Cliquez sur une batterie pour voir son historique complet</div>
        </div>
        <Link href="/nouveau" className="btn btn-primary">＋ Nouveau diagnostic</Link>
      </div>

      {loading ? (
        <div className="empty"><div className="empty-icon">⏳</div><p>Chargement...</p></div>
      ) : batteries.length === 0 ? (
        <div className="empty"><div className="empty-icon">🔋</div><p>Aucune batterie enregistrée.<br />Créez un premier diagnostic !</p></div>
      ) : (
        <div className="battery-grid">
          {batteries.map((b) => (
            <BatteryCard key={b.serie} battery={b} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Modal suppression */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal-box">
            <div className="modal-icon">🗑️</div>
            <div className="modal-title">Supprimer la batterie ?</div>
            <div className="modal-desc">
              Vous allez supprimer <strong>{deleteTarget}</strong> et tout son historique d&apos;interventions.<br />
              Cette opération est <strong>irréversible</strong>.
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn btn-delete" onClick={confirmDelete}>🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: 'white', padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, zIndex: 999, maxWidth: 320, borderLeft: toast.type === 'success' ? '4px solid var(--green)' : '4px solid var(--red)' }}>
          {toast.msg}
        </div>
      )}
    </main>
  );
}
