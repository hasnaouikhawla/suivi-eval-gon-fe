import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SuiviIndicateur, CreateSuiviIndicateurRequest } from '../models/suivi-indicateur.model';
import { environment } from '../environment';

export interface SuiviIndicateurFilters {
  id_indicateur?: number;
  date_debut?: string;
  date_fin?: string;
  added_by?: number;
}

export interface TrendAnalysis {
  id_indicateur: number;
  trend_direction: 'up' | 'down' | 'stable';
  trend_percentage: number;
  current_value: number;
  previous_value: number;
  measurements_count: number;
  date_range: {
    start: Date;
    end: Date;
  };
}

export interface BulkAddResult {
  success: Array<{
    id_indicateur: number;
    id_suivi: number;
    valeur_mesure: number;
  }>;
  errors: Array<{
    measurement: CreateSuiviIndicateurRequest;
    error: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuiviIndicateurService {
  private baseUrl = `${environment.apiBaseUrl}/suivi-indicateurs`;

  constructor(private http: HttpClient) {}

  getAll(filters?: SuiviIndicateurFilters): Observable<ApiResponse<SuiviIndicateur[]>> {
    // Only send backend-supported filters (id_indicateur and added_by)
    let params = new HttpParams();
    
    if (filters?.id_indicateur) {
      params = params.set('id_indicateur', filters.id_indicateur.toString());
    }
    
    if (filters?.added_by) {
      params = params.set('added_by', filters.added_by.toString());
    }

    return this.http.get<ApiResponse<SuiviIndicateur[]>>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        if (response.success && response.data && filters) {
          // Apply client-side date filtering
          const filteredData = this.applyDateFilters(response.data, filters);
          return {
            ...response,
            data: filteredData
          };
        }
        return response;
      })
    );
  }

  private applyDateFilters(data: SuiviIndicateur[], filters: SuiviIndicateurFilters): SuiviIndicateur[] {
    let filteredData = [...data];

    // Apply date_debut filter (measurements on or after this date)
    if (filters.date_debut) {
      const startDate = new Date(filters.date_debut);
      startDate.setHours(0, 0, 0, 0); // Start of day
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date_mesure);
        itemDate.setHours(0, 0, 0, 0); // Start of day for comparison
        return itemDate >= startDate;
      });
    }

    // Apply date_fin filter (measurements on or before this date)
    if (filters.date_fin) {
      const endDate = new Date(filters.date_fin);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date_mesure);
        return itemDate <= endDate;
      });
    }

    console.log(`Date filtering applied: ${data.length} -> ${filteredData.length} items`);
    if (filters.date_debut || filters.date_fin) {
      console.log('Date filters:', {
        date_debut: filters.date_debut,
        date_fin: filters.date_fin,
        originalCount: data.length,
        filteredCount: filteredData.length
      });
    }

    return filteredData;
  }

  getById(id: number): Observable<ApiResponse<SuiviIndicateur>> {
    return this.http.get<ApiResponse<SuiviIndicateur>>(`${this.baseUrl}/${id}`);
  }

  getByIndicateur(idIndicateur: number, limit?: number, offset?: number): Observable<ApiResponse<SuiviIndicateur[]>> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (offset) params = params.set('offset', offset.toString());

    return this.http.get<ApiResponse<SuiviIndicateur[]>>(`${this.baseUrl}/indicateur/${idIndicateur}`, { params });
  }

  addMeasurement(measurement: CreateSuiviIndicateurRequest): Observable<ApiResponse<SuiviIndicateur>> {
    return this.http.post<ApiResponse<SuiviIndicateur>>(`${this.baseUrl}`, measurement);
  }

  updateMeasurement(id: number, measurement: Partial<CreateSuiviIndicateurRequest>): Observable<ApiResponse<SuiviIndicateur>> {
    return this.http.put<ApiResponse<SuiviIndicateur>>(`${this.baseUrl}/${id}`, measurement);
  }

  deleteMeasurement(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  getTrendAnalysis(idIndicateur: number, months: number = 12): Observable<ApiResponse<TrendAnalysis>> {
    let params = new HttpParams().set('months', months.toString());
    return this.http.get<ApiResponse<TrendAnalysis>>(`${this.baseUrl}/indicateur/${idIndicateur}/trend`, { params });
  }

  bulkAddMeasurements(measurements: CreateSuiviIndicateurRequest[]): Observable<ApiResponse<BulkAddResult>> {
    return this.http.post<ApiResponse<BulkAddResult>>(`${this.baseUrl}/bulk-add`, { measurements });
  }
}
