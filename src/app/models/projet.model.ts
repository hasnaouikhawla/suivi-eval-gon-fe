export interface Projet {
  id_projet: number;
  n_marche: string;
  titre: string;
  entreprise: string;
  id_zone: number;
  date_debut?: Date | string;
  date_fin?: Date | string;
  statut: ProjetStatus;
  id_cadre?: number | null;
  date_creation?: Date | string;
  responsable?: number | null;
  observations?: string;
  // Joined fields returned by backend
  commune?: string;
  perimetre?: string;
  province?: string;
  responsable_name?: string;
  cadre_logique_nom?: string;
}

export type ProjetStatus = 'Planifié' | 'En cours' | 'Terminé' | 'Suspendu';





export interface CreateProjetRequest {
  n_marche: string;
  entreprise: string;

  titre: string;
  id_zone: number;
  date_debut: Date | string;
  date_fin: Date | string;
  statut?: ProjetStatus;
  id_cadre?: number;
  responsable?: number;
  observations?: string;
}