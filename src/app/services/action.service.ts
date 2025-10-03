import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environment';
import { Action, CreateActionRequest, ActionStatus } from '../models/action.model';
import { AuthService } from './auth.service';

export interface actionFilters {
  type_volet?: 'CES' | 'CEP';
  statut?: ActionStatus;
  id_projet?: number;
  id_zone?: number;
  province?: string;
  type_action?: string;
}

export interface actionStats {
  total: number;
  par_statut: Record<ActionStatus, number>;
  par_type_volet: {
    CES: number;
    CEP: number;
  };
  par_type_action: Record<string, number>;
  cout_total_prevu: number;
  cout_total_realise: number;
  pourcentage_realisation_global: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProgressUpdateRequest {
  quantite_realisee: number;
  cout_total_realise?: number;
}

export interface BulkProgressUpdate {
  id_action: number;
  quantite_realisee: number;
  cout_total_realise?: number;
}

@Injectable({
  providedIn: 'root'
})
export class actionService {
  private baseUrl = `${environment.apiBaseUrl}/actions`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private filterActionsByUserZones(items: any[]): any[] {
    try {
      const currentUser = this.authService.getCurrentUser ? this.authService.getCurrentUser() : null;
      if (!currentUser) return items || [];

      const userProvinces: string[] = Array.isArray(currentUser.provinces)
        ? currentUser.provinces.map(String).map(s => s.trim()).filter(Boolean)
        : [];
      const userCommunes: string[] = Array.isArray(currentUser.communes)
        ? currentUser.communes.map(String).map(s => s.trim()).filter(Boolean)
        : [];

      // no region constraints => return original list
      if (userProvinces.length === 0 && userCommunes.length === 0) return items || [];

      const matchesRegion = (item: any): boolean => {
        if (!item) return false;
        const prov = String(item.province || item.province_name || item.province_origine || '').trim();
        const comm = String(item.commune || item.commune_name || item.commune_origine || '').trim();

        const provMatch = userProvinces.length === 0 ? false : (!!prov && userProvinces.includes(prov));
        const commMatch = userCommunes.length === 0 ? false : (!!comm && userCommunes.includes(comm));
        return provMatch || commMatch;
      };

      return (items || []).filter(matchesRegion);
    } catch (err) {
      console.warn('[actionService] filterActionsByUserZones failed', err);
      return items || [];
    }
  }

  getAll(filters?: actionFilters): Observable<ApiResponse<Action[]>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<Action[]>>(`${this.baseUrl}`, { params }).pipe(
      map(resp => {
        if (resp && resp.success && Array.isArray(resp.data)) {
          resp.data = this.filterActionsByUserZones(resp.data);
        }
        return resp;
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Action>> {
    return this.http.get<ApiResponse<Action>>(`${this.baseUrl}/${id}`);
  }

  create(action: CreateActionRequest): Observable<ApiResponse<Action>> {
    // Coerce numeric fields before send
    const body = {
      ...action,
      quantite_prevue: action.quantite_prevue !== undefined ? Number(action.quantite_prevue) : undefined,
      quantite_realisee: action.quantite_realisee !== undefined ? Number(action.quantite_realisee) : undefined,
      cout_unitaire: action.cout_unitaire !== undefined ? Number(action.cout_unitaire) : undefined,
      cout_total_prevu: action.cout_total_prevu !== undefined ? Number(action.cout_total_prevu) : undefined,
      cout_total_realise: action.cout_total_realise !== undefined ? Number(action.cout_total_realise) : undefined
    };
    return this.http.post<ApiResponse<Action>>(`${this.baseUrl}`, body);
  }

  update(id: number, action: Partial<CreateActionRequest>): Observable<ApiResponse<Action>> {
    // Coerce numeric fields before sending
    const body: any = { ...action };
    if (body.quantite_prevue !== undefined) body.quantite_prevue = Number(body.quantite_prevue);
    if (body.quantite_realisee !== undefined) body.quantite_realisee = Number(body.quantite_realisee);
    if (body.cout_unitaire !== undefined) body.cout_unitaire = Number(body.cout_unitaire);
    if (body.cout_total_prevu !== undefined) body.cout_total_prevu = Number(body.cout_total_prevu);
    if (body.cout_total_realise !== undefined) body.cout_total_realise = Number(body.cout_total_realise);
    return this.http.put<ApiResponse<Action>>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  updateProgress(id: number, progress: ProgressUpdateRequest): Observable<ApiResponse<any>> {
    // Coerce quantities to numbers
    const body: any = {
      quantite_realisee: Number(progress.quantite_realisee)
    };
    if (progress.cout_total_realise !== undefined) {
      body.cout_total_realise = Number(progress.cout_total_realise);
    }
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/progress`, body);
  }

  updateStatus(id: number, statut: ActionStatus): Observable<ApiResponse<Action>> {
    return this.http.patch<ApiResponse<Action>>(`${this.baseUrl}/${id}/status`, { statut });
  }

  bulkUpdateProgress(updates: BulkProgressUpdate[]): Observable<ApiResponse<any>> {
    // Ensure numbers
    const body = { updates: updates.map(u => ({
      id_action: u.id_action,
      quantite_realisee: Number(u.quantite_realisee),
      cout_total_realise: u.cout_total_realise !== undefined ? Number(u.cout_total_realise) : undefined
    }))};
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/bulk-progress`, body);
  }

  getStats(filters?: actionFilters): Observable<ApiResponse<actionStats>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    // Do not mutate aggregated server stats here; we only filter lists in list endpoints.
    return this.http.get<ApiResponse<actionStats>>(`${this.baseUrl}/stats`, { params });
  }

  getByprojet(idprojet: number): Observable<ApiResponse<Action[]>> {
    return this.http.get<ApiResponse<Action[]>>(`${this.baseUrl}/projet/${idprojet}`).pipe(
      map(resp => {
        if (resp && resp.success && Array.isArray(resp.data)) {
          resp.data = this.filterActionsByUserZones(resp.data);
        }
        return resp;
      })
    );
  }

  getByZone(idZone: number): Observable<ApiResponse<Action[]>> {
    return this.http.get<ApiResponse<Action[]>>(`${this.baseUrl}/zone/${idZone}`).pipe(
      map(resp => {
        if (resp && resp.success && Array.isArray(resp.data)) {
          resp.data = this.filterActionsByUserZones(resp.data);
        }
        return resp;
      })
    );
  }

  getByType(typeVolet: 'CES' | 'CEP'): Observable<ApiResponse<Action[]>> {
    return this.http.get<ApiResponse<Action[]>>(`${this.baseUrl}/type/${typeVolet}`).pipe(
      map(resp => {
        if (resp && resp.success && Array.isArray(resp.data)) {
          resp.data = this.filterActionsByUserZones(resp.data);
        }
        return resp;
      })
    );
  }
}
