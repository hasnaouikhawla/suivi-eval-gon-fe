import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanAnnuel, CreatePlanAnnuelRequest } from '../models/plan-annuel.model';
import { environment } from '../environment';

export interface PlanAnnuelFilters {
  id_projet?: number;
  annee?: number;
  responsable?: number;
  statut?: string; // added to match backend query handling (controller accepts 'statut')
}

export interface PlanAnnuelStats {
  total_projets: number;
  projets_terminees: number;
  taux_execution: number;
  budget_total?: number;
  budget_utilise?: number;
}

export interface ExecutionSummary {
  plan: PlanAnnuel;
  total_projets: number;
  projets_planifiees: number;
  projets_en_cours: number;
  projets_terminees: number;
  projets_suspendues: number;
  budget_prevu: number;
  budget_engage: number;
  budget_execute: number;
  taux_execution_financier: number;
  taux_execution_physique: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanAnnuelService {
  private baseUrl = `${environment.apiBaseUrl}/plans-annuels`;

  constructor(private http: HttpClient) {}

  getAll(filters?: PlanAnnuelFilters): Observable<ApiResponse<PlanAnnuel[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.id_projet !== undefined && filters.id_projet !== null) {
        params = params.set('id_projet', String(filters.id_projet));
      }
      if (filters.annee !== undefined && filters.annee !== null) {
        params = params.set('annee', String(filters.annee));
      }
      if (filters.responsable !== undefined && filters.responsable !== null) {
        params = params.set('responsable', String(filters.responsable));
      }
      if (filters.statut !== undefined && filters.statut !== null && String(filters.statut).trim() !== '') {
        params = params.set('statut', String(filters.statut));
      }
    }

    return this.http.get<ApiResponse<PlanAnnuel[]>>(`${this.baseUrl}`, { params });
  }

  getById(id: number): Observable<ApiResponse<PlanAnnuel>> {
    return this.http.get<ApiResponse<PlanAnnuel>>(`${this.baseUrl}/${id}`);
  }

  getByYear(annee: number): Observable<ApiResponse<PlanAnnuel[]>> {
    return this.http.get<ApiResponse<PlanAnnuel[]>>(`${this.baseUrl}/annee/${annee}`);
  }

  create(planAnnuel: CreatePlanAnnuelRequest): Observable<ApiResponse<PlanAnnuel>> {
    return this.http.post<ApiResponse<PlanAnnuel>>(`${this.baseUrl}`, planAnnuel);
  }

  update(id: number, planAnnuel: Partial<CreatePlanAnnuelRequest>): Observable<ApiResponse<PlanAnnuel>> {
    return this.http.put<ApiResponse<PlanAnnuel>>(`${this.baseUrl}/${id}`, planAnnuel);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  getStats(id: number): Observable<ApiResponse<{ plan: PlanAnnuel; statistics: PlanAnnuelStats }>> {
    return this.http.get<ApiResponse<{ plan: PlanAnnuel; statistics: PlanAnnuelStats }>>(`${this.baseUrl}/${id}/stats`);
  }

  getExecutionSummary(id: number): Observable<ApiResponse<ExecutionSummary>> {
    return this.http.get<ApiResponse<ExecutionSummary>>(`${this.baseUrl}/${id}/execution`);
  }

  updateStatus(id: number, statut: string): Observable<ApiResponse<PlanAnnuel>> {
    return this.http.patch<ApiResponse<PlanAnnuel>>(`${this.baseUrl}/${id}/status`, { statut });
  }
}