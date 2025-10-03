import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet, CreateProjetRequest, ProjetStatus } from '../models/projet.model';
import { environment } from '../environment';

export interface ProjetFilters {
  statut?: ProjetStatus;
  id_zone?: number;
  province?: string;
}

export interface ProjetStats {
  total: number;
  par_statut: { [key: string]: number };
  par_province: { [key: string]: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private baseUrl = `${environment.apiBaseUrl}/projets`;

  constructor(private http: HttpClient) {}

  getAll(filters?: ProjetFilters): Observable<ApiResponse<Projet[]>> {
    let params = new HttpParams();

    if (filters?.statut) {
      params = params.set('statut', filters.statut);
    }
    if (filters?.id_zone) {
      params = params.set('id_zone', filters.id_zone.toString());
    }
    if (filters?.province) {
      params = params.set('province', filters.province);
    }

    return this.http.get<ApiResponse<Projet[]>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Projet>> {
    return this.http.get<ApiResponse<Projet>>(`${this.baseUrl}/${id}`);
  }

  create(projetData: CreateProjetRequest): Observable<ApiResponse<Projet>> {
    return this.http.post<ApiResponse<Projet>>(this.baseUrl, projetData);
  }

  update(id: number, projetData: Partial<CreateProjetRequest>): Observable<ApiResponse<Projet>> {
    return this.http.put<ApiResponse<Projet>>(`${this.baseUrl}/${id}`, projetData);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, statut: ProjetStatus): Observable<ApiResponse<Projet>> {
    return this.http.patch<ApiResponse<Projet>>(`${this.baseUrl}/${id}/status`, { statut });
  }

  getStats(filters?: ProjetFilters): Observable<ApiResponse<ProjetStats>> {
    let params = new HttpParams();

    if (filters?.statut) {
      params = params.set('statut', filters.statut);
    }
    if (filters?.province) {
      params = params.set('province', filters.province);
    }

    return this.http.get<ApiResponse<ProjetStats>>(`${this.baseUrl}/stats`, { params });
  }
}
