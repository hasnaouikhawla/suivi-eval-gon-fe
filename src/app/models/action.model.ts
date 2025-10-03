export interface Action {
  id_action: number;
  id_projet: number;
  id_zone?: number;
  type_action: string;
  type_volet: string;
  quantite_prevue: number;
  quantite_realisee: number;
  unite_mesure: string;
  cout_unitaire?: number;
  cout_total_prevu?: number;
  cout_total_realise: number;
  date_debut?: Date | string;
  date_fin?: Date | string;
  statut: ActionStatus;
  date_creation: Date | string;
  responsable?: number;
  id_cadre?: number;
  observations?: string;
  // Joined fields returned by server
  projet_titre?: string;
  commune?: string;
  perimetre?: string;
  province?: string;
  pourcentage_realisation?: number;
}

export type ActionStatus = 'Planifiée' | 'En cours' | 'Terminée' | 'Suspendue';

export interface CreateActionRequest {
  id_projet: number;
  id_zone?: number;
  type_action: string;
  type_volet: string; // 'CES' | 'CEP'
  quantite_prevue: number;
  quantite_realisee?: number;
  unite_mesure: string;
  cout_unitaire?: number;
  cout_total_prevu?: number;
  cout_total_realise?: number;
  date_debut?: Date | string;
  date_fin?: Date | string;
  statut?: ActionStatus;
  id_cadre?: number;
  responsable?: number;
  observations?: string;
}
