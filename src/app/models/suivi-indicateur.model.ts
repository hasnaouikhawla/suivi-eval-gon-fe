export interface SuiviIndicateur {
  id_suivi: number;
  id_indicateur: number;
  valeur_mesure: number;
  date_mesure: Date;
  added_by: number;
  observations?: string;
  // Joined fields
  added_by_name?: string;
}

export interface CreateSuiviIndicateurRequest {
  id_indicateur: number;
  valeur_mesure: number;
  date_mesure: Date;
  observations?: string;
}
