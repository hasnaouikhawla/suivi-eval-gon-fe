export interface Document {
  id_document: number;
  id_entite: number;
  type_entite: string;
  type_document: string;
  chemin_fichier: string;
  nom_original: string;
  date_upload: Date;
  added_by: number;
  // Joined fields
  added_by_name?: string;
}

export interface CreateDocumentRequest {
  id_entite: number;
  type_entite: string;
  type_document: string;
  chemin_fichier: string;
  nom_original: string;
}