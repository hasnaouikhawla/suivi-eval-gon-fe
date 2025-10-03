import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JournalEntry, ActivityStats, UserActivityStats } from '../models/journal.model';
import { environment } from '../environment';

export interface JournalFilters {
  activite?: string;
  cible?: string;
  id_utilisateur?: number;
  date_debut?: string;
  date_fin?: string;
  ip_utilisateur?: string;
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  q: string;
  activite?: string;
  cible?: string;
  id_utilisateur?: number;
  limit?: number;
}

export interface DashboardData {
  periode_jours: number;
  total_activites: number;
  moyenne_quotidienne: number;
  activite_quotidienne: Record<string, number>;
  top_projets: ActivityStats[];
  utilisateurs_actifs: any[];
  derniere_mise_a_jour: Date;
}

export interface SecurityEvents {
  periode_jours: number;
  total_evenements_securite: number;
  evenements_par_type: Record<string, number>;
  ips_suspectes: string[];
  evenements_recents: JournalEntry[];
  date_analyse: Date;
}

export interface ActivityReport {
  periode: {
    debut: Date;
    fin: Date;
  };
  resume: {
    total_activites: number;
    utilisateurs_actifs: number;
    types_activites: number;
  };
  statistiques_par_projet: ActivityStats[];
  utilisateurs_plus_actifs: any[];
  activites_recentes: JournalEntry[];
  date_generation: Date;
}

export interface ExportResult {
  fileName: string;
  fileSize: number;
  recordCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private baseUrl = `${environment.apiBaseUrl}/journal`;

  // Predefined projets and targets for filtering
  private readonly availableprojets = [
    'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 
    'LOGIN_FAILED', 'PASSWORD_CHANGE', 'EXPORT', 'MAINTENANCE'
  ];

  private readonly availableTargets = [
    'utilisateur', 'zone', 'projet', 'action', 'indicateur', 
    'suivi_indicateur', 'plan_annuel', 'suivi_budget', 'document', 
    'AUTH', 'JOURNAL'
  ];

  constructor(private http: HttpClient) {}

  getAll(filters?: JournalFilters): Observable<ApiResponse<JournalEntry[]>> {
    let params = new HttpParams();
    
    // Only send date and user filters to backend, handle activite/cible filtering in frontend
    const backendFilters: any = {};
    
    if (filters) {
      // Date filters
      if (filters.date_debut) {
        const startOfDay = new Date(filters.date_debut);
        startOfDay.setHours(0, 0, 0, 0);
        backendFilters.date_debut = startOfDay.toISOString();
      }
      
      if (filters.date_fin) {
        const endOfDay = new Date(filters.date_fin);
        endOfDay.setHours(23, 59, 59, 999);
        backendFilters.date_fin = endOfDay.toISOString();
      }

      // User filter
      if (filters.id_utilisateur) {
        backendFilters.id_utilisateur = filters.id_utilisateur;
      }

      // IP filter
      if (filters.ip_utilisateur) {
        backendFilters.ip_utilisateur = filters.ip_utilisateur;
      }

      // Pagination
      if (filters.limit) {
        backendFilters.limit = filters.limit;
      }
      if (filters.offset) {
        backendFilters.offset = filters.offset;
      }

      // Convert to HTTP params
      Object.entries(backendFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<JournalEntry[]>>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        if (response.success && response.data && filters) {
          // Apply frontend filtering for activite and cible
          let filteredData = response.data;

          if (filters.activite) {
            filteredData = filteredData.filter(entry => 
              (entry.activite || '').toLowerCase().includes(filters.activite!.toLowerCase())
            );
          }

          if (filters.cible) {
            filteredData = filteredData.filter(entry => 
              (entry.cible || '').toLowerCase().includes(filters.cible!.toLowerCase())
            );
          }

          return {
            ...response,
            data: filteredData
          };
        }
        return response;
      })
    );
  }

  getById(id: number): Observable<ApiResponse<JournalEntry>> {
    return this.http.get<ApiResponse<JournalEntry>>(`${this.baseUrl}/${id}`);
  }

  getUserActivity(userId: number, filters?: { limit?: number; activite?: string; cible?: string }): Observable<ApiResponse<JournalEntry[]>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<JournalEntry[]>>(`${this.baseUrl}/user/${userId}`, { params });
  }

  getEntityActivity(cible: string, idCible: number): Observable<ApiResponse<JournalEntry[]>> {
    return this.http.get<ApiResponse<JournalEntry[]>>(`${this.baseUrl}/entity/${cible}/${idCible}`);
  }

  getStats(filters?: { date_debut?: string; date_fin?: string; id_utilisateur?: number }): Observable<ApiResponse<ActivityStats[]>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<ActivityStats[]>>(`${this.baseUrl}/stats`, { params });
  }

  getDashboardData(days: number = 7): Observable<ApiResponse<DashboardData>> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ApiResponse<DashboardData>>(`${this.baseUrl}/dashboard`, { params });
  }

  getSecurityEvents(days: number = 30): Observable<ApiResponse<SecurityEvents>> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ApiResponse<SecurityEvents>>(`${this.baseUrl}/security-events`, { params });
  }

  getMostActiveUsers(limit: number = 10, days: number = 30): Observable<ApiResponse<any[]>> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('days', days.toString());
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/active-users`, { params });
  }

  searchActivities(searchFilters: SearchFilters): Observable<ApiResponse<JournalEntry[]>> {
    let params = new HttpParams();
    
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<JournalEntry[]>>(`${this.baseUrl}/search`, { params });
  }

  generateActivityReport(filters: {
    date_debut?: string;
    date_fin?: string;
    id_utilisateur?: number;
    projets?: string[];
  }): Observable<ApiResponse<ActivityReport>> {
    return this.http.post<ApiResponse<ActivityReport>>(`${this.baseUrl}/reports/activity`, filters);
  }

  exportJournalData(format: 'csv' | 'excel', filters: {
    date_debut?: string;
    date_fin?: string;
    projets?: string[];
  }): Observable<ApiResponse<ExportResult>> {
    return this.http.post<ApiResponse<ExportResult>>(`${this.baseUrl}/export`, {
      format,
      ...filters
    });
  }

  cleanOldEntries(retentionDays: number = 365): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/cleanup`, {
      retention_days: retentionDays
    });
  }

  // Frontend-only methods for getting predefined projets and targets
  getprojetsList(): Observable<ApiResponse<string[]>> {
    return new Observable(observer => {
      observer.next({
        success: true,
        data: this.availableprojets
      });
      observer.complete();
    });
  }

  getTargetsList(): Observable<ApiResponse<string[]>> {
    return new Observable(observer => {
      observer.next({
        success: true,
        data: this.availableTargets
      });
      observer.complete();
    });
  }
}
