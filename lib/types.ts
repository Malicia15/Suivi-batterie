export interface Battery {
  serie: string;
  code: string | null;
  modele: string;
  chimie: string | null;
  vehicule: string;
  date_mep: string | null;
  cap_nom: number | null;
  tension_nom: number | null;
  poids: number | null;
  longueur: number | null;
  largeur: number | null;
  hauteur: number | null;
  kwh: number | null;
  modules: number | null;
  created_at: string;
}

export interface Intervention {
  id: number;
  serie: string;
  date: string;
  technicien: string;
  site: string | null;
  detenteur: string | null;
  motif: string | null;
  km: number | null;
  cycles: number | null;
  // Conditions préalables
  pre_histo: string | null;
  pre_immerge: string | null;
  pre_accident: string | null;
  pre_brule: string | null;
  pre_brule_depose: string | null;
  pre_immerge_depose: string | null;
  pre_endommage_depose: string | null;
  // Signes critiques
  vis_chaleur: string | null;
  vis_fumee: string | null;
  vis_odeur: string | null;
  vis_bruit: string | null;
  vis_incendie: string | null;
  vis_gonfle: string | null;
  vis_fuite_elec: string | null;
  // Signes non critiques
  vis_superficiel: string | null;
  vis_connect_tordus: string | null;
  vis_corrosion: string | null;
  vis_rayures: string | null;
  vis_autres: string | null;
  autres_signes: string | null;
  // Diagnostic
  diag_possible: string | null;
  com_possible: string | null;
  anomalie: string | null;
  soh: number | null;
  soc: number | null;
  tension: number | null;
  resistance: number | null;
  temp: number | null;
  outil: string | null;
  // Sécurité
  secu_connect: string | null;
  secu_purge: string | null;
  secu_stockage: string | null;
  // Conclusion
  observations: string | null;
  decision: string;
  prochaine: string | null;
  responsable: string | null;
  created_at: string;
}

export interface BatteryWithInterventions extends Battery {
  interventions: Intervention[];
}

export interface BatteryListItem extends Battery {
  last_date: string | null;
  last_decision: string | null;
  last_soh: number | null;
  intervention_count: number;
}

export interface DiagnosticFormData {
  // Identification
  serie: string;
  code: string;
  modele: string;
  chimie: string;
  vehicule: string;
  date_mep: string;
  cap_nom: string;
  tension_nom: string;
  poids: string;
  longueur: string;
  largeur: string;
  hauteur: string;
  kwh: string;
  modules: string;
  // Intervention
  date: string;
  technicien: string;
  km: string;
  cycles: string;
  site: string;
  detenteur: string;
  motif: string;
  // Conditions préalables
  pre_histo: string;
  pre_immerge: string;
  pre_accident: string;
  pre_brule: string;
  pre_brule_depose: string;
  pre_immerge_depose: string;
  pre_endommage_depose: string;
  // Signes critiques
  vis_chaleur: string;
  vis_fumee: string;
  vis_odeur: string;
  vis_bruit: string;
  vis_incendie: string;
  vis_gonfle: string;
  vis_fuite_elec: string;
  // Signes non critiques
  vis_superficiel: string;
  vis_connect_tordus: string;
  vis_corrosion: string;
  vis_rayures: string;
  vis_autres: string;
  autres_signes: string;
  // Diagnostic
  diag_possible: string;
  com_possible: string;
  anomalie: string;
  soh: string;
  soc: string;
  tension: string;
  resistance: string;
  temp: string;
  outil: string;
  // Sécurité
  secu_connect: string;
  secu_purge: string;
  secu_stockage: string;
  // Conclusion
  observations: string;
  decision: string;
  prochaine: string;
  responsable: string;
}
