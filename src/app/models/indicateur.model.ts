export interface Indicateur {
  id_indicateur: number;
  nom_indicateur: string;
  cadre_logique_id?: number;
  valeur_cible: number;
  valeur_realisee: number;
  statut: IndicateurStatus;
  source?: string;
  last_update?: Date | string;
  // Joined field
  cadre_logique_nom?: string;
}

export type IndicateurStatus = 'Atteint' | 'Modéré' | 'Retard';

export interface CreateIndicateurRequest {
  nom_indicateur: string;
  cadre_logique_id: number;
  valeur_cible: number;
  valeur_realisee?: number;
  statut?: IndicateurStatus;
  source?: string;
}
