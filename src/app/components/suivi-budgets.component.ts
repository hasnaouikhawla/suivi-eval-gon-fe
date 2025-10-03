import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SuiviBudgetService, SuiviBudgetFilters, ApiResponse } from '../services/suivi-budget.service';
import { actionService } from '../services/action.service';
import { ProjetService } from '../services/projet.service';
import { SuiviBudget, BudgetSummary } from '../models/suivi-budget.model';
import { Action } from '../models/action.model';
import { Projet } from '../models/projet.model';
import { SuiviBudgetFormComponent } from './suivi-budget-form.component';
import { AccessControlService } from '../services/access-control.service';

interface BudgetOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-suivi-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, SuiviBudgetFormComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Tab Navigation Header -->
    <div class="bg-gray-100 shadow-none border-none">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-6">
          <!-- Main Title -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Suivi des Budgets</h1>
            <p class="mt-1 text-sm text-gray-600">
              Suivi du budget et des paiements par projet et action
            </p>
          </div>

          <!-- Tab Navigation -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <!-- Tab Navigation -->
              <nav class="flex space-x-6" aria-label="Tabs">
                <button
                  type="button"
                  (click)="switchToTab('projets')"
                  [class]="getTabClass('projets')"
                  class="group whitespace-nowrap py-2 px-1 border-b-2 font-medium text-lg transition-all duration-200 ease-in-out">
                  <div class="flex items-center">
                    <svg class="w-6 h-6 mr-2 transition-colors" 
                         [class]="getTabIconClass('projets')"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    Budgets Projet
                    <span *ngIf="projetBudgetsCount !== null" 
                          [class]="getBadgeClass('projets')"
                          class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200">
                      {{ projetBudgetsCount }}
                    </span>
                  </div>
                </button>
                
                <button
                  type="button"
                  (click)="switchToTab('actions')"
                  [class]="getTabClass('actions')"
                  class="group whitespace-nowrap py-2 px-1 border-b-2 font-medium text-lg transition-all duration-200 ease-in-out">
                  <div class="flex items-center">
                    <svg class="w-6 h-6 mr-2 transition-colors" 
                         [class]="getTabIconClass('actions')"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Budgets Action
                    <span *ngIf="actionBudgetsCount !== null" 
                          [class]="getBadgeClass('actions')"
                          class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200">
                      {{ actionBudgetsCount }}
                    </span>
                  </div>
                </button>
              </nav>
            </div>

            <!-- Right side content -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <!-- Create Button for Current Tab -->
              <button
                *ngIf="canCreateSuiviBudgets"
                type="button"
                (click)="openCreateModal()"
                class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                {{ activeTab === 'projets' ? 'Nouveau Budget Projet' : 'Nouveau Budget Action' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-content-container" #tabContainer>
      <!-- Budget Summary Cards -->
      <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-100">
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <!-- Budget Total Prévu -->
          <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div class="px-3 py-3 sm:p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="text-xs font-medium text-gray-500 truncate">Budget Prévu</div>
                  <div class="text-base sm:text-lg font-bold text-blue-600">{{ formatCompactCurrency(getSummaryBudgetPrevu()) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Montant Payé -->
          <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div class="px-3 py-3 sm:p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="text-xs font-medium text-gray-500 truncate">Payé</div>
                  <div class="text-base sm:text-lg font-bold text-green-600">{{ formatCompactCurrency(currentTabSummary?.total_montant_paye || 0) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Écart -->
          <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div class="px-3 py-3 sm:p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                       [class.bg-red-100]="(currentTabSummary?.total_ecart || 0) < 0"
                       [class.bg-orange-100]="(currentTabSummary?.total_ecart || 0) >= 0">
                    <svg class="w-4 h-4" 
                         [class.text-red-600]="(currentTabSummary?.total_ecart || 0) < 0"
                         [class.text-orange-600]="(currentTabSummary?.total_ecart || 0) >= 0"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="text-xs font-medium text-gray-500 truncate">Écart</div>
                  <div class="text-base sm:text-lg font-bold"
                       [class.text-red-600]="(currentTabSummary?.total_ecart || 0) < 0"
                       [class.text-orange-600]="(currentTabSummary?.total_ecart || 0) >= 0">
                    {{ formatCompactCurrency(currentTabSummary?.total_ecart || 0) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Nombre d'Entrées -->
          <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div class="px-3 py-3 sm:p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                       [class.bg-blue-100]="activeTab === 'projets'"
                       [class.bg-indigo-100]="activeTab === 'actions'">
                    <svg class="w-4 h-4" 
                         [class.text-blue-600]="activeTab === 'projets'"
                         [class.text-indigo-600]="activeTab === 'actions'"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path *ngIf="activeTab === 'projets'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      <path *ngIf="activeTab === 'actions'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <div class="text-xs font-medium text-gray-500 truncate">{{ activeTab === 'projets' ? 'Projets' : 'Actions' }}</div>
                  <div class="text-base sm:text-lg font-bold"
                       [class.text-blue-600]="activeTab === 'projets'"
                       [class.text-indigo-600]="activeTab === 'actions'">
                    {{ getCurrentTabCount() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
          <div class="px-6 py-6 sm:p-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Filtres de recherche</h3>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
              <!-- Projet Filter (always show for both tabs) -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Projet
                </label>
                <div class="relative">
                  <select
                    [(ngModel)]="filters.id_projet"
                    (change)="loadCurrentTabBudgets()"
                    class="block w-full px-4 py-3 pr-10 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                           hover:border-gray-400 appearance-none bg-white">
                    <option [ngValue]="undefined">Tous les projets</option>
                    <option [value]="projet.id_projet" *ngFor="let projet of projets">
                      {{ projet.titre }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Action Filter (only show for actions tab) -->
              <div *ngIf="activeTab === 'actions'">
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Action
                </label>
                <div class="relative">
                  <select
                    [(ngModel)]="filters.id_action"
                    (change)="loadCurrentTabBudgets()"
                    class="block w-full px-4 py-3 pr-10 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                           hover:border-gray-400 appearance-none bg-white">
                    <option [ngValue]="undefined">Toutes les actions</option>
                    <optgroup *ngFor="let group of groupedActions" [label]="group.projet_titre">
                      <option [value]="action.id_action" *ngFor="let action of group.actions">
                        {{ action.type_action }}
                        <span *ngIf="action.quantite_prevue">({{ action.quantite_prevue }} {{ action.unite_mesure }})</span>
                      </option>
                    </optgroup>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Budget Min -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Budget Min
                </label>
                <div class="relative">
                  <select
                    [(ngModel)]="filters.min_budget"
                    (change)="loadCurrentTabBudgets()"
                    class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                           hover:border-gray-400 appearance-none bg-white">
                    <option [ngValue]="undefined">Aucun minimum</option>
                    <option [value]="option.value" *ngFor="let option of budgetOptions">
                      {{ option.label }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Budget Max -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Budget Max
                </label>
                <div class="relative">
                  <select
                    [(ngModel)]="filters.max_budget"
                    (change)="loadCurrentTabBudgets()"
                    class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                           hover:border-gray-400 appearance-none bg-white">
                    <option [ngValue]="undefined">Aucun maximum</option>
                    <option [value]="option.value" *ngFor="let option of budgetOptions">
                      {{ option.label }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
              </div>
			 </div>

              <!-- Pre-selected Project Widget -->
<div *ngIf="hasUrlFilters() && filters.id_projet" class="mt-6 p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200 rounded-xl">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="flex-shrink-0">
        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <h4 class="text-sm font-semibold text-indigo-900">Projet sélectionné</h4>
        <p class="text-sm text-indigo-700 mt-1 truncate">
          {{ getSelectedProjectName() }}
        </p>
        <p class="text-xs text-indigo-600 mt-1">
          Les budgets {{ activeTab === 'projets' ? 'projet' : 'action' }} sont automatiquement filtrés pour ce projet
        </p>
      </div>
    </div>
  </div>
</div>

<div *ngIf="activeTab === 'actions' && filters.id_action" class="mt-6 p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200 rounded-xl">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <div class="flex-shrink-0">
        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <h4 class="text-sm font-semibold text-indigo-900">Action sélectionnée</h4>
        <p class="text-sm text-indigo-700 mt-1 truncate">
          {{ getSelectedActionName() }}
        </p>
        <p class="text-xs text-indigo-600 mt-1">
          Les budgets action sont automatiquement filtrés pour cette action
        </p>
      </div>
    </div>
  </div>
</div>

<!-- Clear Filters Button -->
<div class="mt-6 flex justify-end">
  <button
    type="button"
    (click)="clearFilters()"
    *ngIf="hasActiveFilters()"
    class="inline-flex items-center px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 ease-in-out">
    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
    Effacer les filtres
  </button>
</div>
            
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p class="mt-4 text-sm text-gray-500">Chargement des suivis budget...</p>
          </div>
        </div>

        <!-- Tab Content -->
        <div *ngIf="!loading" class="tab-content">
          <!-- Projets Tab Content -->
          <div *ngIf="activeTab === 'projets'" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <!-- Desktop Table View -->
            <div class="hidden lg:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payé</th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Écart</th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
                    <th *ngIf="canEditSuiviBudgets || canDeleteSuiviBudgets" class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let suiviBudget of currentTabBudgets" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-4">
                      <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0">
                          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                          </div>
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-medium text-gray-900">
                            {{ getBudgetDisplayName(suiviBudget) }}
                          </div>
                          <div class="text-xs text-gray-500 mt-1" *ngIf="suiviBudget.observations">
                            {{ suiviBudget.observations | slice:0:50 }}{{ suiviBudget.observations && suiviBudget.observations.length > 50 ? '...' : '' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="text-sm font-semibold text-blue-600">{{ formatCompactCurrency(suiviBudget.budget_prevu) }}</div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="text-sm font-semibold text-green-600">{{ formatCompactCurrency(suiviBudget.montant_paye) }}</div>
                      <div class="text-xs text-gray-500">
                        {{ getExecutionRate(suiviBudget) }}%
                      </div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="text-sm font-semibold"
                           [class.text-red-600]="(suiviBudget.ecart || 0) < 0"
                           [class.text-green-600]="(suiviBudget.ecart || 0) >= 0">
                        {{ formatCompactCurrency(suiviBudget.ecart || 0) }}
                      </div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="flex items-center">
                        <div class="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div class="h-2 rounded-full transition-all duration-300"
                               [class.bg-red-500]="getExecutionRate(suiviBudget) < 25"
                               [class.bg-yellow-500]="getExecutionRate(suiviBudget) >= 25 && getExecutionRate(suiviBudget) < 75"
                               [class.bg-green-500]="getExecutionRate(suiviBudget) >= 75"
                               [style.width.%]="Math.min(getExecutionRate(suiviBudget), 100)">
                          </div>
                        </div>
                        <span class="text-xs font-medium text-gray-700">{{ getExecutionRate(suiviBudget) }}%</span>
                      </div>
                    </td>
                    <td *ngIf="canEditSuiviBudgets || canDeleteSuiviBudgets" class="px-3 py-4 text-right">
                      <div class="flex justify-end space-x-1">
                        <button
                          *ngIf="canEditSuiviBudgets"
                          type="button"
                          (click)="openEditModal(suiviBudget)"
                          class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          *ngIf="canDeleteSuiviBudgets"
                          type="button"
                          (click)="confirmDelete(suiviBudget)"
                          class="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="lg:hidden">
              <div class="divide-y divide-gray-200">
                <div *ngFor="let suiviBudget of currentTabBudgets" class="p-4 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                      </div>
                      <div class="min-w-0">
                        <h3 class="text-sm font-medium text-gray-900">{{ getBudgetDisplayName(suiviBudget) }}</h3>
                      </div>
                    </div>
                    <div class="ml-2 flex-shrink-0">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            [class.bg-red-100]="getExecutionRate(suiviBudget) < 25"
                            [class.text-red-800]="getExecutionRate(suiviBudget) < 25"
                            [class.bg-yellow-100]="getExecutionRate(suiviBudget) >= 25 && getExecutionRate(suiviBudget) < 75"
                            [class.text-yellow-800]="getExecutionRate(suiviBudget) >= 25 && getExecutionRate(suiviBudget) < 75"
                            [class.bg-green-100]="getExecutionRate(suiviBudget) >= 75"
                            [class.text-green-800]="getExecutionRate(suiviBudget) >= 75">
                        {{ getExecutionRate(suiviBudget) }}% exécuté
                      </span>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span class="font-medium">Budget Prévu:</span>
                      <div class="font-semibold text-blue-600">{{ formatCompactCurrency(suiviBudget.budget_prevu) }}</div>
                    </div>
                    <div>
                      <span class="font-medium">Montant Payé:</span>
                      <div class="font-semibold text-green-600">{{ formatCompactCurrency(suiviBudget.montant_paye) }}</div>
                    </div>
                    <div class="col-span-2">
                      <span class="font-medium">Écart:</span>
                      <div class="font-semibold"
                           [class.text-red-600]="(suiviBudget.ecart || 0) < 0"
                           [class.text-green-600]="(suiviBudget.ecart || 0) >= 0">
                        {{ formatCompactCurrency(suiviBudget.ecart || 0) }}
                      </div>
                    </div>
                  </div>

                  <div *ngIf="suiviBudget.observations" class="text-xs text-gray-500 mb-3">
                    {{ suiviBudget.observations }}
                  </div>
                  
                  <div class="flex justify-end space-x-2" *ngIf="canEditSuiviBudgets || canDeleteSuiviBudgets">
                    <button
                      *ngIf="canEditSuiviBudgets"
                      type="button"
                      (click)="openEditModal(suiviBudget)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Modifier
                    </button>
                    <button
                      *ngIf="canDeleteSuiviBudgets"
                      type="button"
                      (click)="confirmDelete(suiviBudget)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Tab Content -->
          <div *ngIf="activeTab === 'actions'" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <!-- Desktop Table View -->
            <div class="hidden lg:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payé</th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Écart</th>
                    <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
                    <th *ngIf="canEditSuiviBudgets || canDeleteSuiviBudgets" class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let suiviBudget of currentTabBudgets" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-4">
                      <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0">
                          <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                          </div>
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-medium text-gray-900">{{ getBudgetDisplayName(suiviBudget) }}</div>
                          <div class="text-xs text-gray-500">
                            <div><strong>Projet:</strong> {{ suiviBudget.projet_titre || 'Projet inconnu' }}</div>
                            <div *ngIf="suiviBudget.action_quantite">
                              <strong>Quantité:</strong> {{ suiviBudget.action_quantite }} {{ suiviBudget.action_unite }}
                            </div>
                          </div>
                          <div class="text-xs text-gray-500 mt-1" *ngIf="suiviBudget.observations">
                            {{ suiviBudget.observations | slice:0:50 }}{{ suiviBudget.observations && suiviBudget.observations.length > 50 ? '...' : '' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="text-sm font-semibold text-blue-600">{{ formatCompactCurrency(suiviBudget.budget_prevu) }}</div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="text-sm font-semibold text-green-600">{{ formatCompactCurrency(suiviBudget.montant_paye) }}</div>
                      <div class="text-xs text-gray-500">
                        {{ getExecutionRate(suiviBudget) }}%
                      </div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="text-sm font-semibold"
                           [class.text-red-600]="(suiviBudget.ecart || 0) < 0"
                           [class.text-green-600]="(suiviBudget.ecart || 0) >= 0">
                        {{ formatCompactCurrency(suiviBudget.ecart || 0) }}
                      </div>
                    </td>
                    <td class="px-3 py-4">
                      <div class="flex items-center">
                        <div class="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div class="h-2 rounded-full transition-all duration-300"
                               [class.bg-red-500]="getExecutionRate(suiviBudget) < 25"
                               [class.bg-yellow-500]="getExecutionRate(suiviBudget) >= 25 && getExecutionRate(suiviBudget) < 75"
                               [class.bg-green-500]="getExecutionRate(suiviBudget) >= 75"
                               [style.width.%]="Math.min(getExecutionRate(suiviBudget), 100)">
                          </div>
                        </div>
                        <span class="text-xs font-medium text-gray-700">{{ getExecutionRate(suiviBudget) }}%</span>
                      </div>
                    </td>
                    <td *ngIf="canEditSuiviBudgets || canDeleteSuiviBudgets" class="px-3 py-4 text-right">
                      <div class="flex justify-end space-x-1">
                        <button
                          *ngIf="canEditSuiviBudgets"
                          type="button"
                          (click)="openEditModal(suiviBudget)"
                          class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button
                          *ngIf="canDeleteSuiviBudgets"
                          type="button"
                          (click)="confirmDelete(suiviBudget)"
                          class="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="lg:hidden">
              <div class="divide-y divide-gray-200">
                <div *ngFor="let suiviBudget of currentTabBudgets" class="p-4 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                        </div>
                      </div>
                      <div class="min-w-0">
                        <h3 class="text-sm font-medium text-gray-900">{{ getBudgetDisplayName(suiviBudget) }}</h3>
                        <div class="text-xs text-gray-500">
                          <div><strong>Projet:</strong> {{ suiviBudget.projet_titre || 'Projet inconnu' }}</div>
                          <div *ngIf="suiviBudget.action_quantite">
                            <strong>Quantité:</strong> {{ suiviBudget.action_quantite }} {{ suiviBudget.action_unite }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="ml-2 flex-shrink-0">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            [class.bg-red-100]="getExecutionRate(suiviBudget) < 25"
                            [class.text-red-800]="getExecutionRate(suiviBudget) < 25"
                            [class.bg-yellow-100]="getExecutionRate(suiviBudget) >= 25 && getExecutionRate(suiviBudget) < 75"
                            [class.text-yellow-800]="getExecutionRate(suiviBudget) >= 25 && getExecutionRate(suiviBudget) < 75"
                            [class.bg-green-100]="getExecutionRate(suiviBudget) >= 75"
                            [class.text-green-800]="getExecutionRate(suiviBudget) >= 75">
                        {{ getExecutionRate(suiviBudget) }}% exécuté
                      </span>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span class="font-medium">Budget Prévu:</span>
                      <div class="font-semibold text-blue-600">{{ formatCompactCurrency(suiviBudget.budget_prevu) }}</div>
                    </div>
                    <div>
                      <span class="font-medium">Montant Payé:</span>
                      <div class="font-semibold text-green-600">{{ formatCompactCurrency(suiviBudget.montant_paye) }}</div>
                    </div>
                    <div class="col-span-2">
                      <span class="font-medium">Écart:</span>
                      <div class="font-semibold"
                           [class.text-red-600]="(suiviBudget.ecart || 0) < 0"
                           [class.text-green-600]="(suiviBudget.ecart || 0) >= 0">
                        {{ formatCompactCurrency(suiviBudget.ecart || 0) }}
                      </div>
                    </div>
                  </div>

                  <div *ngIf="suiviBudget.observations" class="text-xs text-gray-500 mb-3">
                    {{ suiviBudget.observations }}
                  </div>
                  
                  <div class="flex justify-end space-x-2" *ngIf="canEditSuiviBudgets || canDeleteSuiviBudgets">
                    <button
                      *ngIf="canEditSuiviBudgets"
                      type="button"
                      (click)="openEditModal(suiviBudget)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Modifier
                    </button>
                    <button
                      *ngIf="canDeleteSuiviBudgets"
                      type="button"
                      (click)="confirmDelete(suiviBudget)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="currentTabBudgets.length === 0" class="bg-white shadow-sm rounded-lg border border-gray-200 text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun budget {{ activeTab === 'projets' ? 'projet' : 'action' }} trouvé</h3>
            <p class="mt-2 text-sm text-gray-500">
              <span *ngIf="canCreateSuiviBudgets">Commencez par créer un nouveau budget {{ activeTab === 'projets' ? 'projet' : 'action' }} ou ajustez vos filtres.</span>
              <span *ngIf="!canCreateSuiviBudgets">Aucun budget {{ activeTab === 'projets' ? 'projet' : 'action' }} disponible avec les filtres actuels.</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Tab Navigation -->
    <div class="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-1 flex">
        <button
          type="button"
          (click)="switchToTab('projets')"
          [class]="getMobileTabClass('projets')"
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          Projets
        </button>
        <button
          type="button"
          (click)="switchToTab('actions')"
          [class]="getMobileTabClass('actions')"
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Actions
        </button>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div *ngIf="isModalOpen && canCreateSuiviBudgets" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="closeModal($event)">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all animate-modal-content" 
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-900">
                  {{ modalMode === 'edit' ? 'Modifier Budget' : getCreateModalTitle() }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ modalMode === 'edit' ? 'Modifiez les informations de ce budget' : getCreateModalSubtitle() }}
                </p>
              </div>
              <button
                type="button"
                (click)="closeModal()"
                class="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Modal Body -->
          <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <app-suivi-budget-form
             [suiviBudget]="selectedSuiviBudget"
             [activeTab]="activeTab"
             [projetBudgets]="projetBudgets"
             [actionBudgets]="actionBudgets"
             [preselectedProjetId]="filters.id_projet || null"
             [preselectedActionId]="filters.id_action || null"
             (save)="onSuiviBudgetSaved($event)"
             (cancel)="closeModal()">
            </app-suivi-budget-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteConfirm && canDeleteSuiviBudgets" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="cancelDelete()">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl transform transition-all max-w-md w-full animate-modal-content" 
             (click)="$event.stopPropagation()">
          <div class="px-6 py-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
                <p class="mt-2 text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer ce budget ? Cette action ne peut pas être annulée.
                </p>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button
              type="button"
              (click)="cancelDelete()"
              class="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200">
              Annuler
            </button>
            <button
              type="button"
              (click)="deleteSuiviBudget()"
              [disabled]="deleting"
              class="px-4 py-2 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div *ngIf="successMessage" class="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg animate-fadeIn">
      <div class="flex">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ successMessage }}
      </div>
    </div>

    <div *ngIf="errorMessage" class="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg animate-fadeIn">
      <div class="flex">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .tab-content-container {
      width: 100%;
      position: relative;
    }

    .tab-content {
      width: 100%;
      min-height: calc(100vh - 200px);
      box-sizing: border-box;
    }

    @media (max-width: 640px) {
      .tab-content {
        min-height: calc(100vh - 160px);
      }
    }

    .tab-content {
      transition: opacity 0.2s ease-in-out;
    }

    @keyframes modal-overlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes modal-content {
      from { 
        opacity: 0; 
        transform: scale(0.95) translateY(-20px); 
      }
      to { 
        opacity: 1; 
        transform: scale(1) translateY(0); 
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-modal-overlay {
      animation: modal-overlay 0.2s ease-out;
    }
    
    .animate-modal-content {
      animation: modal-content 0.3s ease-out;
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .backdrop-blur-sm {
      backdrop-filter: blur(4px);
    }
  `]
})
export class SuiviBudgetsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tabContainer', { read: ElementRef }) tabContainer!: ElementRef;

  // Tab state
  activeTab: 'projets' | 'actions' = 'projets';
  
  // Data arrays
  suiviBudgets: SuiviBudget[] = [];
  projetBudgets: SuiviBudget[] = [];
  actionBudgets: SuiviBudget[] = [];
  actions: Action[] = [];
  groupedActions: { projet_titre: string; actions: Action[] }[] = [];
  projets: Projet[] = [];
  
  // Summary data
  budgetSummary: BudgetSummary | null = null;
  projetBudgetSummary: BudgetSummary | null = null;
  actionBudgetSummary: BudgetSummary | null = null;
  
  // Counts for badges
  projetBudgetsCount: number | null = null;
  actionBudgetsCount: number | null = null;
  
  loading = false;
  deleting = false;

  // Budget options for dropdowns
  budgetOptions: BudgetOption[] = [
    { label: '10K MAD', value: 10000 },
    { label: '50K MAD', value: 50000 },
    { label: '100K MAD', value: 100000 },
    { label: '250K MAD', value: 250000 },
    { label: '500K MAD', value: 500000 },
    { label: '1M MAD', value: 1000000 },
    { label: '2M MAD', value: 2000000 },
    { label: '5M MAD', value: 5000000 },
    { label: '10M MAD', value: 10000000 },
    { label: '25M MAD', value: 25000000 },
    { label: '50M MAD', value: 50000000 },
    { label: '100M MAD', value: 100000000 }
  ];

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Modal states
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedSuiviBudget: SuiviBudget | null = null;
  
  // Delete confirmation
  showDeleteConfirm = false;
  suiviBudgetToDelete: SuiviBudget | null = null;

  // Filters
  filters: SuiviBudgetFilters = {};

  // Permission properties
  canCreateSuiviBudgets = false;
  canEditSuiviBudgets = false;
  canDeleteSuiviBudgets = false;
  canManageBudgetExecution = false;

  // Subscriptions
  private subs: Subscription[] = [];

  // Expose Math for template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private suiviBudgetService: SuiviBudgetService,
    private actionService: actionService,
    private projetService: ProjetService,
    private accessControl: AccessControlService
  ) {}

  ngOnInit() {
  this.checkPermissions();
  this.loadProjets();
  this.loadActions();
  
  // Check for URL parameters and set filters before loading budgets
  this.route.queryParams.subscribe(params => {
    // Set filters first
    if (params['id_projet']) {
      const projetId = parseInt(params['id_projet'], 10);
      if (!isNaN(projetId)) {
        this.filters.id_projet = projetId;
      }
    }

    // Set action filter if provided in URL (handle links coming from Actions component)
    if (params['id_action']) {
      const actionId = parseInt(params['id_action'], 10);
      if (!isNaN(actionId)) {
        this.filters.id_action = actionId;
        // ensure the actions tab is active when we navigate with an action filter
        this.activeTab = 'actions';
      }
    }
    
    // Set tab after filters to ensure proper widget display
    if (params['tab'] === 'actions') {
      this.activeTab = 'actions';
    } else if (params['tab'] === 'projets') {
      this.activeTab = 'projets';
    }
    
    // Force change detection after setting filters
    setTimeout(() => {
      this.loadAllBudgets();
    }, 0);
  });
  }
  
  hasUrlFilters(): boolean {
  return !!(this.route.snapshot.queryParams['id_projet'] || this.route.snapshot.queryParams['id_action']);
  }

  getSelectedProjectName(): string {
  if (!this.filters.id_projet) return '';
  const projet = this.projets.find(p => p.id_projet === this.filters.id_projet);
  return projet ? `${projet.titre} — #${projet.id_projet}` : `Projet #${this.filters.id_projet}`;
  }
  
  getSelectedActionName(): string {
  if (!this.filters.id_action) return '';
  const id = Number(this.filters.id_action);
  if (!id || !this.actions || this.actions.length === 0) return `Action #${id}`;
  
  // Search in the flat actions array first
  let action = this.actions.find(a => Number(a.id_action) === id);
  
  // If not found in flat array, search in grouped actions
  if (!action && this.groupedActions) {
    for (const group of this.groupedActions) {
      action = group.actions.find(a => Number(a.id_action) === id);
      if (action) break;
    }
  }
  
  return action ? `${action.type_action} — #${action.id_action}` : `Action #${id}`;
  }

  ngAfterViewInit() {
    // Any post-view initialization if needed
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
  
  getSummaryBudgetPrevu(): number {
    const budgets = this.currentTabBudgets || [];
    const map = new Map<number, number>();

    if (this.activeTab === 'projets') {
      budgets.forEach((b: any) => {
        const pid = Number(b.id_projet ?? (b as any).projet_id ?? 0);
        if (!pid) return;
        if (!map.has(pid) && b.budget_prevu) {
          map.set(pid, Number(b.budget_prevu));
        }
      });
    } else {
      budgets.forEach((b: any) => {
        const aid = Number(b.id_action ?? 0);
        if (!aid) return;
        if (!map.has(aid) && b.budget_prevu) {
          map.set(aid, Number(b.budget_prevu));
        }
      });
    }

    return Array.from(map.values()).reduce((acc, v) => acc + (Number(v) || 0), 0);
  }

  private checkPermissions() {
    this.canCreateSuiviBudgets = this.accessControl.canAccess('suiviBudgets', 'create');
    this.canEditSuiviBudgets = this.accessControl.canAccess('suiviBudgets', 'update');
    this.canDeleteSuiviBudgets = this.accessControl.canAccess('suiviBudgets', 'delete');
    this.canManageBudgetExecution = this.accessControl.canAccess('suiviBudgets', 'budgetExecution');

    console.log('Suivi Budgets permissions:', {
      canCreate: this.canCreateSuiviBudgets,
      canEdit: this.canEditSuiviBudgets,
      canDelete: this.canDeleteSuiviBudgets,
      canManageBudgetExecution: this.canManageBudgetExecution
    });
  }

  switchToTab(tab: 'projets' | 'actions') {
  this.activeTab = tab;
  
  // Update URL parameters and clear inappropriate filters for each tab
  const currentParams = { ...this.route.snapshot.queryParams };
  
  if (tab === 'projets') {
    // When switching to projets tab, remove tab parameter and action-specific filters
    delete currentParams['tab'];
    delete currentParams['id_action'];
    // Clear the action filter from the component as well
    delete this.filters.id_action;
  } else if (tab === 'actions') {
    currentParams['tab'] = 'actions';
    // Keep action filter if it exists
  }
  
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: currentParams,
    replaceUrl: true
  });

  // Load budgets for the current tab
  this.loadCurrentTabBudgets();
  }

  get currentTabBudgets(): SuiviBudget[] {
    return this.activeTab === 'projets' ? this.projetBudgets : this.actionBudgets;
  }

  get currentTabSummary(): BudgetSummary | null {
    return this.activeTab === 'projets' ? this.projetBudgetSummary : this.actionBudgetSummary;
  }

  getCurrentTabCount(): number {
    return this.activeTab === 'projets' ? (this.projetBudgetsCount || 0) : (this.actionBudgetsCount || 0);
  }

  loadProjets() {
    const sub = this.projetService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.projets = response.data || [];
          console.log('Projets loaded:', this.projets);
        } else {
          console.warn('Projets response not successful:', response.message);
        }
      },
      error: (error: any) => {
        console.error('Error loading projets:', error);
      }
    });
    this.subs.push(sub);
  }

  loadActions() {
    const sub = this.actionService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.actions = response.data || [];
          this.groupActionsByProject();
          console.log('Actions loaded:', this.actions);
        } else {
          console.warn('Actions response not successful:', response.message);
        }
      },
      error: (error: any) => {
        console.error('Error loading actions:', error);
      }
    });
    this.subs.push(sub);
  }

  private groupActionsByProject() {
    const grouped: { [key: string]: { projet_titre: string; actions: Action[] } } = {};
    
    this.actions.forEach(action => {
      const projetTitre = action.projet_titre || 'Projet non défini';
      
      if (!grouped[projetTitre]) {
        grouped[projetTitre] = {
          projet_titre: projetTitre,
          actions: []
        };
      }
      
      grouped[projetTitre].actions.push(action);
    });

    this.groupedActions = Object.values(grouped).sort((a, b) => 
      a.projet_titre.localeCompare(b.projet_titre)
    );
  }

  loadAllBudgets() {
    this.loading = true;
    
    // Load both types of budgets
    Promise.all([
      this.loadBudgetsByType('projet'),
      this.loadBudgetsByType('action')
    ]).then(() => {
      this.updateCounts();
      this.loading = false;
    }).catch(error => {
      console.error('Error loading budgets:', error);
      this.showError('Erreur lors du chargement des budgets');
      this.loading = false;
    });
  }

  private loadBudgetsByType(type: 'projet' | 'action'): Promise<void> {
  return new Promise((resolve, reject) => {
    // Build filters specific to the requested type.
    // Ensure id_action is only sent when requesting action budgets.
    const typeFilters: SuiviBudgetFilters = {
      ...this.filters,
      type_budget: type
    };

    // If requesting project budgets, remove any action-specific filter.
    if (type === 'projet') {
      // @ts-ignore
      delete (typeFilters as any).id_action;
    }

    const sub = this.suiviBudgetService.getAll(typeFilters).subscribe({
      next: (response: any) => {
        if (response.success) {
          const budgets = response.data || [];
		  const parseTime = (d: any) => {
          const t = d ? new Date(d).getTime() : 0;
              return Number.isNaN(t) ? 0 : t;
          };
          budgets.sort((a: any, b: any) => parseTime(b.date_entree) - parseTime(a.date_entree));

          if (type === 'projet') {
            this.projetBudgets = budgets;
            this.loadProjetBudgetSummary();
          } else {
            this.actionBudgets = budgets;
            this.loadActionBudgetSummary();
          }
          resolve();
        } else {
          reject(new Error(response.message || `Erreur lors du chargement des budgets ${type}`));
        }
      },
      error: (error: any) => {
        reject(error);
      }
    });
    this.subs.push(sub);
  });
  }

  loadCurrentTabBudgets() {
    this.loading = true;
    this.loadBudgetsByType(this.activeTab === 'projets' ? 'projet' : 'action').then(() => {
      this.updateCounts();
      this.loading = false;
    }).catch(error => {
      console.error(`Error loading ${this.activeTab} budgets:`, error);
      this.showError(`Erreur lors du chargement des budgets ${this.activeTab}`);
      this.loading = false;
    });
  }

  private loadProjetBudgetSummary() {
    try {
      const budgets = this.projetBudgets || [];

      // Build a map of unique projet -> first encountered budget_prevu (treated as the constant project budget)
      const uniqueProjetBudget = new Map<number, number>();
      budgets.forEach((b: any) => {
        const pid = Number(b.id_projet ?? (b as any).projet_id ?? 0);
        if (!pid) return;
        // use first non-zero budget_prevu encountered for the project as the constant budget
        if (!uniqueProjetBudget.has(pid) && b.budget_prevu) {
          uniqueProjetBudget.set(pid, Number(b.budget_prevu));
        }
      });

      const total_budget_prevu = Array.from(uniqueProjetBudget.values()).reduce((acc, v) => acc + (Number(v) || 0), 0);
      const total_montant_paye = budgets.reduce((acc: number, b: any) => acc + Number(b.montant_paye || 0), 0);
      const total_ecart = total_budget_prevu - total_montant_paye;

      this.projetBudgetSummary = {
        total_budget_prevu,
        total_montant_paye,
        total_ecart,
        nombre_projets: uniqueProjetBudget.size
      };
    } catch (err) {
      console.error('Error computing projet budget summary:', err);
      this.projetBudgetSummary = null;
    }
  }

  private loadActionBudgetSummary() {
    try {
      const budgets = this.actionBudgets || [];

      // Build a map of unique action -> first encountered budget_prevu (treated as the constant action budget)
      const uniqueActionBudget = new Map<number, number>();
      budgets.forEach((b: any) => {
        const aid = Number(b.id_action ?? 0);
        if (!aid) return;
        if (!uniqueActionBudget.has(aid) && b.budget_prevu) {
          uniqueActionBudget.set(aid, Number(b.budget_prevu));
        }
      });

      const total_budget_prevu = Array.from(uniqueActionBudget.values()).reduce((acc, v) => acc + (Number(v) || 0), 0);
      const total_montant_paye = budgets.reduce((acc: number, b: any) => acc + Number(b.montant_paye || 0), 0);
      const total_ecart = total_budget_prevu - total_montant_paye;

      this.actionBudgetSummary = {
        total_budget_prevu,
        total_montant_paye,
        total_ecart,
        nombre_actions: uniqueActionBudget.size
      };
    } catch (err) {
      console.error('Error computing action budget summary:', err);
      this.actionBudgetSummary = null;
    }
  }

  private updateCounts() {
  // Count unique projets (some entries may use id_projet or projet_id depending on backend)
  const uniqueProjetIds = new Set<number>();
  for (const b of this.projetBudgets) {
    const pid = (b.id_projet ?? (b as any).projet_id) as number | undefined;
    if (pid && !Number.isNaN(Number(pid))) {
      uniqueProjetIds.add(Number(pid));
    }
  }
  this.projetBudgetsCount = uniqueProjetIds.size;

  // Count unique actions
  const uniqueActionIds = new Set<number>();
  for (const b of this.actionBudgets) {
    const aid = (b.id_action) as number | undefined;
    if (aid && !Number.isNaN(Number(aid))) {
      uniqueActionIds.add(Number(aid));
    }
  }
  this.actionBudgetsCount = uniqueActionIds.size;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.id_projet ||
      this.filters.id_action ||
      this.filters.min_budget ||
      this.filters.max_budget
    );
  }

  clearFilters() {
  this.filters = {};
  
  // Clear URL query parameters
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: {},
    replaceUrl: true
  });
  
  this.loadCurrentTabBudgets();
  this.showSuccess('Filtres effacés avec succès');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatCompactCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M MAD`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K MAD`;
    } else {
      return `${amount.toFixed(0)} MAD`;
    }
  }

  getExecutionRate(suiviBudget: SuiviBudget): number {
    if (!suiviBudget.budget_prevu || suiviBudget.budget_prevu === 0) return 0;
    return Math.round((suiviBudget.montant_paye / suiviBudget.budget_prevu) * 100);
  }

  getBudgetDisplayName(suiviBudget: SuiviBudget): string {
    if (suiviBudget.type_budget === 'projet') {
      return suiviBudget.projet_titre || 'Projet inconnu';
    } else {
      return suiviBudget.action_type || 'Action inconnue';
    }
  }

  // Tab styling methods
  getTabClass(tab: 'projets' | 'actions'): string {
    if (this.activeTab === tab) {
      return 'border-indigo-500 text-indigo-600';
    }
    return 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }

  getTabIconClass(tab: 'projets' | 'actions'): string {
    if (this.activeTab === tab) {
      return 'text-indigo-600';
    }
    return 'text-gray-400 group-hover:text-gray-600';
  }

  getBadgeClass(tab: 'projets' | 'actions'): string {
    if (this.activeTab === tab) {
      return 'bg-indigo-100 text-indigo-800';
    }
    return 'bg-gray-100 text-gray-800 group-hover:bg-gray-200';
  }

  getMobileTabClass(tab: 'projets' | 'actions'): string {
    if (this.activeTab === tab) {
      return 'bg-indigo-600 text-white';
    }
    return 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  }

  // Modal methods
  getCreateModalTitle(): string {
    return this.activeTab === 'projets' ? 'Nouveau Budget Projet' : 'Nouveau Budget Action';
  }

  getCreateModalSubtitle(): string {
    return this.activeTab === 'projets' 
      ? 'Créez un nouveau budget pour un projet'
      : 'Créez un nouveau budget pour une action';
  }

  openCreateModal() {
    if (!this.canCreateSuiviBudgets) {
      this.showError('Vous n\'avez pas les permissions pour créer des budgets');
      return;
    }
    
    this.selectedSuiviBudget = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(suiviBudget: SuiviBudget) {
    if (!this.canEditSuiviBudgets) {
      this.showError('Vous n\'avez pas les permissions pour modifier des budgets');
      return;
    }
    
    this.selectedSuiviBudget = { ...suiviBudget };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedSuiviBudget = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedSuiviBudget = null;
      this.modalMode = 'create';
    }
  }

  confirmDelete(suiviBudget: SuiviBudget) {
    if (!this.canDeleteSuiviBudgets) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des budgets');
      return;
    }
    
    this.suiviBudgetToDelete = suiviBudget;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.suiviBudgetToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteSuiviBudget() {
    if (!this.suiviBudgetToDelete || !this.canDeleteSuiviBudgets) return;

    this.deleting = true;
    const sub = this.suiviBudgetService.delete(this.suiviBudgetToDelete.id_budget).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadCurrentTabBudgets();
          this.showSuccess(`Budget supprimé avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error: any) => {
        console.error('Error deleting budget:', error);
        this.showError('Erreur lors de la suppression du budget');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  onSuiviBudgetSaved(suiviBudget: SuiviBudget) {
    this.loadCurrentTabBudgets();
    
    if (this.modalMode === 'create') {
      this.showSuccess(`Budget créé avec succès`);
    } else {
      this.showSuccess(`Budget modifié avec succès`);
    }
    
    this.closeModal();
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}