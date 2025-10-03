import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuiviBudget, CreateBudgetRequest, BudgetSummary } from '../models/suivi-budget.model';
import { environment } from '../environment';

export interface SuiviBudgetFilters {
  id_projet?: number;
  id_action?: number;
  type_budget?: 'projet' | 'action';
  min_budget?: number | string | null;
  max_budget?: number | string | null;
  date_debut?: string;
  date_fin?: string;
  date_entree?: string; // new: allow filtering by date_entree (single date or backend may interpret)
}

export interface PaymentUpdateRequest {
  montant_paye: number;
  date_paiement?: string;
  facture_numero?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuiviBudgetService {
  private baseUrl = `${environment.apiBaseUrl}/budgets`;

  constructor(private http: HttpClient) {}

  /**
   * Parse budget values that might be formatted strings (e.g., "10K MAD", "2.5M", "12,000")
   * or plain numbers and return numeric value in MAD.
   */
  private parseBudgetValue(value: any): number {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;

    let str = String(value).trim().toLowerCase();

    // Remove currency indicators
    str = str.replace(/mad/g, '').replace(/€/g, '').replace(/\$/g, '').trim();

    // Handle K/M suffixes
    let multiplier = 1;
    if (str.endsWith('k')) {
      multiplier = 1_000;
      str = str.slice(0, -1).trim();
    } else if (str.endsWith('m')) {
      multiplier = 1_000_000;
      str = str.slice(0, -1).trim();
    }

    // Remove spaces and normalize decimal separators
    str = str.replace(/\s+/g, '').replace(/,/g, '.');

    const num = parseFloat(str);
    if (Number.isNaN(num)) return 0;

    return Math.round(num * multiplier);
  }

  /**
   * Build HttpParams excluding min_budget/max_budget (handled client-side)
   */
  private buildServerParams(filters?: SuiviBudgetFilters): HttpParams {
    let params = new HttpParams();
    
    if (!filters) return params;

    Object.entries(filters).forEach(([key, value]) => {
      // Skip budget filters - these are handled client-side
      if (key === 'min_budget' || key === 'max_budget') return;
      
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return params;
  }

  /**
   * Validate budget data before sending to backend
   */
  private validateBudgetData(budgetData: CreateBudgetRequest | Partial<CreateBudgetRequest>): void {
    // Validate type_budget and corresponding entity ID
    if (budgetData.type_budget === 'action' && !budgetData.id_action) {
      throw new Error('id_action est requis pour type_budget = action');
    }
    if (budgetData.type_budget === 'projet' && !budgetData.id_projet) {
      throw new Error('id_projet est requis pour type_budget = projet');
    }

    // Validate budget values
    if (budgetData.budget_prevu !== undefined) {
      const budgetValue = typeof budgetData.budget_prevu === 'number' 
        ? budgetData.budget_prevu 
        : this.parseBudgetValue(budgetData.budget_prevu);
      
      if (budgetValue <= 0) {
        throw new Error('Le budget prévu doit être supérieur à 0');
      }
    }

    if (budgetData.montant_paye !== undefined) {
      const payeValue = typeof budgetData.montant_paye === 'number'
        ? budgetData.montant_paye
        : this.parseBudgetValue(budgetData.montant_paye);
      
      if (payeValue < 0) {
        throw new Error('Le montant payé ne peut pas être négatif');
      }

      if (budgetData.budget_prevu !== undefined) {
        const budgetValue = typeof budgetData.budget_prevu === 'number' 
          ? budgetData.budget_prevu 
          : this.parseBudgetValue(budgetData.budget_prevu);
        // no additional action here (kept original logic)
      }
    }

    // Validate date_entree if provided (accepts ISO-like dates)
    if ((budgetData as any).date_entree !== undefined && (budgetData as any).date_entree !== null && (budgetData as any).date_entree !== '') {
      const d = new Date((budgetData as any).date_entree);
      if (Number.isNaN(d.getTime())) {
        throw new Error('date_entree invalide');
      }
      // keep as string; backend expects 'YYYY-MM-DD' or ISO date - caller should provide appropriate format
    }
  }

  /**
   * Get all budgets with client-side budget filtering applied after receiving data from backend
   */
  getAll(filters?: SuiviBudgetFilters): Observable<ApiResponse<SuiviBudget[]>> {
    const params = this.buildServerParams(filters);

    return this.http.get<ApiResponse<SuiviBudget[]>>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        const originalData = Array.isArray(response.data) ? response.data : [];

        // Extract budget bounds from filters
        let minBudget: number | null = null;
        let maxBudget: number | null = null;

        if (filters) {
          if (filters.min_budget !== undefined && filters.min_budget !== null && filters.min_budget !== '') {
            const parsed = Number(filters.min_budget);
            if (Number.isFinite(parsed) && parsed >= 0) {
              minBudget = parsed;
            }
          }
          
          if (filters.max_budget !== undefined && filters.max_budget !== null && filters.max_budget !== '') {
            const parsed = Number(filters.max_budget);
            if (Number.isFinite(parsed) && parsed >= 0) {
              maxBudget = parsed;
            }
          }
        }

        // If no budget filtering needed, return original data
        if (minBudget === null && maxBudget === null) {
          return { ...response, data: originalData };
        }

        // Apply client-side budget filtering
        const filteredData = originalData.filter(budgetItem => {
          // Parse budget_prevu value (handles both numbers and formatted strings)
          const budgetValue = this.parseBudgetValue(budgetItem.budget_prevu);

          // Apply min filter
          if (minBudget !== null && budgetValue < minBudget) {
            return false;
          }

          // Apply max filter
          if (maxBudget !== null && budgetValue > maxBudget) {
            return false;
          }

          return true;
        });

        return {
          ...response,
          data: filteredData
        };
      })
    );
  }

  getById(id: number): Observable<ApiResponse<SuiviBudget>> {
    return this.http.get<ApiResponse<SuiviBudget>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get budgets by action
   */
  getByAction(actionId: number): Observable<ApiResponse<SuiviBudget[]>> {
    return this.http.get<ApiResponse<SuiviBudget[]>>(`${this.baseUrl}/action/${actionId}`);
  }

  /**
   * Get budgets by projet (includes both project-level and action-level budgets)
   */
  getByProjet(projetId: number): Observable<ApiResponse<SuiviBudget[]>> {
    return this.http.get<ApiResponse<SuiviBudget[]>>(`${this.baseUrl}/projet/${projetId}`);
  }

  create(budget: CreateBudgetRequest): Observable<ApiResponse<SuiviBudget>> {
    try {
      this.validateBudgetData(budget);
      return this.http.post<ApiResponse<SuiviBudget>>(`${this.baseUrl}`, budget);
    } catch (error) {
      throw error;
    }
  }

  update(id: number, budget: Partial<CreateBudgetRequest>): Observable<ApiResponse<SuiviBudget>> {
    try {
      this.validateBudgetData(budget as CreateBudgetRequest);
      return this.http.put<ApiResponse<SuiviBudget>>(`${this.baseUrl}/${id}`, budget);
    } catch (error) {
      throw error;
    }
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  updatePayment(id: number, paymentData: PaymentUpdateRequest): Observable<ApiResponse<SuiviBudget>> {
    // Validate payment amount
    if (paymentData.montant_paye < 0) {
      throw new Error('Le montant payé ne peut pas être négatif');
    }
    
    return this.http.patch<ApiResponse<SuiviBudget>>(`${this.baseUrl}/${id}/payment`, paymentData);
  }

  /**
   * Get stats - excludes budget filters since stats are computed server-side
   */
  getStats(filters?: SuiviBudgetFilters): Observable<ApiResponse<any>> {
    const params = this.buildServerParams(filters);
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats`, { params });
  }

  /**
   * Get budget execution summary
   * @param projetId Optional projet ID to filter by
   * @param actionId Optional action ID to filter by
   */
  getBudgetExecutionSummary(projetId?: number, actionId?: number): Observable<ApiResponse<BudgetSummary>> {
    let params = new HttpParams();
    if (projetId !== undefined && projetId !== null) {
      params = params.set('id_projet', projetId.toString());
    }
    if (actionId !== undefined && actionId !== null) {
      params = params.set('id_action', actionId.toString());
    }
    return this.http.get<ApiResponse<BudgetSummary>>(`${this.baseUrl}/budget-execution`, { params });
  }

  /**
   * Get budget stats computed from filtered data (includes client-side budget filtering)
   * This reflects the applied filters in summary cards
   */
  getBudgetStatsFiltered(filters?: SuiviBudgetFilters): Observable<ApiResponse<BudgetSummary>> {
    return this.getAll(filters).pipe(
      map(response => {
        const budgets = Array.isArray(response.data) ? response.data : [];
        
        const summary = budgets.reduce(
          (acc, budgetItem) => {
            const budgetPrevu = this.parseBudgetValue(budgetItem.budget_prevu);
            const montantPaye = this.parseBudgetValue(budgetItem.montant_paye);
            
            acc.total_budget_prevu += budgetPrevu;
            acc.total_montant_paye += montantPaye;
            acc.total_ecart += (budgetPrevu - montantPaye);
            acc.nombre_budgets += 1;
            
            // Count unique projets (through projet_id from joined data)
            if (budgetItem.projet_id && !acc.projetIds.has(budgetItem.projet_id)) {
              acc.projetIds.add(budgetItem.projet_id);
            }
            
            // Count unique actions
            if (budgetItem.id_action && !acc.actionIds.has(budgetItem.id_action)) {
              acc.actionIds.add(budgetItem.id_action);
            }
            
            return acc;
          },
          {
            total_budget_prevu: 0,
            total_montant_paye: 0,
            total_ecart: 0,
            nombre_budgets: 0,
            projetIds: new Set<number>(),
            actionIds: new Set<number>()
          }
        );

        const budgetSummary: BudgetSummary = {
          total_budget_prevu: summary.total_budget_prevu,
          total_montant_paye: summary.total_montant_paye,
          total_ecart: summary.total_ecart,
          nombre_projets: summary.projetIds.size,
          nombre_actions: summary.actionIds.size
        };

        return {
          success: true,
          data: budgetSummary
        };
      })
    );
  }

  /**
   * Calculate execution rate for a budget entry
   */
  calculateExecutionRate(budget: SuiviBudget): number {
    if (!budget.budget_prevu || budget.budget_prevu === 0) return 0;
    return (budget.montant_paye / budget.budget_prevu) * 100;
  }

  /**
   * Helper method to create project-level budget
   */
  createProjectBudget(projetId: number, budgetPrevu: number, observations?: string): CreateBudgetRequest {
    return {
      id_projet: projetId,
      type_budget: 'projet',
      budget_prevu: budgetPrevu,
      observations
    };
  }

  /**
   * Helper method to create action-level budget
   */
  createActionBudget(actionId: number, budgetPrevu: number, observations?: string): CreateBudgetRequest {
    return {
      id_action: actionId,
      type_budget: 'action',
      budget_prevu: budgetPrevu,
      observations
    };
  }
}
