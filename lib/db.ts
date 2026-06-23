import { neon } from '@neondatabase/serverless';
import type { Battery, BatteryListItem, BatteryWithInterventions, DiagnosticFormData } from './types';

function getDb() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL ou DATABASE_URL manquant');
  return neon(url);
}

export async function setupSchema() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS batteries (
      serie VARCHAR(100) PRIMARY KEY,
      code VARCHAR(100),
      modele VARCHAR(200) NOT NULL,
      chimie VARCHAR(50),
      vehicule VARCHAR(200) NOT NULL,
      date_mep DATE,
      cap_nom NUMERIC(10,2),
      tension_nom NUMERIC(10,2),
      poids NUMERIC(10,2),
      longueur INTEGER,
      largeur INTEGER,
      hauteur INTEGER,
      kwh NUMERIC(10,2),
      modules INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS interventions (
      id BIGSERIAL PRIMARY KEY,
      serie VARCHAR(100) NOT NULL REFERENCES batteries(serie) ON DELETE CASCADE,
      date DATE NOT NULL,
      technicien VARCHAR(200) NOT NULL,
      site VARCHAR(200),
      detenteur VARCHAR(100),
      motif VARCHAR(100),
      km INTEGER,
      cycles INTEGER,
      pre_histo VARCHAR(3),
      pre_immerge VARCHAR(3),
      pre_accident VARCHAR(3),
      pre_brule VARCHAR(3),
      pre_brule_depose VARCHAR(3),
      pre_immerge_depose VARCHAR(3),
      pre_endommage_depose VARCHAR(3),
      vis_chaleur VARCHAR(3),
      vis_fumee VARCHAR(3),
      vis_odeur VARCHAR(3),
      vis_bruit VARCHAR(3),
      vis_incendie VARCHAR(3),
      vis_gonfle VARCHAR(3),
      vis_fuite_elec VARCHAR(3),
      vis_superficiel VARCHAR(3),
      vis_connect_tordus VARCHAR(3),
      vis_corrosion VARCHAR(3),
      vis_rayures VARCHAR(3),
      vis_autres VARCHAR(3),
      autres_signes TEXT,
      diag_possible VARCHAR(3),
      com_possible VARCHAR(3),
      anomalie VARCHAR(3),
      soh INTEGER,
      soc INTEGER,
      tension NUMERIC(10,2),
      resistance NUMERIC(10,3),
      temp NUMERIC(5,2),
      outil VARCHAR(200),
      secu_connect VARCHAR(20),
      secu_purge VARCHAR(20),
      secu_stockage VARCHAR(50),
      observations TEXT,
      decision VARCHAR(100) NOT NULL,
      prochaine DATE,
      responsable VARCHAR(200),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function listBatteries(): Promise<BatteryListItem[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT
      b.*,
      COUNT(i.id)::int AS intervention_count,
      MAX(i.date)::text AS last_date,
      (SELECT decision FROM interventions WHERE serie = b.serie ORDER BY created_at DESC LIMIT 1) AS last_decision,
      (SELECT soh FROM interventions WHERE serie = b.serie ORDER BY created_at DESC LIMIT 1) AS last_soh
    FROM batteries b
    LEFT JOIN interventions i ON i.serie = b.serie
    GROUP BY b.serie
    ORDER BY b.created_at DESC
  `;
  return rows as unknown as BatteryListItem[];
}

export async function getBattery(serie: string): Promise<BatteryWithInterventions | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM batteries WHERE serie = ${serie}`;
  const battery = rows[0] as unknown as Battery;
  if (!battery) return null;

  const interventions = await sql`
    SELECT * FROM interventions WHERE serie = ${serie} ORDER BY created_at DESC
  `;

  return { ...battery, interventions: interventions as unknown as BatteryWithInterventions['interventions'] };
}

export async function createBattery(data: DiagnosticFormData): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO batteries (serie, code, modele, chimie, vehicule, date_mep, cap_nom, tension_nom, poids, longueur, largeur, hauteur, kwh, modules)
    VALUES (
      ${data.serie},
      ${data.code || null},
      ${data.modele},
      ${data.chimie || null},
      ${data.vehicule},
      ${data.date_mep || null},
      ${data.cap_nom ? Number(data.cap_nom) : null},
      ${data.tension_nom ? Number(data.tension_nom) : null},
      ${data.poids ? Number(data.poids) : null},
      ${data.longueur ? Number(data.longueur) : null},
      ${data.largeur ? Number(data.largeur) : null},
      ${data.hauteur ? Number(data.hauteur) : null},
      ${data.kwh ? Number(data.kwh) : null},
      ${data.modules ? Number(data.modules) : null}
    )
    ON CONFLICT (serie) DO NOTHING
  `;
}

export async function addIntervention(data: DiagnosticFormData): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO interventions (
      serie, date, technicien, site, detenteur, motif, km, cycles,
      pre_histo, pre_immerge, pre_accident, pre_brule, pre_brule_depose, pre_immerge_depose, pre_endommage_depose,
      vis_chaleur, vis_fumee, vis_odeur, vis_bruit, vis_incendie, vis_gonfle, vis_fuite_elec,
      vis_superficiel, vis_connect_tordus, vis_corrosion, vis_rayures, vis_autres, autres_signes,
      diag_possible, com_possible, anomalie,
      soh, soc, tension, resistance, temp, outil,
      secu_connect, secu_purge, secu_stockage,
      observations, decision, prochaine, responsable
    ) VALUES (
      ${data.serie}, ${data.date}, ${data.technicien},
      ${data.site || null}, ${data.detenteur || null}, ${data.motif || null},
      ${data.km ? Number(data.km) : null}, ${data.cycles ? Number(data.cycles) : null},
      ${data.pre_histo || null}, ${data.pre_immerge || null}, ${data.pre_accident || null},
      ${data.pre_brule || null}, ${data.pre_brule_depose || null}, ${data.pre_immerge_depose || null},
      ${data.pre_endommage_depose || null},
      ${data.vis_chaleur || null}, ${data.vis_fumee || null}, ${data.vis_odeur || null},
      ${data.vis_bruit || null}, ${data.vis_incendie || null}, ${data.vis_gonfle || null},
      ${data.vis_fuite_elec || null},
      ${data.vis_superficiel || null}, ${data.vis_connect_tordus || null}, ${data.vis_corrosion || null},
      ${data.vis_rayures || null}, ${data.vis_autres || null}, ${data.autres_signes || null},
      ${data.diag_possible || null}, ${data.com_possible || null}, ${data.anomalie || null},
      ${data.soh ? Number(data.soh) : null}, ${data.soc ? Number(data.soc) : null},
      ${data.tension ? Number(data.tension) : null}, ${data.resistance ? Number(data.resistance) : null},
      ${data.temp ? Number(data.temp) : null}, ${data.outil || null},
      ${data.secu_connect || null}, ${data.secu_purge || null}, ${data.secu_stockage || null},
      ${data.observations || null}, ${data.decision},
      ${data.prochaine || null}, ${data.responsable || null}
    )
  `;
}

export async function deleteBattery(serie: string): Promise<boolean> {
  const sql = getDb();
  const rows = await sql`DELETE FROM batteries WHERE serie = ${serie} RETURNING serie`;
  return rows.length > 0;
}

export async function getStats() {
  const sql = getDb();

  const totals = await sql`
    SELECT
      COUNT(DISTINCT b.serie)::int AS batteries,
      COUNT(i.id)::int AS interventions,
      ROUND(AVG(i.soh))::int AS avg_soh
    FROM batteries b
    LEFT JOIN interventions i ON i.serie = b.serie
  `;

  const decisions = await sql`
    SELECT decision, COUNT(*)::int AS count
    FROM interventions
    WHERE decision IS NOT NULL
    GROUP BY decision
    ORDER BY count DESC
  `;

  const motifs = await sql`
    SELECT motif, COUNT(*)::int AS count
    FROM interventions
    WHERE motif IS NOT NULL
    GROUP BY motif
    ORDER BY count DESC
  `;

  return {
    totals: totals[0] as { batteries: number; interventions: number; avg_soh: number | null },
    decisions: decisions as { decision: string; count: number }[],
    motifs: motifs as { motif: string; count: number }[],
  };
}
