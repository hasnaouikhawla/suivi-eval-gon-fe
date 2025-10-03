import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Zone, CreateZoneRequest } from '../models/zone.model';
import { environment } from '../environment';

export interface ZoneFilters {
  province?: string;
  perimetre?: string;
  commune?: string;
}

export interface ZoneStats {
  total: number;
  par_province: { [key: string]: number };
  par_perimetre?: { [key: string]: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private baseUrl = `${environment.apiBaseUrl}/zones`;

  constructor(private http: HttpClient) {}

  getAll(filters?: ZoneFilters): Observable<ApiResponse<Zone[]>> {
    let params = new HttpParams();

    if (filters?.province) {
      params = params.set('province', filters.province);
    }
    if (filters?.perimetre) {
      params = params.set('perimetre', filters.perimetre);
    }
    if (filters?.commune) {
      params = params.set('commune', filters.commune);
    }

    return this.http.get<ApiResponse<Zone[]>>(this.baseUrl, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          // Transform zones to handle the special default cases
          const transformedZones = response.data.map(zone => this.transformZoneFromApi(zone));
          return { ...response, data: transformedZones };
        }
        return response;
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Zone>> {
    return this.http.get<ApiResponse<Zone>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return { ...response, data: this.transformZoneFromApi(response.data) };
        }
        return response;
      })
    );
  }

  create(zoneData: CreateZoneRequest): Observable<ApiResponse<Zone>> {
    // Transform frontend data back to backend format before sending
    const apiData = this.transformZoneDataForApi(zoneData);
    
    return this.http.post<ApiResponse<Zone>>(this.baseUrl, apiData).pipe(
      map(response => {
        if (response.success && response.data) {
          return { ...response, data: this.transformZoneFromApi(response.data) };
        }
        return response;
      })
    );
  }

  /**
   * Find existing zone by province/commune/perimetre combination or create new one
   * This method checks for existing zones first before creating
   */
  findOrCreate(zoneData: CreateZoneRequest): Observable<ApiResponse<Zone>> {
    // Normalize the search criteria - treat empty/null/undefined as 'default'
    const searchProvince = this.normalizeZoneValue(zoneData.province);
    const searchCommune = this.normalizeZoneValue(zoneData.commune);
    const searchPerimetre = this.normalizeZoneValue(zoneData.perimetre);

    console.log('findOrCreate: Searching for zone with:', { searchProvince, searchCommune, searchPerimetre });

    // First, get all zones to check for existing combination
    return this.getAll().pipe(
      switchMap(response => {
        if (!response.success || !response.data) {
          console.log('findOrCreate: Could not get zones, proceeding with creation');
          // If we can't get zones, proceed with creation
          return this.create(zoneData);
        }

        console.log('findOrCreate: Loaded zones:', response.data.length);

        // Look for existing zone with same province, commune, and perimetre
        // Note: response.data already contains transformed zones (default -> Région GON)
        const existingZone = response.data.find(zone => {
          // Convert back to normalized values for comparison
          const zoneProvince = this.normalizeZoneValue(this.getOriginalValue(zone.province));
          const zoneCommune = this.normalizeZoneValue(this.getOriginalValue(zone.commune));
          const zonePerimetre = this.normalizeZoneValue(this.getOriginalValue(zone.perimetre));

          const matches = zoneProvince === searchProvince &&
                         zoneCommune === searchCommune &&
                         zonePerimetre === searchPerimetre;

          if (matches) {
            console.log('findOrCreate: Found matching zone:', zone);
          }

          return matches;
        });

        if (existingZone) {
          console.log('findOrCreate: Using existing zone with id:', existingZone.id_zone);
          // Return existing zone wrapped in ApiResponse format
          return new Observable<ApiResponse<Zone>>(subscriber => {
            subscriber.next({
              success: true,
              data: existingZone,
              message: 'Zone existante trouvée'
            });
            subscriber.complete();
          });
        } else {
          console.log('findOrCreate: No matching zone found, creating new one');
          // Create new zone if no match found
          return this.create(zoneData);
        }
      })
    );
  }

  /**
   * Normalize zone values for consistent comparison
   * Treats empty, null, undefined, and 'Région GON' as 'default'
   */
  private normalizeZoneValue(value: string | undefined | null): string {
    if (!value || value.trim() === '' || value === 'Région GON') {
      return 'default';
    }
    return value.toLowerCase().trim();
  }

  update(id: number, zoneData: Partial<CreateZoneRequest>): Observable<ApiResponse<Zone>> {
    // Transform frontend data back to backend format before sending
    const apiData = this.transformZoneDataForApi(zoneData);
    
    return this.http.put<ApiResponse<Zone>>(`${this.baseUrl}/${id}`, apiData).pipe(
      map(response => {
        if (response.success && response.data) {
          return { ...response, data: this.transformZoneFromApi(response.data) };
        }
        return response;
      })
    );
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  getByProvince(province: string): Observable<ApiResponse<Zone[]>> {
    return this.http.get<ApiResponse<Zone[]>>(`${this.baseUrl}/province/${province}`).pipe(
      map(response => {
        if (response.success && response.data) {
          const transformedZones = response.data.map(zone => this.transformZoneFromApi(zone));
          return { ...response, data: transformedZones };
        }
        return response;
      })
    );
  }

  getStats(filters?: ZoneFilters): Observable<ApiResponse<ZoneStats>> {
    let params = new HttpParams();

    if (filters?.province) {
      params = params.set('province', filters.province);
    }
    if (filters?.perimetre) {
      params = params.set('perimetre', filters.perimetre);
    }
    if (filters?.commune) {
      params = params.set('commune', filters.commune);
    }

    return this.http.get<ApiResponse<ZoneStats>>(`${this.baseUrl}/stats`, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          // Transform stats to handle the special default cases
          const stats = { ...response.data };
          
          // Replace "default" with "Région GON" in par_province
          if (stats.par_province && stats.par_province['default']) {
            stats.par_province['Région GON'] = stats.par_province['default'];
            delete stats.par_province['default'];
          }
          
          // Replace "default" with "Région GON" in par_perimetre if it exists
          if (stats.par_perimetre && stats.par_perimetre['default']) {
            stats.par_perimetre['Région GON'] = stats.par_perimetre['default'];
            delete stats.par_perimetre['default'];
          }
          
          return { ...response, data: stats };
        }
        return response;
      })
    );
  }

  /**
   * Transform zone data from API format to frontend format
   * This converts "default" to "Région GON" for all fields
   */
  private transformZoneFromApi(zone: Zone): Zone {
    const transformedZone = { ...zone };

    // Replace "default" with "Région GON" in province
    if (transformedZone.province === 'default' || !transformedZone.province || transformedZone.province.trim() === '') {
      transformedZone.province = 'Région GON';
    }

    // Replace "default" with "Région GON" in commune  
    if (transformedZone.commune === 'default' || !transformedZone.commune || transformedZone.commune.trim() === '') {
      transformedZone.commune = 'Région GON';
    }

    // Replace "default" with "Région GON" in perimetre
    if (transformedZone.perimetre === 'default' || !transformedZone.perimetre || transformedZone.perimetre.trim() === '') {
      transformedZone.perimetre = 'Région GON';
    }

    return transformedZone;
  }

  /**
   * Transform zone data from frontend format to backend format
   * This converts "Région GON" back to "default" and handles empty values
   */
  private transformZoneDataForApi(zoneData: Partial<CreateZoneRequest>): Partial<CreateZoneRequest> {
    const apiData: Partial<CreateZoneRequest> = {};

    if (zoneData.province !== undefined) {
      if (zoneData.province === 'Région GON' || !zoneData.province || zoneData.province.trim() === '') {
        apiData.province = 'default';
      } else {
        apiData.province = zoneData.province.trim();
      }
    }

    if (zoneData.commune !== undefined) {
      if (zoneData.commune === 'Région GON' || !zoneData.commune || zoneData.commune.trim() === '') {
        apiData.commune = 'default';
      } else {
        apiData.commune = zoneData.commune.trim();
      }
    }

    if (zoneData.perimetre !== undefined) {
      if (zoneData.perimetre === 'Région GON' || !zoneData.perimetre || zoneData.perimetre.trim() === '') {
        apiData.perimetre = 'default';
      } else {
        apiData.perimetre = zoneData.perimetre.trim();
      }
    }

    // Copy other fields that don't need transformation
    Object.keys(zoneData).forEach(key => {
      if (!['province', 'commune', 'perimetre'].includes(key)) {
        (apiData as any)[key] = (zoneData as any)[key];
      }
    });

    console.log('transformZoneDataForApi: Input:', zoneData, 'Output:', apiData);

    return apiData;
  }

  /**
   * Get display name for a zone
   * Helper method for components to get a formatted display name
   */
  getZoneDisplayName(zone: Zone): string {
    if (!zone) return '';
    
    const province = zone.province || 'Région GON';
    const commune = zone.commune || `Zone ${zone.id_zone}`;
    const perimetre = zone.perimetre || 'Région GON';
    
    if (zone.id_zone === 0) {
      return `${perimetre} — ${commune} — ${province}`;
    }
    
    return `${perimetre || '—'} — ${commune} — ${province}`;
  }

  /**
   * Check if a zone is the default zone (id_zone = 0)
   */
  isDefaultZone(zone: Zone): boolean {
    return zone.id_zone === 0;
  }

  /**
   * Check if a zone has any default values (after transformation, these would be "Région GON")
   */
  hasDefaultValues(zone: Zone): boolean {
    return zone.province === 'Région GON' || 
           zone.commune === 'Région GON' || 
           zone.perimetre === 'Région GON';
  }

  /**
   * Get zones sorted with default zone first (if present)
   */
  getSortedZones(zones: Zone[]): Zone[] {
    return zones.sort((a, b) => {
      // Default zone (id_zone = 0) should appear first
      if (a.id_zone === 0 && b.id_zone !== 0) return -1;
      if (b.id_zone === 0 && a.id_zone !== 0) return 1;
      
      // Zones with "Région GON" values should appear before regular zones
      const aHasDefault = this.hasDefaultValues(a);
      const bHasDefault = this.hasDefaultValues(b);
      if (aHasDefault && !bHasDefault) return -1;
      if (bHasDefault && !aHasDefault) return 1;
      
      // Then sort by province, commune, perimetre
      const aProvince = a.province || '';
      const bProvince = b.province || '';
      if (aProvince !== bProvince) {
        return aProvince.localeCompare(bProvince, 'fr', { numeric: true });
      }
      
      const aCommune = a.commune || '';
      const bCommune = b.commune || '';
      if (aCommune !== bCommune) {
        return aCommune.localeCompare(bCommune, 'fr', { numeric: true });
      }
      
      const aPerimetre = a.perimetre || '';
      const bPerimetre = b.perimetre || '';
      return aPerimetre.localeCompare(bPerimetre, 'fr', { numeric: true });
    });
  }

  /**
   * Get the original value before transformation (useful for API calls)
   * This method converts "Région GON" back to "default" for backend compatibility
   */
  getOriginalValue(value: string | undefined): string {
    if (!value || value === 'Région GON') {
      return 'default';
    }
    return value;
  }

  /**
   * Transform zone data back to original format for API calls
   * This converts "Région GON" back to "default" for backend compatibility
   */
  transformZoneForApi(zone: Zone): Zone {
    const apiZone = { ...zone };

    if (apiZone.province === 'Région GON' || !apiZone.province || apiZone.province.trim() === '') {
      apiZone.province = 'default';
    }

    if (apiZone.commune === 'Région GON' || !apiZone.commune || apiZone.commune.trim() === '') {
      apiZone.commune = 'default';
    }

    if (apiZone.perimetre === 'Région GON' || !apiZone.perimetre || apiZone.perimetre.trim() === '') {
      apiZone.perimetre = 'default';
    }

    return apiZone;
  }

  /**
   * Find existing zone by province/commune/perimetre combination
   * Returns the zone ID if found, null if not found
   */
  findExistingZoneId(province: string, commune: string, perimetre?: string): Observable<number | null> {
    return this.getAll().pipe(
      map(response => {
        if (!response.success || !response.data) {
          return null;
        }

        // Normalize search criteria using the same logic as findOrCreate
        const searchProvince = this.normalizeZoneValue(province);
        const searchCommune = this.normalizeZoneValue(commune);
        const searchPerimetre = this.normalizeZoneValue(perimetre);

        // Find matching zone - data is already transformed (default -> Région GON)
        const existingZone = response.data.find(zone => {
          // Convert back to normalized values for comparison
          const zoneProvince = this.normalizeZoneValue(this.getOriginalValue(zone.province));
          const zoneCommune = this.normalizeZoneValue(this.getOriginalValue(zone.commune));
          const zonePerimetre = this.normalizeZoneValue(this.getOriginalValue(zone.perimetre));

          return zoneProvince === searchProvince &&
                 zoneCommune === searchCommune &&
                 zonePerimetre === searchPerimetre;
        });

        return existingZone ? existingZone.id_zone : null;
      })
    );
  }
}