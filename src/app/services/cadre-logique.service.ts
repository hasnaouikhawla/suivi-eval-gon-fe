import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CadreLogique, CreateCadreLogiqueRequest, CadreLogiqueNiveau } from '../models/cadre-logique.model';
import { environment } from '../environment';

export interface CadreLogiqueFilters {
  niveau?: CadreLogiqueNiveau;
  parent_id?: number;
  search?: string; // global search string
}

export interface CadreLogiqueStats {
  total: number;
  byLevel: { [key: string]: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CadreLogiqueHierarchy extends CadreLogique {
  children: CadreLogiqueHierarchy[];
  level?: number;
  hasChildren?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CadreLogiqueService {
  private baseUrl = `${environment.apiBaseUrl}/cadre-logique`;

  constructor(private http: HttpClient) {}

  /**
   * Get all elements and optionally apply filters.
   *
   * Behavior:
   * - Sends supported filters (niveau, parent_id, search) as query params to backend so backend can optimize if supported.
   * - Additionally performs client-side search when `filters.search` is provided to guarantee "search across any niveau"
   *   works even when the backend doesn't support a global search endpoint.
   *
   * Important: when client-side search is applied we also include ancestor nodes of matching items so the hierarchical
   * view can render matches (children) with their parent context.
   */
  getAll(filters?: CadreLogiqueFilters): Observable<ApiResponse<CadreLogique[]>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.niveau) {
        params = params.set('niveau', String(filters.niveau));
      }
      if (filters.parent_id !== undefined && filters.parent_id !== null) {
        params = params.set('parent_id', String(filters.parent_id));
      }
      if (filters.search) {
        params = params.set('search', String(filters.search).trim());
      }
    }

    return this.http.get<ApiResponse<CadreLogique[]>>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        // If response not as expected, return as-is
        if (!response || !response.success || !Array.isArray(response.data)) {
          return response;
        }

        const original: CadreLogique[] = response.data || [];
        let data: CadreLogique[] = original;

        // Client-side global search fallback: match across intitule, observations, ordre, niveau.
        // Also include ancestor chain of matches so hierarchical rendering keeps context.
        if (filters?.search) {
          const q = String(filters.search).toLowerCase().trim();
          if (q.length > 0) {
            // Build id -> element map for ancestor lookup
            const idMap = new Map<number, CadreLogique>();
            for (const el of original) {
              if (el && typeof el.id_cadre === 'number') {
                idMap.set(el.id_cadre, el);
              }
            }

            // Find directly matching elements
            const matched: CadreLogique[] = original.filter(el => {
              if (!el) return false;
              const intitule = (el.intitule ?? '').toString().toLowerCase();
              const observations = (el.observations ?? '').toString().toLowerCase();
              const ordre = (el.ordre ?? '').toString().toLowerCase();
              const niveau = (el.niveau ?? '').toString().toLowerCase();
              return intitule.includes(q)
                || observations.includes(q)
                || ordre.includes(q)
                || niveau.includes(q);
            });

            // Build set of ids to include: matches + all their ancestors
            const includeIds = new Set<number>();
            for (const m of matched) {
              if (!m || typeof m.id_cadre !== 'number') continue;
              let cur: CadreLogique | undefined = m;
              includeIds.add(cur.id_cadre);
              // Walk up parents using original list map
              while (cur && cur.parent_id) {
                const pid = cur.parent_id;
                if (typeof pid !== 'number') break;
                if (includeIds.has(pid)) break; // already included
                includeIds.add(pid);
                cur = idMap.get(pid);
                if (!cur) break;
              }
            }

            // If nothing matched, return empty array
            if (includeIds.size === 0) {
              data = [];
            } else {
              data = original.filter(el => el && typeof el.id_cadre === 'number' && includeIds.has(el.id_cadre));
            }
          }
        }

        // Re-apply niveau filter client-side to be sure (backend may or may not have applied it)
        // --- FIXED: do not strip ancestors when a search is active.
        // If a search term is present we keep the ancestor context included above.
        // Apply strict niveau filtering only when there is NO free-text search.
        if (filters?.niveau && !filters?.search) {
          data = data.filter(el => el.niveau === filters.niveau);
        }

        return {
          ...response,
          data
        };
      })
    );
  }

  getById(id: number): Observable<ApiResponse<CadreLogique>> {
    return this.http.get<ApiResponse<CadreLogique>>(`${this.baseUrl}/${id}`);
  }

  getByLevel(niveau: CadreLogiqueNiveau): Observable<ApiResponse<CadreLogique[]>> {
    return this.http.get<ApiResponse<CadreLogique[]>>(`${this.baseUrl}/niveau/${niveau}`);
  }

  getChildren(id: number): Observable<ApiResponse<CadreLogique[]>> {
    return this.http.get<ApiResponse<CadreLogique[]>>(`${this.baseUrl}/${id}/children`);
  }

  getHierarchy(): Observable<ApiResponse<CadreLogiqueHierarchy[]>> {
    return this.http.get<ApiResponse<CadreLogiqueHierarchy[]>>(`${this.baseUrl}/hierarchy`);
  }

  create(cadreLogique: CreateCadreLogiqueRequest): Observable<ApiResponse<CadreLogique>> {
    return this.http.post<ApiResponse<CadreLogique>>(`${this.baseUrl}`, cadreLogique);
  }

  update(id: number, cadreLogique: Partial<CreateCadreLogiqueRequest>): Observable<ApiResponse<CadreLogique>> {
    return this.http.put<ApiResponse<CadreLogique>>(`${this.baseUrl}/${id}`, cadreLogique);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  getStats(): Observable<ApiResponse<CadreLogiqueStats>> {
    return this.http.get<ApiResponse<CadreLogiqueStats>>(`${this.baseUrl}/stats`);
  }

  // Helper method to sort elements hierarchically
  sortElementsHierarchically(elements: CadreLogique[]): CadreLogique[] {
    const result: CadreLogique[] = [];
    const processedIds = new Set<number>();

    const levelPriority: { [k in CadreLogiqueNiveau]: number } = {
      'Objectif global': 1,
      'Objectif spécifique': 2,
      'Résultat': 3,
      'Activité': 4
    };

    const addElementAndChildren = (element: CadreLogique, level: number = 0) => {
      if (processedIds.has(element.id_cadre)) return;

      // Add visual hierarchy indicators
      const hierarchicalElement = {
        ...element,
        _hierarchyLevel: level,
        _displayIntitule: this.getHierarchicalPrefix(level) + element.intitule
      };

      result.push(hierarchicalElement as CadreLogique);
      processedIds.add(element.id_cadre);

      // Find and add children (order by ordre, fallback by id)
      const children = elements
        .filter(el => el.parent_id === element.id_cadre)
        .sort((a, b) => {
          const oa = (a.ordre !== undefined && a.ordre !== null) ? Number(a.ordre) : Number.MAX_SAFE_INTEGER;
          const ob = (b.ordre !== undefined && b.ordre !== null) ? Number(b.ordre) : Number.MAX_SAFE_INTEGER;
          if (oa !== ob) return oa - ob;
          // same ordre within same parent -> stable tie-breaker by id
          return (a.id_cadre || 0) - (b.id_cadre || 0);
        });

      children.forEach(child => addElementAndChildren(child, level + 1));
    };

    // Start with root elements (no parent) that exist in the provided list
    const rootElements = elements
      .filter(el => !el.parent_id || !elements.some(e => e.id_cadre === el.parent_id))
      .sort((a, b) => {
        const oa = (a.ordre !== undefined && a.ordre !== null) ? Number(a.ordre) : Number.MAX_SAFE_INTEGER;
        const ob = (b.ordre !== undefined && b.ordre !== null) ? Number(b.ordre) : Number.MAX_SAFE_INTEGER;
        if (oa !== ob) return oa - ob;
        // If ordres tie, order by configured niveau priority (Objectif global first, Activite last)
        const pa = levelPriority[a.niveau] ?? 99;
        const pb = levelPriority[b.niveau] ?? 99;
        if (pa !== pb) return pa - pb;
        // final tie-breaker
        return (a.intitule || '').localeCompare(b.intitule || '');
      });

    rootElements.forEach(element => addElementAndChildren(element));

    // Finally, include any remaining elements not yet processed (isolated nodes), to ensure nothing is lost.
    for (const el of elements) {
      if (!processedIds.has(el.id_cadre)) {
        addElementAndChildren(el, 0);
      }
    }

    return result;
  }

  private getHierarchicalPrefix(level: number): string {
    if (level === 0) return '';
    return '└─ '.repeat(1) + '  '.repeat(level - 1);
  }

  // Helper method to get level icon
  getLevelIcon(niveau: CadreLogiqueNiveau): string {
    const icons = {
      'Objectif global': '🎯',
      'Objectif spécifique': '⚡',
      'Résultat': '✅',
      'Activité': '📋'
    };
    return icons[niveau] || '📄';
  }

  // Helper method to get level color
  getLevelColor(niveau: CadreLogiqueNiveau): string {
    const colors = {
      'Objectif global': 'purple',
      'Objectif spécifique': 'indigo',
      'Résultat': 'green',
      'Activité': 'orange'
    };
    return colors[niveau] || 'gray';
  }
}
