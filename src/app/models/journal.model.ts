export interface JournalEntry {
  id_journal: number;
  id_utilisateur?: number | null;
  activite: string;
  cible: string;
  id_cible?: number | null;
  description?: string;
  date_activite: Date | string;
  ip_utilisateur?: string;
  navigateur?: string;
  // joined fields
  nom_utilisateur?: string;
  prenom_utilisateur?: string;
}

export interface ActivityStats {
  activite: string;
  cible: string;
  nombre_actions: number;
  utilisateurs_uniques: number;
  derniere_action: Date | string;
}

export interface UserActivityStats {
  date: Date | string;
  nombre_actions: number;
  cibles_differentes: number;
}