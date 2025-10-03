export interface PlanAnnuel {
  id_plan: number;
  intitule: string;
  id_projets: number[];
  annee: number;
  responsable?: number | null;
  echeance_debut: Date;
  echeance_fin: Date;
  observations?: string;
  // Joined fields returned by backend
  projets?: { id_projet: number; titre?: string }[];
  date_creation?: Date;
  created_by?: number | null;
  statut?: string;
}

export interface CreatePlanAnnuelRequest {
  intitule: string;
  id_projets: number[];
  annee: number;
  responsable?: number | null;
  echeance_debut: Date;
  echeance_fin: Date;
  observations?: string;
}
