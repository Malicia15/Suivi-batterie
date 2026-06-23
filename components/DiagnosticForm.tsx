'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { DiagnosticFormData } from '@/lib/types';

const today = new Date().toISOString().split('T')[0];

const EMPTY_FORM: DiagnosticFormData = {
  serie: '', code: '', modele: '', chimie: '', vehicule: '',
  date_mep: '', cap_nom: '', tension_nom: '', poids: '', longueur: '', largeur: '', hauteur: '', kwh: '', modules: '',
  date: today, technicien: '', km: '', cycles: '', site: '', detenteur: '', motif: '',
  pre_histo: '', pre_immerge: '', pre_accident: '', pre_brule: '', pre_brule_depose: '', pre_immerge_depose: '', pre_endommage_depose: '',
  vis_chaleur: '', vis_fumee: '', vis_odeur: '', vis_bruit: '', vis_incendie: '', vis_gonfle: '', vis_fuite_elec: '',
  vis_superficiel: '', vis_connect_tordus: '', vis_corrosion: '', vis_rayures: '', vis_autres: '', autres_signes: '',
  diag_possible: '', com_possible: '', anomalie: '',
  soh: '', soc: '', tension: '', resistance: '', temp: '', outil: '',
  secu_connect: '', secu_purge: '', secu_stockage: '',
  observations: '', decision: '', prochaine: '', responsable: '',
};

const SIGNES_CRITIQUES = ['vis_chaleur', 'vis_fumee', 'vis_odeur', 'vis_bruit', 'vis_incendie', 'vis_gonfle', 'vis_fuite_elec'] as const;
const SIGNES_NON_CRITIQUES = ['vis_superficiel', 'vis_connect_tordus', 'vis_corrosion', 'vis_rayures', 'vis_autres'] as const;

type FormKey = keyof DiagnosticFormData;

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const show = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };
  return { toast, show };
}

function RadioChips({ name, options, value, onChange }: { name: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="chip-group">
      {options.map((opt) => (
        <label key={opt.value} style={{ padding: '5px 12px', border: `1.5px solid ${value === opt.value ? 'var(--blue-mid)' : 'var(--border)'}`, borderRadius: 20, fontSize: 12.5, fontWeight: value === opt.value ? 600 : 500, cursor: 'pointer', color: value === opt.value ? 'var(--blue-dark)' : 'var(--text-light)', background: value === opt.value ? 'var(--blue-light)' : 'white', transition: 'all .15s' }}>
          <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} style={{ display: 'none' }} />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function OuiNonRow({ label, fieldName, value, onChange, isCritical }: { label: string | React.ReactNode; fieldName: string; value: string; onChange: (v: string) => void; isCritical?: boolean }) {
  const ouiStyle: React.CSSProperties = value === 'OUI' ? { background: '#fee2e2', borderColor: 'var(--red)', color: 'var(--red)' } : {};
  const nonStyle: React.CSSProperties = value === 'NON' ? { background: 'var(--green-bg)', borderColor: 'var(--green)', color: 'var(--green)' } : {};
  return (
    <tr>
      <td style={isCritical ? { background: '#fef9c3' } : {}}>{label}</td>
      <td style={{ textAlign: 'center' }}>
        <label style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 14, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--border)', color: 'var(--text-light)', transition: 'all .15s', ...ouiStyle }}>
          <input type="radio" name={fieldName} value="OUI" checked={value === 'OUI'} onChange={() => onChange('OUI')} style={{ display: 'none' }} />
          OUI
        </label>
      </td>
      <td style={{ textAlign: 'center' }}>
        <label style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 14, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid var(--border)', color: 'var(--text-light)', transition: 'all .15s', ...nonStyle }}>
          <input type="radio" name={fieldName} value="NON" checked={value === 'NON'} onChange={() => onChange('NON')} style={{ display: 'none' }} />
          NON
        </label>
      </td>
    </tr>
  );
}

export default function DiagnosticForm() {
  const router = useRouter();
  const { toast, show } = useToast();
  const [form, setForm] = useState<DiagnosticFormData>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);

  const set = (key: FormKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const setRadio = (key: FormKey) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  // Auto-évaluation basée sur les signes critiques et non critiques
  useEffect(() => {
    const critique = SIGNES_CRITIQUES.some((k) => form[k] === 'OUI');
    const nonCritique = !critique && SIGNES_NON_CRITIQUES.some((k) => form[k] === 'OUI');
    const allAnswered =
      SIGNES_CRITIQUES.every((k) => form[k] !== '') &&
      SIGNES_NON_CRITIQUES.every((k) => form[k] !== '');

    if (!allAnswered) return;

    if (critique) {
      setForm((f) => ({ ...f, decision: 'Endommagée critique — Quarantaine / Recyclage direct' }));
    } else if (nonCritique) {
      setForm((f) => ({ ...f, decision: 'Endommagée non critique — Transport renforcé' }));
    } else {
      setForm((f) => ({ ...f, decision: 'Non endommagée — Seconde vie / Recyclage' }));
    }
  }, [
    form.vis_chaleur, form.vis_fumee, form.vis_odeur, form.vis_bruit, form.vis_incendie, form.vis_gonfle, form.vis_fuite_elec,
    form.vis_superficiel, form.vis_connect_tordus, form.vis_corrosion, form.vis_rayures, form.vis_autres,
  ]);

  const critique = SIGNES_CRITIQUES.some((k) => form[k] === 'OUI');
  const nonCritique = !critique && SIGNES_NON_CRITIQUES.some((k) => form[k] === 'OUI');
  const allSigned = SIGNES_CRITIQUES.every((k) => form[k] !== '') && SIGNES_NON_CRITIQUES.every((k) => form[k] !== '');
  const saine = allSigned && !critique && !nonCritique;

  async function handleSubmit() {
    if (!form.serie.trim() || !form.modele.trim() || !form.vehicule.trim() || !form.date.trim() || !form.technicien.trim() || !form.decision.trim()) {
      show('⚠️ Remplissez les champs obligatoires (*)', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/batteries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        show('❌ ' + (err.error ?? 'Erreur serveur'), 'error');
        return;
      }
      show('✅ Diagnostic enregistré — ' + form.serie);
      setForm({ ...EMPTY_FORM, date: today });
      router.push('/parc');
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div className="field">
      <label>{label}{required && <span className="required-star"> *</span>}</label>
      {children}
    </div>
  );

  return (
    <>
      {/* TOAST */}
      {toast && (
        <div id="toast" className={`show ${toast.type}`} style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: 'white', padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, zIndex: 999, maxWidth: 320, borderLeft: toast.type === 'success' ? '4px solid var(--green)' : '4px solid var(--red)' }}>
          {toast.msg}
        </div>
      )}

      <div className="card">
        <div className="card-header">⚡ Fiche de diagnostic — Batterie de traction VE</div>
        <div className="card-body">

          {/* ── SECTION 1 : IDENTIFICATION ── */}
          <div className="card-section">
            <div className="section-title">1. Identification de la batterie</div>
            <div className="field-grid">
              <Field label="N° de série" required>
                <input value={form.serie} onChange={set('serie')} placeholder="ex: BAT-2024-00123" />
              </Field>
              <Field label="N° interne / code parc">
                <input value={form.code} onChange={set('code')} placeholder="ex: VE-045" />
              </Field>
              <Field label="Marque / Modèle batterie" required>
                <input value={form.modele} onChange={set('modele')} placeholder="ex: CATL LFP-200" />
              </Field>
              <Field label="Type de chimie">
                <select value={form.chimie} onChange={set('chimie')}>
                  <option value="">— Sélectionner —</option>
                  <option>Li-ion NMC</option>
                  <option>Li-ion LFP</option>
                  <option>Li-ion NCA</option>
                  <option>NiMH</option>
                  <option>Autre</option>
                </select>
              </Field>
              <Field label="Véhicule d'origine" required>
                <input value={form.vehicule} onChange={set('vehicule')} placeholder="Immat. ou N° série VIN" />
              </Field>
              <Field label="1ère mise en service">
                <input type="date" value={form.date_mep} onChange={set('date_mep')} />
              </Field>
              <Field label="Capacité nominale (Ah)">
                <input type="number" value={form.cap_nom} onChange={set('cap_nom')} placeholder="ex: 200" />
              </Field>
              <Field label="Tension nominale (V)">
                <input type="number" step="0.1" value={form.tension_nom} onChange={set('tension_nom')} placeholder="ex: 400" />
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="section-title">Poids &amp; Dimensions du pack</div>
              <div className="field-grid-3">
                <Field label="Poids (kg)"><input type="number" step="0.1" value={form.poids} onChange={set('poids')} placeholder="kg" /></Field>
                <Field label="Longueur (mm)"><input type="number" value={form.longueur} onChange={set('longueur')} placeholder="mm" /></Field>
                <Field label="Largeur (mm)"><input type="number" value={form.largeur} onChange={set('largeur')} placeholder="mm" /></Field>
                <Field label="Hauteur (mm)"><input type="number" value={form.hauteur} onChange={set('hauteur')} placeholder="mm" /></Field>
                <Field label="Énergie totale (kWh)"><input type="number" step="0.1" value={form.kwh} onChange={set('kwh')} placeholder="kWh" /></Field>
                <Field label="Nb. de modules"><input type="number" value={form.modules} onChange={set('modules')} placeholder="nb" /></Field>
              </div>
            </div>
          </div>

          {/* ── SECTION 2 : INTERVENTION ── */}
          <div className="card-section">
            <div className="section-title">2. Informations d&apos;intervention</div>
            <div className="field-grid">
              <Field label="Date d'intervention" required>
                <input type="date" value={form.date} onChange={set('date')} />
              </Field>
              <Field label="Technicien habilité" required>
                <input value={form.technicien} onChange={set('technicien')} placeholder="Prénom NOM" />
              </Field>
              <Field label="Kilométrage véhicule">
                <input type="number" value={form.km} onChange={set('km')} placeholder="km" />
              </Field>
              <Field label="Nb. cycles batterie">
                <input type="number" value={form.cycles} onChange={set('cycles')} placeholder="cycles" />
              </Field>
              <Field label="Établissement / Site">
                <input value={form.site} onChange={set('site')} placeholder="Nom du centre" />
              </Field>
              <Field label="Type de détenteur">
                <select value={form.detenteur} onChange={set('detenteur')}>
                  <option value="">— Sélectionner —</option>
                  <option>Centre VHU</option>
                  <option>Concessionnaire agréé</option>
                  <option>Réparateur indépendant</option>
                  <option>Autre</option>
                </select>
              </Field>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-light)', marginBottom: 6 }}>Motif d&apos;intervention</div>
              <RadioChips name="motif" value={form.motif} onChange={setRadio('motif')} options={[
                { value: 'Fin de vie VHU', label: 'Fin de vie VHU' },
                { value: 'Panne / défaut', label: 'Panne / défaut' },
                { value: 'Maintenance préventive', label: 'Maintenance préventive' },
                { value: 'Remplacement', label: 'Remplacement' },
                { value: 'Autre', label: 'Autre' },
              ]} />
            </div>
          </div>

          {/* ── SECTION 3 : CONDITIONS PRÉALABLES ── */}
          <div className="card-section">
            <div className="section-title">3. Conditions préalables — Historique &amp; événements</div>
            <div className="alert alert-blue">📋 Ces informations sont requises par la réglementation ADR pour le transport des déchets de batteries VEH.</div>
            <table className="ouinon-table" style={{ marginTop: 12 }}>
              <thead><tr><th>Information</th><th>OUI</th><th>NON</th></tr></thead>
              <tbody>
                <OuiNonRow label="Présence de l'historique de la batterie" fieldName="pre_histo" value={form.pre_histo} onChange={setRadio('pre_histo')} />
                <OuiNonRow label="Batterie issue d'un véhicule qui a été immergé" fieldName="pre_immerge" value={form.pre_immerge} onChange={setRadio('pre_immerge')} />
                <OuiNonRow label="Batterie issue d'un véhicule qui a été accidenté" fieldName="pre_accident" value={form.pre_accident} onChange={setRadio('pre_accident')} />
                <OuiNonRow label="Batterie issue d'un véhicule qui a été brûlé" fieldName="pre_brule" value={form.pre_brule} onChange={setRadio('pre_brule')} />
                <OuiNonRow label={<>Batterie qui a brûlé <strong>LORS</strong> ou <strong>APRÈS</strong> sa dépose</>} fieldName="pre_brule_depose" value={form.pre_brule_depose} onChange={setRadio('pre_brule_depose')} />
                <OuiNonRow label={<>Batterie immergée / noyée <strong>APRÈS</strong> sa dépose</>} fieldName="pre_immerge_depose" value={form.pre_immerge_depose} onChange={setRadio('pre_immerge_depose')} />
                <OuiNonRow label={<>Batterie endommagée <strong>LORS</strong> ou <strong>APRÈS</strong> sa dépose</>} fieldName="pre_endommage_depose" value={form.pre_endommage_depose} onChange={setRadio('pre_endommage_depose')} />
              </tbody>
            </table>
          </div>

          {/* ── SECTION 4 : SIGNES CRITIQUES ── */}
          <div className="card-section">
            <div className="section-title">4. Inspection visuelle — Signes critiques</div>
            <div className="alert alert-red">⚠️ Si <strong>OUI</strong> à l&apos;un de ces signes → batterie <strong>ENDOMMAGÉE CRITIQUE</strong> — mise en quarantaine obligatoire avant transport.</div>
            <table className="ouinon-table critical" style={{ marginTop: 12 }}>
              <thead><tr><th>Signe extérieur critique</th><th>OUI</th><th>NON</th></tr></thead>
              <tbody>
                <OuiNonRow label="Dégagement de chaleur" fieldName="vis_chaleur" value={form.vis_chaleur} onChange={setRadio('vis_chaleur')} isCritical />
                <OuiNonRow label="Dégagement de fumée" fieldName="vis_fumee" value={form.vis_fumee} onChange={setRadio('vis_fumee')} isCritical />
                <OuiNonRow label="Dégagement d'odeur" fieldName="vis_odeur" value={form.vis_odeur} onChange={setRadio('vis_odeur')} isCritical />
                <OuiNonRow label="Bruit / Sifflement" fieldName="vis_bruit" value={form.vis_bruit} onChange={setRadio('vis_bruit')} isCritical />
                <OuiNonRow label="Traces d'incendie" fieldName="vis_incendie" value={form.vis_incendie} onChange={setRadio('vis_incendie')} isCritical />
                <OuiNonRow label="Boîtier gonflé / déformé / fissuré (altération structurelle)" fieldName="vis_gonfle" value={form.vis_gonfle} onChange={setRadio('vis_gonfle')} isCritical />
                <OuiNonRow label="Fuite d'électrolyte" fieldName="vis_fuite_elec" value={form.vis_fuite_elec} onChange={setRadio('vis_fuite_elec')} isCritical />
              </tbody>
            </table>
          </div>

          {/* ── SECTION 5 : SIGNES NON CRITIQUES ── */}
          <div className="card-section">
            <div className="section-title">5. Inspection visuelle — Signes non critiques</div>
            <div className="alert alert-orange">⚠️ Si <strong>OUI</strong> à l&apos;un de ces signes → batterie <strong>ENDOMMAGÉE NON CRITIQUE</strong> — conditions de transport renforcées.</div>
            <table className="ouinon-table" style={{ marginTop: 12 }}>
              <thead><tr><th>Signe extérieur</th><th>OUI</th><th>NON</th></tr></thead>
              <tbody>
                <OuiNonRow label="Endommagement superficiel du boîtier" fieldName="vis_superficiel" value={form.vis_superficiel} onChange={setRadio('vis_superficiel')} />
                <OuiNonRow label="Connecteurs tordus mais intacts" fieldName="vis_connect_tordus" value={form.vis_connect_tordus} onChange={setRadio('vis_connect_tordus')} />
                <OuiNonRow label="Présence de corrosion sur le boîtier" fieldName="vis_corrosion" value={form.vis_corrosion} onChange={setRadio('vis_corrosion')} />
                <OuiNonRow label="Présence de rayures profondes sur le boîtier" fieldName="vis_rayures" value={form.vis_rayures} onChange={setRadio('vis_rayures')} />
                <OuiNonRow label="Autres signes à signaler" fieldName="vis_autres" value={form.vis_autres} onChange={setRadio('vis_autres')} />
              </tbody>
            </table>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Précision (autres signes / observations visuelles)</label>
              <input value={form.autres_signes} onChange={set('autres_signes')} placeholder="Décrivez tout signe visuel particulier..." />
            </div>
          </div>

          {/* ── SECTION 6 : DIAGNOSTIC ÉLECTRIQUE ── */}
          <div className="card-section">
            <div className="section-title">6. Diagnostic électrique — Si possible</div>
            <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
              {[
                { key: 'diag_possible' as FormKey, label: 'Diagnostic batterie / module possible' },
                { key: 'com_possible' as FormKey, label: 'Communication avec batterie / module possible' },
                { key: 'anomalie' as FormKey, label: "Présence d'anomalie(s) détectée(s)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-light)', marginBottom: 6 }}>{label}</div>
                  <RadioChips name={key} value={form[key] as string} onChange={setRadio(key)} options={[
                    { value: 'OUI', label: '✅ OUI' },
                    { value: 'NON', label: '❌ NON' },
                  ]} />
                </div>
              ))}
            </div>
            <div className="field-grid">
              <Field label="SOH — State of Health (%)"><input type="number" min="0" max="100" value={form.soh} onChange={set('soh')} placeholder="%" /></Field>
              <Field label="SOC — State of Charge (%)"><input type="number" min="0" max="100" value={form.soc} onChange={set('soc')} placeholder="%" /></Field>
              <Field label="Tension à vide mesurée (V)"><input type="number" step="0.1" value={form.tension} onChange={set('tension')} placeholder="V" /></Field>
              <Field label="Résistance interne (mΩ)"><input type="number" step="0.01" value={form.resistance} onChange={set('resistance')} placeholder="mΩ" /></Field>
              <Field label="Température (°C)"><input type="number" step="0.1" value={form.temp} onChange={set('temp')} placeholder="°C" /></Field>
              <Field label="Outil de diagnostic"><input value={form.outil} onChange={set('outil')} placeholder="ex: Midtronics, BT-521..." /></Field>
            </div>
          </div>

          {/* ── SECTION 7 : MISE EN SÉCURITÉ ── */}
          <div className="card-section">
            <div className="section-title">7. Mise en sécurité</div>
            <div className="alert alert-blue">🔒 Le technicien habilité doit s&apos;assurer de la sécurisation avant tout transport (accord ADR).</div>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-light)', marginBottom: 6 }}>Protection des connectiques (IP2X ou IPXXB / capuchons isolants)</div>
                <RadioChips name="secu_connect" value={form.secu_connect} onChange={setRadio('secu_connect')} options={[
                  { value: 'Effectuée', label: '✅ Effectuée' },
                  { value: 'Non effectuée', label: '❌ Non effectuée' },
                  { value: 'N/A', label: 'N/A' },
                ]} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-light)', marginBottom: 6 }}>Purge &amp; fermeture étanche des sorties de fluide (liquide de refroidissement)</div>
                <RadioChips name="secu_purge" value={form.secu_purge} onChange={setRadio('secu_purge')} options={[
                  { value: 'Effectuée', label: '✅ Effectuée' },
                  { value: 'Non effectuée', label: '❌ Non effectuée' },
                  { value: 'N/A', label: 'N/A' },
                ]} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-light)', marginBottom: 6 }}>Mode de stockage / conditionnement</div>
                <RadioChips name="secu_stockage" value={form.secu_stockage} onChange={setRadio('secu_stockage')} options={[
                  { value: 'Bac sable', label: 'Bac à sable' },
                  { value: 'Conteneur ignifugé', label: 'Conteneur ignifugé' },
                  { value: 'Palette filmée', label: 'Palette filmée' },
                  { value: 'Autre', label: 'Autre' },
                ]} />
              </div>
            </div>
          </div>

          {/* ── SECTION 8 : CONCLUSION ── */}
          <div className="card-section">
            <div className="section-title">8. Observations &amp; Conclusion</div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Observations du technicien</label>
              <textarea value={form.observations} onChange={set('observations')} rows={3} placeholder="Anomalies détectées, contexte d'intervention, remarques particulières..." />
            </div>

            {/* Conclusion automatique */}
            {critique && (
              <div className="conclusion-box conclusion-critique" style={{ marginBottom: 14 }}>
                <div className="conclusion-title" style={{ color: 'var(--red)' }}>🔴 BATTERIE ENDOMMAGÉE CRITIQUE</div>
                <div className="conclusion-desc">Mise en quarantaine obligatoire jusqu&apos;à disparition des signes. Transport non autorisé en l&apos;état.</div>
              </div>
            )}
            {nonCritique && (
              <div className="conclusion-box conclusion-non-critique" style={{ marginBottom: 14 }}>
                <div className="conclusion-title" style={{ color: 'var(--orange)' }}>⚠️ BATTERIE ENDOMMAGÉE NON CRITIQUE</div>
                <div className="conclusion-desc">Transport possible avec conditions renforcées.</div>
              </div>
            )}
            {saine && (
              <div className="conclusion-box conclusion-saine" style={{ marginBottom: 14 }}>
                <div className="conclusion-title" style={{ color: 'var(--green)' }}>✅ BATTERIE NON ENDOMMAGÉE</div>
                <div className="conclusion-desc">Transport standard possible. Orientation : seconde vie ou recyclage.</div>
              </div>
            )}

            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-light)', marginBottom: 8 }}>Décision finale <span className="required-star">*</span></div>
            <RadioChips name="decision" value={form.decision} onChange={setRadio('decision')} options={[
              { value: 'Non endommagée — Seconde vie / Recyclage', label: '✅ Non endommagée' },
              { value: 'Endommagée non critique — Transport renforcé', label: '⚠️ Endommagée non critique' },
              { value: 'Endommagée critique — Quarantaine / Recyclage direct', label: '🔴 Endommagée critique' },
            ]} />

            <div className="field-grid" style={{ marginTop: 16 }}>
              <Field label="Prochaine révision prévue"><input type="date" value={form.prochaine} onChange={set('prochaine')} /></Field>
              <Field label="Responsable validant"><input value={form.responsable} onChange={set('responsable')} placeholder="Prénom NOM" /></Field>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? '⏳ Enregistrement...' : '💾 Enregistrer le diagnostic'}
            </button>
            <button className="btn btn-outline" onClick={() => setForm({ ...EMPTY_FORM, date: today })}>
              ↺ Réinitialiser
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
