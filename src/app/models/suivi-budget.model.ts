export interface SuiviBudget {
  id_budget: number;
  id_action?: number | null;
  id_projet?: number | null;
  type_budget: 'projet' | 'action';
  budget_prevu: number;
  montant_paye: number;
  ecart?: number | null;
  observations?: string | null;
  date_entree?: string | null;

  // Joined fields returned by backend
  action_type?: string;
  action_quantite?: number;
  action_unite?: string;
  projet_titre?: string;
  projet_id?: number;
}

export interface CreateBudgetRequest {
  id_action?: number | null;
  id_projet?: number | null;
  type_budget: 'projet' | 'action';
  budget_prevu: number;
  montant_paye?: number;
  date_entree?: string | null;
  observations?: string;
}

export interface BudgetSummary {
  total_budget_prevu: number;
  total_montant_paye: number;
  total_ecart: number;
  nombre_projets?: number;
  nombre_actions?: number;
}