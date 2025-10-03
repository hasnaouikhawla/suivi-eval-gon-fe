export interface CadreLogique {
  id_cadre: number;
  intitule: string;
  niveau: CadreLogiqueNiveau;
  parent_id?: number | null;
  ordre?: number | null;
  observations?: string | null;
}

export type CadreLogiqueNiveau =
  | 'Objectif global'
  | 'Objectif spécifique'
  | 'Résultat'
  | 'Activité';

export interface CreateCadreLogiqueRequest {
  intitule: string;
  niveau: CadreLogiqueNiveau;
  parent_id?: number | null;
  ordre?: number | null;
  observations?: string | null;
}