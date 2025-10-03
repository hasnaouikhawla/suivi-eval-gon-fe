import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../environment';
import { AccessControlService } from './access-control.service';
import { ProjetService } from './projet.service';
import { actionService } from './action.service';
import { IndicateurService } from './indicateur.service';
import { SuiviBudgetService } from './suivi-budget.service';
import { SuiviIndicateurService } from './suivi-indicateur.service';
import { UserService } from './user.service';
import { ZoneService } from './zone.service';
import { JournalService } from './journal.service';
import { DocumentService } from './document.service';
import { PlanAnnuelService } from './plan-annuel.service';
import { CadreLogiqueService } from './cadre-logique.service';
import { AuthService } from './auth.service'; // <-- added

// Physical Progress Section - Actions and Projects progress
export interface SuiviPhysiqueData {
  actions: {
    total: number;
    completed: number;
    in_progress: number;
    planned: number;
    completion_rate: number;
    recent_updates: any[];
    par_type_volet: {
      CES: { total: number; completed: number; completion_rate: number };
      CEP: { total: number; completed: number; completion_rate: number };
    };
    critical_actions: any[]; // Actions with low progress
    physical_progress: {
      total_quantite_prevue: number;
      total_quantite_realisee: number;
      physical_progress_rate: number;
      actions_with_progress: number;
    };
  };
  projets: {
    total: number;
    completed: number;
    in_progress: number;
    planned: number;
    completion_rate: number;
    recent_projects: any[];
    overdue_projects: any[];
  };
  zones: {
    total: number;
    active_zones: number;
    par_province: Record<string, number>;
    most_active_zone: string;
  };
}

// Budget Tracking Section - Financial monitoring
export interface SuiviBudgetaireData {
  budget_global: {
    total_prevu: number;
    total_engage: number;
    total_paye: number;
    execution_rate: number;
    remaining_budget: number;
  };
  projets: {
    nombre_projets_budgetises: number;
    budget_total_projets: number;
    budget_paye_projets: number;
    execution_rate_projets: number;
    top_projets_by_budget: any[];
  };
  actions: {
    nombre_actions_budgetisees: number;
    budget_total_actions: number;
    budget_paye_actions: number;
    execution_rate_actions: number;
    top_actions_by_budget: any[];
  };
  ecarts: {
    ecart_total: number;
    projets_depassement: any[];
    actions_depassement: any[];
  };
  trends: {
    monthly_execution: Array<{month: string; budget_paye: number}>;
    execution_by_type: {
      projets: number[];
      actions: number[];
      months: string[];
    };
  };
}

// Logical Framework Tracking Section - Indicators and measurements
export interface SuiviCadreLogiqueData {
  cadre_logique: {
    total_elements: number;
    par_niveau: {
      'Objectif global': number;
      'Objectif spécifique': number;
      'Résultat': number;
      'Activité': number;
    };
    elements_with_indicators: number;
  };
  indicateurs: {
    total: number;
    atteints: number;
    moderes: number;
    en_retard: number;
    progression_moyenne: number;
    recent_measurements: any[];
    critical_indicators: any[]; // Indicators with poor performance
  };
  mesures: {
    total_measurements: number;
    measurements_this_month: number;
    measurements_last_month: number;
    trend_direction: 'up' | 'down' | 'stable';
    most_measured_indicators: any[];
  };
  performance: {
    best_performing_elements: any[];
    worst_performing_elements: any[];
    improvement_trends: any[];
  };
}

export interface DashboardOverview {
  // Global metrics
  total_projets: number;
  total_actions: number;
  total_indicateurs: number;
  total_zones: number;
  total_users: number;
  budget_total: number;
  budget_utilise: number;
  pourcentage_execution: number;
  
  // Summary metrics
  overall_physical_progress: number;
  overall_budget_execution: number;
  overall_indicator_achievement: number;
  
  // Health status
  health_status: {
    physical: 'good' | 'warning' | 'critical';
    budget: 'good' | 'warning' | 'critical';
    indicators: 'good' | 'warning' | 'critical';
  };
}

export interface DashboardTrends {
  // Physical progress trends
  physical_trends: {
    labels: string[];
    actions_completed: number[];
    projets_completed: number[];
  };
  
  // Budget execution trends
  budget_trends: {
    labels: string[];
    budget_executed: number[];
    cumulative_execution: number[];
  };
  
  // Indicator measurement trends
  indicator_trends: {
    labels: string[];
    measurements_count: number[];
    achievement_rate: number[];
  };
  
  // Combined performance indicators
  performance_indicators: {
    physical_completion_rate: number;
    budget_execution_rate: number;
    indicator_achievement_rate: number;
    overall_performance_score: number;
  };
}

export interface ComprehensiveDashboardData {
  overview: DashboardOverview;
  suivi_physique: SuiviPhysiqueData;
  suivi_budgetaire: SuiviBudgetaireData;
  suivi_cadre_logique: SuiviCadreLogiqueData;
  trends: DashboardTrends;
  permissions: {
    canViewProjets: boolean;
    canViewActions: boolean;
    canViewIndicateurs: boolean;
    canViewBudget: boolean;
    canViewUsers: boolean;
    canViewJournal: boolean;
    canViewReports: boolean;
    canViewDocuments: boolean;
    canViewPlansAnnuels: boolean;
    canViewZones: boolean;
    canViewCadreLogique: boolean;
  };
  metadata: {
    last_updated: Date;
    data_freshness: {
      actions: Date;
      projets: Date;
      budget: Date;
      indicators: Date;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(
    private http: HttpClient,
    private accessControl: AccessControlService,
    private projetService: ProjetService,
    private actionService: actionService,
    private indicateurService: IndicateurService,
    private suiviBudgetService: SuiviBudgetService,
    private suiviIndicateurService: SuiviIndicateurService,
    private userService: UserService,
    private zoneService: ZoneService,
    private journalService: JournalService,
    private documentService: DocumentService,
    private planService: PlanAnnuelService,
    private cadreLogiqueService: CadreLogiqueService,
    private authService: AuthService // <-- injected to read current user's provinces/communes
  ) {}

  /**
   * Main method to get comprehensive dashboard data
   */
  getComprehensiveDashboardData(): Observable<ComprehensiveDashboardData> {
    const permissions = this.getUserPermissions();

    // Collect all data calls based on permissions
    const calls: Array<Observable<any>> = [];
    const callTypes: string[] = [];

    // Always try to get basic overview
    calls.push(this.getOverview().pipe(catchError(err => {
      console.warn('[DashboardService] overview failed', err);
      return of({ success: false, data: null });
    })));
    callTypes.push('overview');

    // Physical progress data
    if (permissions.canViewProjets) {
      calls.push(this.projetService.getStats().pipe(catchError(err => of({ success: false, data: null }))));
      callTypes.push('projet_stats');
      
      calls.push(this.projetService.getAll().pipe(catchError(err => of({ success: false, data: [] }))));
      callTypes.push('projet_list');
    }

    if (permissions.canViewActions) {
      calls.push(this.actionService.getStats().pipe(catchError(err => of({ success: false, data: null }))));
      callTypes.push('action_stats');
      
      calls.push(this.actionService.getAll().pipe(catchError(err => of({ success: false, data: [] }))));
      callTypes.push('action_list');
    }

    if (permissions.canViewZones) {
      calls.push(this.zoneService.getStats().pipe(catchError(err => of({ success: false, data: null }))));
      callTypes.push('zone_stats');
      
      calls.push(this.zoneService.getAll().pipe(catchError(err => of({ success: false, data: [] }))));
      callTypes.push('zone_list');
    }

    // Budget data
    if (permissions.canViewBudget) {
      calls.push(this.suiviBudgetService.getBudgetExecutionSummary().pipe(catchError(err => of({ success: false, data: null }))));
      callTypes.push('budget_summary');
      
      calls.push(this.suiviBudgetService.getAll().pipe(catchError(err => of({ success: false, data: [] }))));
      callTypes.push('budget_list');
    }

    // Cadre logique data
    if (permissions.canViewCadreLogique) {
      calls.push(this.cadreLogiqueService.getStats().pipe(catchError(err => of({ success: false, data: null }))));
      callTypes.push('cadre_stats');
      
      calls.push(this.cadreLogiqueService.getAll().pipe(catchError(err => of({ success: false, data: [] }))));
      callTypes.push('cadre_list');
    }

    // Indicators data
    if (permissions.canViewIndicateurs) {
      calls.push(this.indicateurService.getStats().pipe(catchError(err => of({ success: false, data: null }))));
      callTypes.push('indicateur_stats');
      
      calls.push(this.indicateurService.getAll().pipe(catchError(err => of({ success: false, data: [] }))));
      callTypes.push('indicateur_list');
      
      calls.push(this.suiviIndicateurService.getAll().pipe(catchError(err => of({ success: false, data: [] }))));
      callTypes.push('mesures_list');
    }

    // Users data (optional)
    if (permissions.canViewUsers) {
      calls.push(this.userService.getStats().pipe(catchError(err => of({ success: false, data: null }))));
      callTypes.push('user_stats');
    }

    // Execute all calls and process results
    return forkJoin(calls).pipe(
      tap(raw => console.debug('[DashboardService] raw responses:', raw, 'call types:', callTypes)),
      map(results => {
        const processed = this.processComprehensiveResults(results, callTypes, permissions);
        return processed;
      }),
      catchError(err => {
        console.error('[DashboardService] unexpected error:', err);
        return of(this.getEmptyComprehensiveDashboard(permissions));
      })
    );
  }

  private getUserPermissions() {
    return {
      canViewProjets: this.accessControl.canAccess('projets', 'read'),
      canViewActions: this.accessControl.canAccess('actions', 'read'),
      canViewIndicateurs: this.accessControl.canAccess('indicateurs', 'read'),
      canViewBudget: this.accessControl.canAccess('suiviBudgets', 'read'),
      canViewUsers: this.accessControl.canAccess('users', 'read'),
      canViewJournal: this.accessControl.canAccess('journal', 'read'),
      canViewReports: this.accessControl.canAccess('rapports', 'read'),
      canViewDocuments: this.accessControl.canAccess('documents', 'read'),
      canViewPlansAnnuels: this.accessControl.canAccess('plansAnnuels', 'read'),
      canViewZones: this.accessControl.canAccess('zones', 'read'),
      canViewCadreLogique: this.accessControl.canAccess('cadreLogique', 'read')
    };
  }

  private processComprehensiveResults(results: any[], callTypes: string[], permissions: any): ComprehensiveDashboardData {
    const resultMap: { [key: string]: any } = {};
    
    // Map results to call types
    callTypes.forEach((type, index) => {
      resultMap[type] = results[index];
    });

    // Apply user region filtering early so all subsequent processing uses scoped data
    this.applyUserZoneFilter(resultMap);

    // Process physical progress data
    const suiviPhysique = this.processSuiviPhysique(resultMap);
    
    // Process budget data
    const suiviBudgetaire = this.processSuiviBudgetaire(resultMap);
    
    // Process cadre logique data
    const suiviCadreLogique = this.processSuiviCadreLogique(resultMap);
    
    // Build overview
    const overview = this.buildComprehensiveOverview(resultMap, suiviPhysique, suiviBudgetaire, suiviCadreLogique);
    
    // Build trends
    const trends = this.buildComprehensiveTrends(resultMap, suiviPhysique, suiviBudgetaire, suiviCadreLogique);

    return {
      overview,
      suivi_physique: suiviPhysique,
      suivi_budgetaire: suiviBudgetaire,
      suivi_cadre_logique: suiviCadreLogique,
      trends,
      permissions,
      metadata: {
        last_updated: new Date(),
        data_freshness: {
          actions: new Date(),
          projets: new Date(),
          budget: new Date(),
          indicators: new Date()
        }
      }
    };
  }

  /**
   * Filter resultMap data so action-related lists and budget entries for actions are
   * restricted to provinces/communes assigned to the logged-in user.
   */
  private applyUserZoneFilter(resultMap: { [key: string]: any }): void {
    try {
      const currentUser = this.authService.getCurrentUser ? this.authService.getCurrentUser() : null;
      if (!currentUser) return;

      const userProvinces: string[] = Array.isArray(currentUser.provinces) ? currentUser.provinces.map(String).map(s => s.trim()).filter(Boolean) : [];
      const userCommunes: string[] = Array.isArray(currentUser.communes) ? currentUser.communes.map(String).map(s => s.trim()).filter(Boolean) : [];

      // If user has no region constraints, do nothing.
      if (userProvinces.length === 0 && userCommunes.length === 0) return;

      const matchesRegion = (item: any): boolean => {
        if (!item) return false;
        const prov = String(item.province || item.province_name || item.province_origine || item.projet_province || '').trim();
        const comm = String(item.commune || item.commune_name || item.commune_origine || item.projet_commune || '').trim();

        const provMatch = userProvinces.length === 0 ? false : (!!prov && userProvinces.includes(prov));
        const commMatch = userCommunes.length === 0 ? false : (!!comm && userCommunes.includes(comm));
        return provMatch || commMatch;
      };

      // Filter action list if present
      if (resultMap['action_list'] && Array.isArray(resultMap['action_list'].data)) {
        const original = resultMap['action_list'].data || [];
        resultMap['action_list'].data = original.filter(matchesRegion);
      }

      // Filter any budget list so action budgets are scoped to user's regions
      if (resultMap['budget_list'] && Array.isArray(resultMap['budget_list'].data)) {
        const originalBudgets = resultMap['budget_list'].data || [];
        // Keep project budgets as-is, but for action budgets enforce region matching
        resultMap['budget_list'].data = originalBudgets.filter((b: any) => {
          if (!b) return false;
          if (String(b.type_budget || '').toLowerCase() === 'action') {
            return matchesRegion(b);
          }
          // keep projet budgets
          return true;
        });
      }

      // Also filter any top_actions_by_budget nested structures returned directly in other calls
      if (resultMap['budget_summary'] && resultMap['budget_summary'].data) {
        const bs = resultMap['budget_summary'].data;
        if (Array.isArray(bs.top_actions_by_budget)) {
          bs.top_actions_by_budget = bs.top_actions_by_budget.filter(matchesRegion);
        }
        if (Array.isArray(bs.actions)) {
          bs.actions = bs.actions.filter(matchesRegion);
        }
      }

      // If action_stats exist but are aggregated server-side, we leave them as-is.
      // The processing layer will compute fresh aggregates from the filtered action_list when available.
    } catch (err) {
      console.warn('[DashboardService] applyUserZoneFilter failed', err);
    }
  }

  private processSuiviPhysique(resultMap: { [key: string]: any }): SuiviPhysiqueData {
    const actionStats = resultMap['action_stats']?.data ?? {};
    const actionList = resultMap['action_list']?.data ?? [];
    const projetStats = resultMap['projet_stats']?.data ?? {};
    const projetList = resultMap['projet_list']?.data ?? [];
    const zoneStats = resultMap['zone_stats']?.data ?? {};
    const zoneList = resultMap['zone_list']?.data ?? [];

    // If we have an actionList (possibly filtered by user regions), compute totals from it
    let actionsTotal = 0;
    let actionsCompleted = 0;
    let actionsInProgress = 0;
    let actionsPlanned = 0;
    let actionParStatut: any = {};

    if (Array.isArray(actionList) && actionList.length > 0) {
      actionsTotal = actionList.length;
      actionsCompleted = actionList.filter((a: any) => {
        const st = String(a.statut || '').toLowerCase();
        return st === 'terminée' || st === 'terminé' || st === 'termines' || st === 'terminée' || st === 'terminé' || st === 'termines' || st === 'terminee';
      }).length;
      actionsInProgress = actionList.filter((a: any) => String(a.statut || '').toLowerCase() === 'en cours').length;
      actionsPlanned = actionList.filter((a: any) => {
        const st = String(a.statut || '').toLowerCase();
        return st === 'planifiée' || st === 'planifié' || st === 'planifie' || st === 'planifiee';
      }).length;

      // build a basic par_statut map from the list for downstream uses if needed
      actionList.forEach((a: any) => {
        const key = String(a.statut || 'Inconnu');
        actionParStatut[key] = (actionParStatut[key] || 0) + 1;
      });
    } else {
      // fallback to server-provided stats when actionList isn't available
      actionsTotal = actionStats.total ?? actionStats.totalActions ?? 0;
      actionParStatut = actionStats.par_statut ?? actionStats.byStatus ?? actionStats.by_statut ?? {};
      actionsCompleted = this.getStatValue(actionParStatut, ['Terminée', 'Terminés', 'Terminé']) || 0;
      actionsInProgress = this.getStatValue(actionParStatut, ['En cours']) || 0;
      actionsPlanned = this.getStatValue(actionParStatut, ['Planifiée', 'Planifié']) || 0;
    }

    // Process projects data
    const projetsTotal = projetStats.total ?? 0;
    const projetsCompleted = this.getStatValue(projetStats.par_statut, ['Terminé', 'Terminés']) || 0;
    const projetsInProgress = this.getStatValue(projetStats.par_statut, ['En cours']) || 0;
    const projetsPlanned = this.getStatValue(projetStats.par_statut, ['Planifié']) || 0;

    // Process zones data
    const zonesTotal = zoneStats.total ?? zoneList.length ?? 0;
    const provinceCounts = zoneStats.par_province ?? {};

    // Find recent updates and critical items (operate on filtered actionList if present)
    const recentActions = (actionList || [])
      .filter((a: any) => a && Number(a.quantite_realisee || 0) > 0)
      .sort((a: any, b: any) => new Date(b.date_creation || b.created_at || 0).getTime() - new Date(a.date_creation || a.created_at || 0).getTime())
      .slice(0, 5);

    const criticalActions = (actionList || [])
      .filter((a: any) => {
        const progress = this.calculateProgress(Number(a.quantite_realisee || 0), Number(a.quantite_prevue || 0));
        return progress < 25 && String(a.statut || '').toLowerCase() === 'en cours';
      })
      .slice(0, 5);

    const recentProjects = (projetList || [])
      .sort((a: any, b: any) => new Date(b.date_creation || b.date_debut || 0).getTime() - new Date(a.date_creation || a.date_debut || 0).getTime())
      .slice(0, 5);

    const overdueProjects = (projetList || [])
      .filter((p: any) => {
        if (!p.date_fin) return false;
        const endDate = new Date(p.date_fin);
        return endDate < new Date() && String(p.statut || '').toLowerCase() !== 'terminé';
      })
      .slice(0, 5);
	
	 // Calculate actual progress for actions (operate on filtered actionList)
    let totalQuantitePrevue = 0;
    let totalQuantiteRealisee = 0;
    let actionsWithProgress = 0;

    (actionList || []).forEach((a: any) => {
      if (a.quantite_prevue && a.quantite_prevue > 0) {
        totalQuantitePrevue += Number(a.quantite_prevue);
        totalQuantiteRealisee += Number(a.quantite_realisee || 0);
        // Only count actions that have actual progress (quantite_realisee > 0)
        if (Number(a.quantite_realisee || 0) > 0) {
          actionsWithProgress++;
        }
      }
    });

    const physicalProgressRate = totalQuantitePrevue > 0 
      ? Math.round((totalQuantiteRealisee / totalQuantitePrevue) * 100) 
      : 0;
    
	
    // Calculate type volet breakdown from filtered actionList
    const cesActions = (actionList || []).filter((a: any) => a.type_volet === 'CES');
    const cepActions = (actionList || []).filter((a: any) => a.type_volet === 'CEP');

    return {
      actions: {
        total: actionsTotal,
        completed: actionsCompleted,
        in_progress: actionsInProgress,
        planned: actionsPlanned,
        completion_rate: this.calculatePercentage(actionsCompleted, actionsTotal),
        recent_updates: recentActions,
        par_type_volet: {
          CES: {
            total: cesActions.length,
            completed: cesActions.filter((a: any) => String(a.statut || '').toLowerCase() === 'terminée' || String(a.statut || '').toLowerCase() === 'terminé').length,
            completion_rate: this.calculatePercentage(
              cesActions.filter((a: any) => String(a.statut || '').toLowerCase() === 'terminée' || String(a.statut || '').toLowerCase() === 'terminé').length,
              cesActions.length
            )
          },
          CEP: {
            total: cepActions.length,
            completed: cepActions.filter((a: any) => String(a.statut || '').toLowerCase() === 'terminée' || String(a.statut || '').toLowerCase() === 'terminé').length,
            completion_rate: this.calculatePercentage(
              cepActions.filter((a: any) => String(a.statut || '').toLowerCase() === 'terminée' || String(a.statut || '').toLowerCase() === 'terminé').length,
              cepActions.length
            )
          }
        },
        critical_actions: criticalActions,
        physical_progress: {
          total_quantite_prevue: totalQuantitePrevue,
          total_quantite_realisee: totalQuantiteRealisee,
          physical_progress_rate: physicalProgressRate,
          actions_with_progress: actionsWithProgress
        }
      },
      projets: {
        total: projetsTotal,
        completed: projetsCompleted,
        in_progress: projetsInProgress,
        planned: projetsPlanned,
        completion_rate: this.calculatePercentage(projetsCompleted, projetsTotal),
        recent_projects: recentProjects,
        overdue_projects: overdueProjects
      },
      zones: {
        total: zonesTotal,
        active_zones: Object.keys(provinceCounts).length,
        par_province: provinceCounts,
        most_active_zone: this.getMostActiveProvince(provinceCounts)
      }
    };
  }

  private processSuiviBudgetaire(resultMap: { [key: string]: any }): SuiviBudgetaireData {
    const budgetSummary = resultMap['budget_summary']?.data ?? {};
    const budgetList = resultMap['budget_list']?.data ?? [];

    // Separate project and action budgets
    const projetBudgets = budgetList.filter((b: any) => b.type_budget === 'projet');
    const actionBudgets = budgetList.filter((b: any) => b.type_budget === 'action');

    // Global budget calculations
    const totalPrevu = budgetSummary.total_budget_prevu ?? budgetList.reduce((sum: number, b: any) => sum + (b.budget_prevu || 0), 0);
    const totalPaye = budgetSummary.total_montant_paye ?? budgetList.reduce((sum: number, b: any) => sum + (b.montant_paye || 0), 0);

    // Project budget calculations
    const budgetTotalProjets = projetBudgets.reduce((sum: number, b: any) => sum + (b.budget_prevu || 0), 0);
    const budgetPayeProjets = projetBudgets.reduce((sum: number, b: any) => sum + (b.montant_paye || 0), 0);

    // Action budget calculations
    const budgetTotalActions = actionBudgets.reduce((sum: number, b: any) => sum + (b.budget_prevu || 0), 0);
    const budgetPayeActions = actionBudgets.reduce((sum: number, b: any) => sum + (b.montant_paye || 0), 0);

    // Find overruns
    const projetsDepassement = projetBudgets
      .filter((b: any) => (b.montant_paye || 0) > (b.budget_prevu || 0))
      .slice(0, 5);

    const actionsDepassement = actionBudgets
      .filter((b: any) => (b.montant_paye || 0) > (b.budget_prevu || 0))
      .slice(0, 5);

    // Top budgets
    const topProjetsByBudget = projetBudgets
      .sort((a: any, b: any) => (b.budget_prevu || 0) - (a.budget_prevu || 0))
      .slice(0, 5);

    const topActionsByBudget = actionBudgets
      .sort((a: any, b: any) => (b.budget_prevu || 0) - (a.budget_prevu || 0))
      .slice(0, 5);

    return {
      budget_global: {
        total_prevu: totalPrevu,
        total_engage: budgetSummary.total_montant_engage ?? 0,
        total_paye: totalPaye,
        execution_rate: this.calculatePercentage(totalPaye, totalPrevu),
        remaining_budget: Math.max(0, totalPrevu - totalPaye)
      },
      projets: {
        nombre_projets_budgetises: projetBudgets.length,
        budget_total_projets: budgetTotalProjets,
        budget_paye_projets: budgetPayeProjets,
        execution_rate_projets: this.calculatePercentage(budgetPayeProjets, budgetTotalProjets),
        top_projets_by_budget: topProjetsByBudget
      },
      actions: {
        nombre_actions_budgetisees: actionBudgets.length,
        budget_total_actions: budgetTotalActions,
        budget_paye_actions: budgetPayeActions,
        execution_rate_actions: this.calculatePercentage(budgetPayeActions, budgetTotalActions),
        top_actions_by_budget: topActionsByBudget
      },
      ecarts: {
        ecart_total: totalPrevu - totalPaye,
        projets_depassement: projetsDepassement,
        actions_depassement: actionsDepassement
      },
      trends: {
        monthly_execution: this.generateMonthlyBudgetTrend(budgetList),
        execution_by_type: {
          projets: [budgetPayeProjets],
          actions: [budgetPayeActions],
          months: [new Date().toISOString().slice(0, 7)]
        }
      }
    };
  }

  private processSuiviCadreLogique(resultMap: { [key: string]: any }): SuiviCadreLogiqueData {
    const cadreStats = resultMap['cadre_stats']?.data ?? {};
    const cadreList = resultMap['cadre_list']?.data ?? [];
    const indicateurStats = resultMap['indicateur_stats']?.data ?? {};
    const indicateurList = resultMap['indicateur_list']?.data ?? [];
    const mesuresList = resultMap['mesures_list']?.data ?? [];

    // Process cadre logique elements
    const totalElements = cadreStats.total ?? cadreList.length ?? 0;
    const parNiveau = cadreStats.byLevel ?? {};
    
    // Count elements with indicators
    const elementsWithIndicators = cadreList.filter((cl: any) => 
      indicateurList.some((ind: any) => ind.cadre_logique_id === cl.id_cadre)
    ).length;

    // Process indicators
    const indicateursTotal = indicateurStats.total ?? indicateurList.length ?? 0;
    const indicateursAtteints = this.getStatValue(indicateurStats.byStatus, ['Atteint', 'Atteints']) || 0;
    const indicateursModeres = this.getStatValue(indicateurStats.byStatus, ['Modéré', 'Modérés']) || 0;
    const indicateursEnRetard = this.getStatValue(indicateurStats.byStatus, ['Retard', 'En retard']) || 0;

    // Process measurements
    const totalMeasurements = mesuresList.length;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const measurementsThisMonth = mesuresList.filter((m: any) => {
      const measureDate = new Date(m.date_mesure);
      return measureDate >= thisMonthStart;
    }).length;

    const measurementsLastMonth = mesuresList.filter((m: any) => {
      const measureDate = new Date(m.date_mesure);
      return measureDate >= lastMonthStart && measureDate <= lastMonthEnd;
    }).length;

    // Recent measurements
    const recentMeasurements = mesuresList
      .sort((a: any, b: any) => new Date(b.date_mesure).getTime() - new Date(a.date_mesure).getTime())
      .slice(0, 10);

    // Critical indicators (low performance)
    const criticalIndicators = indicateurList
      .filter((ind: any) => {
        const progress = this.calculateProgress(ind.valeur_realisee, ind.valeur_cible);
        return progress < 30;
      })
      .slice(0, 5);

    // Most measured indicators
    const measurementCounts: { [key: number]: number } = {};
    mesuresList.forEach((m: any) => {
      measurementCounts[m.id_indicateur] = (measurementCounts[m.id_indicateur] || 0) + 1;
    });

    const mostMeasuredIndicators = Object.entries(measurementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([idStr, count]) => {
        const id = parseInt(idStr);
        const indicator = indicateurList.find((ind: any) => ind.id_indicateur === id);
        return { ...indicator, measurement_count: count };
      });

    // Performance analysis
    const bestPerforming = indicateurList
      .filter((ind: any) => {
        const progress = this.calculateProgress(ind.valeur_realisee, ind.valeur_cible);
        return progress >= 80;
      })
      .slice(0, 5);

    const worstPerforming = indicateurList
      .filter((ind: any) => {
        const progress = this.calculateProgress(ind.valeur_realisee, ind.valeur_cible);
        return progress < 25;
      })
      .slice(0, 5);

    return {
      cadre_logique: {
        total_elements: totalElements,
        par_niveau: {
          'Objectif global': parNiveau['Objectif global'] || 0,
          'Objectif spécifique': parNiveau['Objectif spécifique'] || 0,
          'Résultat': parNiveau['Résultat'] || 0,
          'Activité': parNiveau['Activité'] || 0
        },
        elements_with_indicators: elementsWithIndicators
      },
      indicateurs: {
        total: indicateursTotal,
        atteints: indicateursAtteints,
        moderes: indicateursModeres,
        en_retard: indicateursEnRetard,
        progression_moyenne: indicateurStats.averageProgress || 0,
        recent_measurements: recentMeasurements,
        critical_indicators: criticalIndicators
      },
      mesures: {
        total_measurements: totalMeasurements,
        measurements_this_month: measurementsThisMonth,
        measurements_last_month: measurementsLastMonth,
        trend_direction: measurementsThisMonth > measurementsLastMonth ? 'up' : 
                        measurementsThisMonth < measurementsLastMonth ? 'down' : 'stable',
        most_measured_indicators: mostMeasuredIndicators
      },
      performance: {
        best_performing_elements: bestPerforming,
        worst_performing_elements: worstPerforming,
        improvement_trends: [] // Could be enhanced with historical data
      }
    };
  }

  private buildComprehensiveOverview(
    resultMap: { [key: string]: any },
    physique: SuiviPhysiqueData,
    budgetaire: SuiviBudgetaireData,
    cadreLogique: SuiviCadreLogiqueData
  ): DashboardOverview {
    const overviewRaw = resultMap['overview']?.data ?? {};

    // Calculate health statuses
    const physicalHealth = this.calculateHealthStatus([
      physique.actions.completion_rate,
      physique.projets.completion_rate
    ]);

    const budgetHealth = this.calculateHealthStatus([
      budgetaire.budget_global.execution_rate
    ]);

    const indicatorHealth = this.calculateHealthStatus([
      cadreLogique.indicateurs.progression_moyenne
    ]);

    return {
      total_projets: physique.projets.total,
      total_actions: physique.actions.total,
      total_indicateurs: cadreLogique.indicateurs.total,
      total_zones: physique.zones.total,
      total_users: resultMap['user_stats']?.data?.total || 0,
      budget_total: budgetaire.budget_global.total_prevu,
      budget_utilise: budgetaire.budget_global.total_paye,
      pourcentage_execution: budgetaire.budget_global.execution_rate,
      
      overall_physical_progress: (physique.actions.completion_rate + physique.projets.completion_rate) / 2,
      overall_budget_execution: budgetaire.budget_global.execution_rate,
      overall_indicator_achievement: cadreLogique.indicateurs.progression_moyenne,
      
      health_status: {
        physical: physicalHealth,
        budget: budgetHealth,
        indicators: indicatorHealth
      }
    };
  }

  private buildComprehensiveTrends(
    resultMap: { [key: string]: any },
    physique: SuiviPhysiqueData,
    budgetaire: SuiviBudgetaireData,
    cadreLogique: SuiviCadreLogiqueData
  ): DashboardTrends {
    // Generate last 6 months labels
    const labels = this.generateMonthLabels(6);

    return {
      physical_trends: {
        labels,
        actions_completed: [physique.actions.completed], // Would be enhanced with historical data
        projets_completed: [physique.projets.completed]
      },
      budget_trends: {
        labels,
        budget_executed: [budgetaire.budget_global.total_paye],
        cumulative_execution: [budgetaire.budget_global.execution_rate]
      },
      indicator_trends: {
        labels,
        measurements_count: [cadreLogique.mesures.measurements_this_month],
        achievement_rate: [cadreLogique.indicateurs.progression_moyenne]
      },
      performance_indicators: {
        physical_completion_rate: (physique.actions.completion_rate + physique.projets.completion_rate) / 2,
        budget_execution_rate: budgetaire.budget_global.execution_rate,
        indicator_achievement_rate: cadreLogique.indicateurs.progression_moyenne,
        overall_performance_score: this.calculateOverallScore([
          (physique.actions.completion_rate + physique.projets.completion_rate) / 2,
          budgetaire.budget_global.execution_rate,
          cadreLogique.indicateurs.progression_moyenne
        ])
      }
    };
  }

  // Helper methods
  private getOverview(): Observable<any> {
    return this.http.get(`${this.baseUrl}/overview`).pipe(
      catchError(() => of({ success: false, data: null }))
    );
  }

  private getStatValue(statMap: any, keys: string[]): number {
    if (!statMap) return 0;
    return keys.reduce((sum, key) => sum + (statMap[key] || 0), 0);
  }

  private calculateProgress(achieved: number, target: number): number {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((achieved / target) * 100), 100);
  }

  private calculatePercentage(numerator: number, denominator: number): number {
    if (!denominator || denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100);
  }

  private getMostActiveProvince(provinceCounts: Record<string, number>): string {
    const entries = Object.entries(provinceCounts);
    if (entries.length === 0) return '';
    return entries.reduce((max, [province, count]) => 
      count > provinceCounts[max] ? province : max, entries[0][0]);
  }

  private generateMonthlyBudgetTrend(budgetList: any[]): Array<{month: string; budget_paye: number}> {
    // Simple implementation - would be enhanced with actual historical data
    const currentMonth = new Date().toISOString().slice(0, 7);
    const totalPaye = budgetList.reduce((sum, b) => sum + (b.montant_paye || 0), 0);
    
    return [{ month: currentMonth, budget_paye: totalPaye }];
  }

  private calculateHealthStatus(values: number[]): 'good' | 'warning' | 'critical' {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (average >= 70) return 'good';
    if (average >= 40) return 'warning';
    return 'critical';
  }

  private generateMonthLabels(count: number): string[] {
    const labels: string[] = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }));
    }
    
    return labels;
  }

  private calculateOverallScore(scores: number[]): number {
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  private getEmptyComprehensiveDashboard(permissions: any): ComprehensiveDashboardData {
    return {
      overview: {
        total_projets: 0,
        total_actions: 0,
        total_indicateurs: 0,
        total_zones: 0,
        total_users: 0,
        budget_total: 0,
        budget_utilise: 0,
        pourcentage_execution: 0,
        overall_physical_progress: 0,
        overall_budget_execution: 0,
        overall_indicator_achievement: 0,
        health_status: {
          physical: 'critical',
          budget: 'critical',
          indicators: 'critical'
        }
      },
      suivi_physique: {
        actions: {
          total: 0, completed: 0, in_progress: 0, planned: 0, completion_rate: 0,
          recent_updates: [], critical_actions: [],
          par_type_volet: {
            CES: { total: 0, completed: 0, completion_rate: 0 },
            CEP: { total: 0, completed: 0, completion_rate: 0 }
          },
		   physical_progress: {
            total_quantite_prevue: 0,
            total_quantite_realisee: 0,
            physical_progress_rate: 0,
            actions_with_progress: 0
          }
        },
        projets: {
          total: 0, completed: 0, in_progress: 0, planned: 0, completion_rate: 0,
          recent_projects: [], overdue_projects: []
        },
        zones: {
          total: 0, active_zones: 0, par_province: {}, most_active_zone: ''
        }
      },
      suivi_budgetaire: {
        budget_global: {
          total_prevu: 0, total_engage: 0, total_paye: 0, execution_rate: 0, remaining_budget: 0
        },
        projets: {
          nombre_projets_budgetises: 0, budget_total_projets: 0, budget_paye_projets: 0,
          execution_rate_projets: 0, top_projets_by_budget: []
        },
        actions: {
          nombre_actions_budgetisees: 0, budget_total_actions: 0, budget_paye_actions: 0,
          execution_rate_actions: 0, top_actions_by_budget: []
        },
        ecarts: {
          ecart_total: 0, projets_depassement: [], actions_depassement: []
        },
        trends: {
          monthly_execution: [],
          execution_by_type: { projets: [], actions: [], months: [] }
        }
      },
      suivi_cadre_logique: {
        cadre_logique: {
          total_elements: 0,
          par_niveau: {
            'Objectif global': 0,
            'Objectif spécifique': 0,
            'Résultat': 0,
            'Activité': 0
          },
          elements_with_indicators: 0
        },
        indicateurs: {
          total: 0, atteints: 0, moderes: 0, en_retard: 0, progression_moyenne: 0,
          recent_measurements: [], critical_indicators: []
        },
        mesures: {
          total_measurements: 0, measurements_this_month: 0, measurements_last_month: 0,
          trend_direction: 'stable', most_measured_indicators: []
        },
        performance: {
          best_performing_elements: [], worst_performing_elements: [], improvement_trends: []
        }
      },
      trends: {
        physical_trends: { labels: [], actions_completed: [], projets_completed: [] },
        budget_trends: { labels: [], budget_executed: [], cumulative_execution: [] },
        indicator_trends: { labels: [], measurements_count: [], achievement_rate: [] },
        performance_indicators: {
          physical_completion_rate: 0, budget_execution_rate: 0, indicator_achievement_rate: 0, overall_performance_score: 0
        }
      },
      permissions,
      metadata: {
        last_updated: new Date(),
        data_freshness: {
          actions: new Date(),
          projets: new Date(),
          budget: new Date(),
          indicators: new Date()
        }
      }
    };
  }
}