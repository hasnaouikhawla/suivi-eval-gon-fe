import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Indicateur, CreateIndicateurRequest, IndicateurStatus } from '../models/indicateur.model';
import { CadreLogique, CadreLogiqueNiveau } from '../models/cadre-logique.model';
import { environment } from '../environment';

export interface IndicateurFilters {
  statut?: IndicateurStatus;
  cadre_logique_id?: number | null; // use numeric id matching model
  source?: string;
}

export interface IndicateurStats {
  total: number;
  byStatus: { [key: string]: number };
  bySource: { [key: string]: number };
  averageProgress: number;
  totalTarget: number;
  totalAchieved: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProgressUpdateRequest {
  valeur_realisee: number;
}

@Injectable({
  providedIn: 'root'
})
export class IndicateurService {
  private baseUrl = `${environment.apiBaseUrl}/indicateurs`;
  private cadreLogiqueBaseUrl = `${environment.apiBaseUrl}/cadre-logique`;

  constructor(private http: HttpClient) {}

  /**
   * Build HttpParams excluding source (handled client-side)
   */
  private buildServerParams(filters?: IndicateurFilters): HttpParams {
    let params = new HttpParams();
    
    if (!filters) return params;

    // Only include server-supported filters; source is handled client-side
    if (filters.statut !== undefined && filters.statut !== null && String(filters.statut).trim() !== '') {
      params = params.set('statut', String(filters.statut));
    }
    if (filters.cadre_logique_id !== undefined && filters.cadre_logique_id !== null) {
      params = params.set('cadre_logique_id', String(filters.cadre_logique_id));
    }

    return params;
  }

  /**
   * Get all indicateurs with client-side source filtering
   */
  getAll(filters?: IndicateurFilters): Observable<ApiResponse<Indicateur[]>> {
    const params = this.buildServerParams(filters);

    return this.http.get<ApiResponse<Indicateur[]>>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        const originalData = Array.isArray(response.data) ? response.data : [];

        // Apply client-side source filtering if specified
        if (!filters?.source) {
          return { ...response, data: originalData };
        }

        const filteredData = originalData.filter(indicateur => {
          return indicateur.source === filters.source;
        });

        return {
          ...response,
          data: filteredData
        };
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Indicateur>> {
    return this.http.get<ApiResponse<Indicateur>>(`${this.baseUrl}/${id}`);
  }

  create(indicateur: CreateIndicateurRequest): Observable<ApiResponse<Indicateur>> {
    return this.http.post<ApiResponse<Indicateur>>(`${this.baseUrl}`, indicateur);
  }

  update(id: number, indicateur: Partial<CreateIndicateurRequest>): Observable<ApiResponse<Indicateur>> {
    return this.http.put<ApiResponse<Indicateur>>(`${this.baseUrl}/${id}`, indicateur);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  updateProgress(id: number, progress: ProgressUpdateRequest): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/progress`, progress);
  }

  /**
   * Get stats - excludes source filter since stats are computed server-side
   */
  getStats(filters?: IndicateurFilters): Observable<ApiResponse<IndicateurStats>> {
    const params = this.buildServerParams(filters);
    return this.http.get<ApiResponse<IndicateurStats>>(`${this.baseUrl}/stats`, { params });
  }

  getByCadreLogique(niveau?: CadreLogiqueNiveau): Observable<ApiResponse<CadreLogique[]>> {
    let params = new HttpParams();
    if (niveau) {
      params = params.set('niveau', niveau);
    }
    return this.http.get<ApiResponse<CadreLogique[]>>(`${this.baseUrl}/cadre-logique`, { params });
  }

  /**
   * Get all cadre logique for dropdown selection
   */
  getCadreLogiques(): Observable<ApiResponse<CadreLogique[]>> {
    return this.http.get<ApiResponse<CadreLogique[]>>(`${this.cadreLogiqueBaseUrl}`);
  }

  /**
   * Get filtered stats computed from client-side filtered data
   */
  getStatsFiltered(filters?: IndicateurFilters): Observable<ApiResponse<IndicateurStats>> {
    return this.getAll(filters).pipe(
      map(response => {
        const indicateurs = Array.isArray(response.data) ? response.data : [];
        
        const stats = indicateurs.reduce(
          (acc, indicateur) => {
            acc.total += 1;
            
            // Count by status
            const status = indicateur.statut || 'Unknown';
            acc.byStatus[status] = (acc.byStatus[status] || 0) + 1;
            
            // Count by source
            const source = indicateur.source || 'Unknown';
            acc.bySource[source] = (acc.bySource[source] || 0) + 1;
            
            // Progress calculations using model fields valeur_cible / valeur_realisee
            const target = Number(indicateur.valeur_cible || 0);
            const achieved = Number(indicateur.valeur_realisee || 0);
            
            acc.totalTarget += target;
            acc.totalAchieved += achieved;
            
            if (target > 0) {
              acc.progressSum += Math.min((achieved / target) * 100, 100);
              acc.progressCount += 1;
            }
            
            return acc;
          },
          {
            total: 0,
            byStatus: {} as { [key: string]: number },
            bySource: {} as { [key: string]: number },
            totalTarget: 0,
            totalAchieved: 0,
            progressSum: 0,
            progressCount: 0
          }
        );

        const finalStats: IndicateurStats = {
          total: stats.total,
          byStatus: stats.byStatus,
          bySource: stats.bySource,
          totalTarget: stats.totalTarget,
          totalAchieved: stats.totalAchieved,
          averageProgress: stats.progressCount > 0 
            ? Math.round(stats.progressSum / stats.progressCount) 
            : 0
        };

        return {
          success: true,
          data: finalStats
        };
      })
    );
  }
}
