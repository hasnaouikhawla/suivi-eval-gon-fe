import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, CreateUserRequest, UserRole, ChangePasswordRequest, ApiResponse } from '../models/user.model';
import { environment } from '../environment';

export interface UserFilters {
  role?: UserRole;
  actif?: boolean;
  search?: string;
  provinces?: string[]; // client-side filter
  communes?: string[];  // client-side filter
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users.
   *
   * Note: provinces and communes filters are applied client-side after the API response,
   * because the backend may not support array filters yet.
   */
  getAll(filters?: UserFilters): Observable<ApiResponse<User[]>> {
    let params = new HttpParams();
    
    if (filters) {
      // Only send simple scalar filters to the backend (role, actif, search)
      if (filters.role !== undefined) {
        params = params.set('role', String(filters.role));
      }
      if (filters.actif !== undefined) {
        params = params.set('actif', String(filters.actif));
      }
      if (filters.search !== undefined && filters.search !== null && String(filters.search).trim() !== '') {
        params = params.set('search', String(filters.search).trim());
      }
      // DO NOT send provinces/communes to backend here; we'll filter them client-side below
    }

    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return response;
        }

        // Clone the data array to avoid mutating original response objects
        let users = (response.data || []).slice();

        // Apply client-side province filters if provided
        if (filters?.provinces && Array.isArray(filters.provinces) && filters.provinces.length > 0) {
          const selectedProvinces = filters.provinces.map(p => String(p).trim().toLowerCase());
          users = users.filter(u => {
            // normalize user's provinces to array of strings
            const uProvsRaw = (u as any).provinces;
            const uProvs = Array.isArray(uProvsRaw)
              ? uProvsRaw.map((x: any) => String(x).trim().toLowerCase())
              : (uProvsRaw ? String(uProvsRaw).split(',').map((x: string) => x.trim().toLowerCase()) : []);
            // keep user if any of their provinces is in selectedProvinces
            return uProvs.some((up: string) => selectedProvinces.includes(up));
          });
        }

        // Apply client-side commune filters if provided
        if (filters?.communes && Array.isArray(filters.communes) && filters.communes.length > 0) {
          const selectedCommunes = filters.communes.map(c => String(c).trim().toLowerCase());
          users = users.filter(u => {
            const uCommsRaw = (u as any).communes;
            const uComms = Array.isArray(uCommsRaw)
              ? uCommsRaw.map((x: any) => String(x).trim().toLowerCase())
              : (uCommsRaw ? String(uCommsRaw).split(',').map((x: string) => x.trim().toLowerCase()) : []);
            return uComms.some((uc: string) => selectedCommunes.includes(uc));
          });
        }

        return { ...response, data: users };
      })
    );
  }

  getById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`);
  }

  create(user: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}`, user);
  }

  update(id: number, user: Partial<CreateUserRequest>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, user);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  activate(id: number): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  changePassword(id: number, passwordData: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/change-password`, passwordData);
  }

  getStats(): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(`${this.baseUrl}/stats`);
  }
}
