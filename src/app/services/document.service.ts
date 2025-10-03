import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Document, CreateDocumentRequest } from '../models/document.model';
import { environment } from '../environment';

export interface DocumentFilters {
  type_entite?: string;
  id_entite?: number;
  type_document?: string;
}

export interface DocumentStats {
  total: number;
  byEntityType: Record<string, number>;
  byDocumentType: Record<string, number>;
  totalSize: number;
  totalSizeMB: number;
}

export interface CleanupResult {
  deletedFiles: number;
  deletedSizeMB: number;
  orphanedFiles: string[];
}

export interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export interface EntityOption {
  id: number;
  label: string;
  type: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = `${environment.apiBaseUrl}/documents`;

  // Predefined entity types
  private readonly entityTypes = [
    'projet', 'action', 'indicateur', 'suivi_indicateur', 'suivi_budget', 'plan_annuel'
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get all documents.
   *
   * NOTE: filtering is now performed client-side. The method still accepts a
   * filters object for compatibility, but the HTTP request fetches all documents
   * and the returned ApiResponse.data will contain the filtered array.
   */
  getAll(filters?: DocumentFilters): Observable<ApiResponse<Document[]>> {
    // Always fetch full list from server, then apply frontend filtering
    return this.http.get<ApiResponse<Document[]>>(`${this.baseUrl}`).pipe(
      map(response => {
        // If server returned unsuccessful response, return as-is (no filtering)
        if (!response || !response.success) {
          return response;
        }

        const docs: Document[] = response.data || [];

        // If no filters provided, return original response
        if (!filters || (Object.keys(filters).length === 0)) {
          return { ...response, data: docs };
        }

        // Apply client-side filtering
        const filtered = docs.filter(doc => {
          // type_entite filter
          if (filters.type_entite !== undefined && filters.type_entite !== null && filters.type_entite !== '') {
            if (doc.type_entite !== filters.type_entite) return false;
          }

          // id_entite filter
          if (filters.id_entite !== undefined && filters.id_entite !== null && filters.id_entite !== 0) {
            // Allow numeric comparison: doc.id_entite may be number or string in some backends
            const docId = typeof doc.id_entite === 'string' ? parseInt(doc.id_entite, 10) : doc.id_entite;
            if (docId !== filters.id_entite) return false;
          }

          // type_document filter (new)
          if (filters.type_document !== undefined && filters.type_document !== null && filters.type_document !== '') {
            if (doc.type_document !== filters.type_document) return false;
          }

          return true;
        });

        return {
          ...response,
          data: filtered
        };
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Document>> {
    return this.http.get<ApiResponse<Document>>(`${this.baseUrl}/${id}`);
  }

  getByEntity(typeEntite: string, idEntite: number): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.baseUrl}/entity/${typeEntite}/${idEntite}`);
  }

  getStats(): Observable<ApiResponse<DocumentStats>> {
    return this.http.get<ApiResponse<DocumentStats>>(`${this.baseUrl}/stats`);
  }

  upload(
    file: File, 
    // include type_document so client can set it; backend normalizes and validates
    documentData: Omit<CreateDocumentRequest, 'chemin_fichier' | 'nom_original'>
  ): Observable<{ type: 'progress'; progress: UploadProgress } | { type: 'response'; response: ApiResponse<Document> }> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('id_entite', documentData.id_entite.toString());
    formData.append('type_entite', documentData.type_entite);
    // Send explicit type_document (backend will validate/normalize it and default to 'general' if missing)
    formData.append('type_document', (documentData.type_document || 'general').toString());

    return this.http.post<ApiResponse<Document>>(`${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<ApiResponse<Document>>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return {
              type: 'progress' as const,
              progress: {
                progress,
                loaded: event.loaded,
                total: event.total || 0
              }
            };
          case HttpEventType.Response:
            return {
              type: 'response' as const,
              response: event.body!
            };
          default:
            return {
              type: 'progress' as const,
              progress: { progress: 0, loaded: 0, total: 0 }
            };
        }
      })
    );
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  getFilePreview(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/preview`, {
      responseType: 'blob'
    });
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }

  cleanOrphanedFiles(): Observable<ApiResponse<CleanupResult>> {
    return this.http.post<ApiResponse<CleanupResult>>(`${this.baseUrl}/cleanup/orphaned`, {});
  }

  // Get entity options for different types
  getEntityOptions(entityType: string): Observable<EntityOption[]> {
    const baseUrl = environment.apiBaseUrl;
    
    switch (entityType) {
      case 'projet':
        return this.http.get<ApiResponse<any[]>>(`${baseUrl}/projets`).pipe(
          map(response => response.success ? response.data.map(item => ({
            id: item.id_projet,
            label: `${item.intitule} (${item.province})`,
            type: 'projet'
          })) : [])
        );
        
      case 'action':
        return this.http.get<ApiResponse<any[]>>(`${baseUrl}/actions`).pipe(
          map(response => response.success ? response.data.map(item => ({
            id: item.id_action,
            label: `${item.designation} - ${item.unite} (${item.type_volet})`,
            type: 'action'
          })) : [])
        );
        
      case 'indicateur':
        return this.http.get<ApiResponse<any[]>>(`${baseUrl}/indicateurs`).pipe(
          map(response => response.success ? response.data.map(item => ({
            id: item.id_indicateur,
            label: `${item.nom_indicateur} (${item.unite_mesure})`,
            type: 'indicateur'
          })) : [])
        );
        
      case 'suivi_indicateur':
        return this.http.get<ApiResponse<any[]>>(`${baseUrl}/suivi-indicateurs`).pipe(
          map(response => response.success ? response.data.map(item => ({
            id: item.id_suivi,
            label: `Mesure ${item.valeur_mesure} - ${new Date(item.date_mesure).toLocaleDateString('fr-FR')}`,
            type: 'suivi_indicateur'
          })) : [])
        );
        
      case 'suivi_budget':
        return this.http.get<ApiResponse<any[]>>(`${baseUrl}/budgets`).pipe(
          map(response => response.success ? response.data.map(item => ({
            id: item.id_budget,
            label: `${item.designation} - ${item.budget_prevu}€`,
            type: 'suivi_budget'
          })) : [])
        );
        
      case 'plan_annuel':
        return this.http.get<ApiResponse<any[]>>(`${baseUrl}/plans-annuels`).pipe(
          map(response => response.success ? response.data.map(item => ({
            id: item.id_plan,
            label: `Plan ${item.annee} - ${item.responsable}`,
            type: 'plan_annuel'
          })) : [])
        );
        
      default:
        return new Observable(observer => {
          observer.next([]);
          observer.complete();
        });
    }
  }

  // Get all entity options for the dropdown
  getAllEntityOptions(): Observable<{ [key: string]: EntityOption[] }> {
    const requests = this.entityTypes.map(type => 
      this.getEntityOptions(type).pipe(
        map(options => ({ [type]: options }))
      )
    );

    return forkJoin(requests).pipe(
      map(results => results.reduce((acc, curr) => ({ ...acc, ...curr }), {}))
    );
  }

  // Frontend-only methods for getting predefined types
  getEntityTypes(): string[] {
    return [...this.entityTypes];
  }

  // Helper methods for display names
  getEntityTypeDisplayName(entityType: string): string {
    const displayNames: Record<string, string> = {
      'projet': 'Projet',
      'action': 'Action',
      'indicateur': 'Indicateur',
      'suivi_indicateur': 'Suivi Indicateur',
      'suivi_budget': 'Suivi Budget',
      'plan_annuel': 'Plan Annuel'
    };
    return displayNames[entityType] || entityType;
  }

  getDocumentTypeDisplayName(documentType: string): string {
    const displayNames: Record<string, string> = {
      'general': 'Général',
      'rapport': 'Rapport',
      'contract': 'Contrat',
      'contrat': 'Contrat', // support older/alternate key
      'facture': 'Facture',
      'plan': 'Plan',
      'photo': 'Photo',
      'etude': 'Etude',
      // keep legacy entries to avoid breaking UI when DB contains other values
      'image': 'Image',
      'specification': 'Spécification',
      'autre': 'Autre'
    };
    return displayNames[documentType] || documentType;
  }

  // File validation helpers
  validateFile(file: File): { valid: boolean; error?: string } {
    // File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Fichier trop volumineux (maximum 10MB)' };
    }

    // File type validation
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Type de fichier non autorisé' };
    }

    return { valid: true };
  }

  // Check if file can be previewed
  canPreview(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    return previewableTypes.includes(extension || '');
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon based on file type
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const iconMap: Record<string, string> = {
      'pdf': 'document-text',
      'doc': 'document',
      'docx': 'document',
      'xls': 'table',
      'xlsx': 'table',
      'jpg': 'photograph',
      'jpeg': 'photograph',
      'png': 'photograph',
      'gif': 'photograph',
      'txt': 'document-text',
      'csv': 'table'
    };

    return iconMap[extension || ''] || 'document';
  }
}
