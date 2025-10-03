export interface Rapport {
  id_rapport: number;
  periode: string;
  type_rapport: string;
  chemin_fichier: string;
  created_by: number;
  date_generation: Date;
  // Joined fields
  nom_utilisateur?: string;
  prenom_utilisateur?: string;
}

export interface CreateRapportRequest {
  periode: string;
  type_rapport: string;
  chemin_fichier: string;
}

export interface RapportStats {
  total: number;
  by_type: Record<string, number>;
  by_month: Record<string, number>;
  recent_generation: Array<{
    type: string;
    periode: string;
    date: Date;
    createur: string;
  }>;
}
