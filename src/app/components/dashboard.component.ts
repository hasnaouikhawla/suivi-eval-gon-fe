import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService, ComprehensiveDashboardData } from '../services/dashboard.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Header -->
        <div class="mb-8">
  <div class="flex justify-between items-center relative">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Suivi et évaluation du projet CES/CEP dans la région de Guelmim-Oued Noun</h1>
    </div>

    <!-- START: User affected zones (compact for 2 entries + hover/focus popover for full list) -->
    <div
      class="text-right focus:outline-none"
      tabindex="0"
      (mouseenter)="zonesPopoverVisible = true"
      (mouseleave)="zonesPopoverVisible = false"
      (focusin)="zonesPopoverVisible = true"
      (focusout)="zonesPopoverVisible = false"
      aria-haspopup="true"
      [attr.aria-expanded]="zonesPopoverVisible ? 'true' : 'false'"
      style="min-width:220px;">

      <!-- Provinces: show up to 2 inline, +N autres suffix when >2 -->
      <div *ngIf="currentUser?.provinces?.length" class="text-sm font-medium text-gray-800">
        <span class="text-gray-700 font-medium">Provinces:</span>
        <span class="font-normal text-gray-700 ml-1">
          {{ currentUser.provinces.length <= 2
              ? (currentUser.provinces.join(', '))
              : (currentUser.provinces.slice(0,2).join(', ') + ' +' + (currentUser.provinces.length - 2) + ' autres') }}
        </span>
      </div>

      <!-- Communes: show up to 2 inline, +N autres suffix when >2 -->
      <div *ngIf="currentUser?.communes?.length" class="text-sm font-medium text-gray-800 mt-1">
        <span class="text-gray-700 font-medium">Communes:</span>
        <span class="font-normal text-gray-700 ml-1">
          {{ currentUser.communes.length <= 2
              ? (currentUser.communes.join(', '))
              : (currentUser.communes.slice(0,2).join(', ') + ' +' + (currentUser.communes.length - 2) + ' autres') }}
        </span>
      </div>

      <div *ngIf="!currentUser?.provinces?.length && !currentUser?.communes?.length" class="text-sm text-gray-500 mt-1">
        Toutes zones affectées
      </div>

      <!-- Hover/focus popover with full lists (styled like dashboard cards) -->
<div *ngIf="zonesPopoverVisible"
     class="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 text-left"
     (mouseenter)="zonesPopoverVisible = true"
     (mouseleave)="zonesPopoverVisible = false"
     role="dialog"
     aria-label="Zones affectées - détails">

  <div class="flex items-start justify-between">
    <div class="text-sm font-semibold text-gray-900">Zones affectées</div>
  </div>

  <div class="mt-3">
    <div *ngIf="currentUser?.provinces?.length">
      <div class="text-xs text-gray-600 font-medium mb-2">Provinces</div>
      <div class="text-sm text-gray-800 leading-relaxed break-words">{{ currentUser.provinces.join(', ') }}</div>
    </div>

    <div *ngIf="currentUser?.communes?.length" class="mt-4">
      <div class="text-xs text-gray-600 font-medium mb-2">Communes</div>
      <div class="text-sm text-gray-800 leading-relaxed break-words">{{ currentUser.communes.join(', ') }}</div>
    </div>

    <div *ngIf="!currentUser?.provinces?.length && !currentUser?.communes?.length" class="text-sm text-gray-500 italic">
      Toutes zones affectées
    </div>
  </div>

  <div class="mt-4 pt-3 border-t border-gray-200 text-right">
  </div>
</div>
    </div>
    <!-- END: User affected zones -->
  </div>
</div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center h-64">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">Chargement des données...</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && errorMessage" class="text-center py-12">
          <div class="bg-white rounded-lg shadow-md border border-red-200 p-8">
            <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
            <p class="mt-2 text-sm text-gray-500">{{ errorMessage }}</p>
            <button
              (click)="loadDashboard()"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Réessayer
            </button>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div *ngIf="!loading && !errorMessage && dashboardData" class="space-y-8">
          <!-- Section 1: Suivi Physique -->
          <div class="bg-white rounded-lg shadow-md border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">Suivi Physique</h2>
                    <p class="text-sm text-gray-600">Progression des projets et actions</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-600">Performance Globale</div>
                  <div class="text-lg font-bold text-blue-600">{{ dashboardData.overview.overall_physical_progress }}%</div>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <!-- Actions Statistics -->
              <div class="mb-8" *ngIf="dashboardData.permissions.canViewActions">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-semibold text-gray-900">État des Actions</h3>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span class="text-sm text-gray-600">Progression</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <!-- Actions by Status -->
                  <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div class="text-sm font-medium text-gray-700 mb-2">Terminées</div>
                    <div class="text-2xl font-bold text-green-600">{{ dashboardData.suivi_physique.actions.completed }}</div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div class="bg-green-500 h-2 rounded-full" 
                           [style.width.%]="getActionStatusPercentage('completed')"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">{{ getActionStatusPercentage('completed') }}%</div>
                  </div>

                  <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div class="text-sm font-medium text-gray-700 mb-2">En cours</div>
                    <div class="text-2xl font-bold text-blue-600">{{ dashboardData.suivi_physique.actions.in_progress }}</div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div class="bg-blue-500 h-2 rounded-full" 
                           [style.width.%]="getActionStatusPercentage('in_progress')"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">{{ getActionStatusPercentage('in_progress') }}%</div>
                  </div>

                  <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div class="text-sm font-medium text-gray-700 mb-2">Planifiées</div>
                    <div class="text-2xl font-bold text-orange-600">{{ dashboardData.suivi_physique.actions.planned }}</div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div class="bg-orange-500 h-2 rounded-full" 
                           [style.width.%]="getActionStatusPercentage('planned')"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">{{ getActionStatusPercentage('planned') }}%</div>
                  </div>

                  <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div class="text-sm font-medium text-gray-700 mb-2">Type Volet</div>
                    <div class="space-y-1">
                      <div class="flex justify-between text-xs">
                        <span>CES:</span>
                        <span class="font-semibold">{{ dashboardData.suivi_physique.actions.par_type_volet.CES.total }}</span>
                      </div>
                      <div class="flex justify-between text-xs">
                        <span>CEP:</span>
                        <span class="font-semibold">{{ dashboardData.suivi_physique.actions.par_type_volet.CEP.total }}</span>
                      </div>
                    </div>
                  </div>
                </div>
				
				<!-- Physical Progress Subsection -->
                <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-md font-semibold text-blue-900">Progression Physique des Actions</h4>
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span class="text-sm text-blue-700">Quantités Réalisées</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="text-center bg-white p-4 rounded-lg border border-blue-100">
                      <div class="text-sm font-medium text-blue-800 mb-2">Actions avec Progrès</div>
                      <div class="text-2xl font-bold text-blue-600">{{ dashboardData.suivi_physique.actions.physical_progress.actions_with_progress }}</div>
                      <div class="text-xs text-blue-600 mt-1">sur {{ dashboardData.suivi_physique.actions.total }} total</div>
                    </div>

                    <div class="text-center bg-white p-4 rounded-lg border border-green-100">
                      <div class="text-sm font-medium text-green-800 mb-2">Quantité Prévue</div>
                      <div class="text-2xl font-bold text-green-600">{{ formatLargeNumber(dashboardData.suivi_physique.actions.physical_progress.total_quantite_prevue) }}</div>
                      <div class="text-xs text-green-600 mt-1">unités totales</div>
                    </div>

                    <div class="text-center bg-white p-4 rounded-lg border border-orange-100">
                      <div class="text-sm font-medium text-orange-800 mb-2">Quantité Réalisée</div>
                      <div class="text-2xl font-bold text-orange-600">{{ formatLargeNumber(dashboardData.suivi_physique.actions.physical_progress.total_quantite_realisee) }}</div>
                      <div class="text-xs text-orange-600 mt-1">unités réalisées</div>
                    </div>

                    <div class="text-center bg-white p-4 rounded-lg border border-purple-100">
                      <div class="text-sm font-medium text-purple-800 mb-2">Taux de Réalisation</div>
                      <div class="text-2xl font-bold text-purple-600">{{ dashboardData.suivi_physique.actions.physical_progress.physical_progress_rate }}%</div>
                      <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div class="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                             [style.width.%]="Math.min(dashboardData.suivi_physique.actions.physical_progress.physical_progress_rate, 100)"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Progress Alert -->
                  <div *ngIf="dashboardData.suivi_physique.actions.physical_progress.physical_progress_rate < 50" 
                       class="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h5 class="text-sm font-medium text-amber-800">Progression physique faible</h5>
                        <p class="text-sm text-amber-700 mt-1">
                          Le taux de réalisation physique ({{ dashboardData.suivi_physique.actions.physical_progress.physical_progress_rate }}%) est inférieur à 50%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Critical Actions Alert -->
                <div *ngIf="dashboardData.suivi_physique.actions.critical_actions.length > 0" 
                     class="bg-red-50 border border-red-200 rounded-md p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">Actions nécessitant une attention</h3>
                      <p class="text-sm text-red-700 mt-1">
                        {{ dashboardData.suivi_physique.actions.critical_actions.length }} actions ont un faible taux de progression
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Projects Statistics -->
              <div class="mb-8" *ngIf="dashboardData.permissions.canViewProjets">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-semibold text-gray-900">État des Projets</h3>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-sm text-gray-600">Réalisation</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
				  <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-gray-500 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div class="text-sm font-medium text-gray-700 mb-2">Total</div>
                    <div class="text-2xl font-bold text-gray-900">{{ dashboardData.suivi_physique.projets.total }}</div>
                  </div>
				  
                  <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div class="text-sm font-medium text-gray-700 mb-2">Terminés</div>
                    <div class="text-2xl font-bold text-green-600">{{ dashboardData.suivi_physique.projets.completed }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ dashboardData.suivi_physique.projets.completion_rate }}%</div>
                  </div>

                  <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div class="text-sm font-medium text-gray-700 mb-2">En cours</div>
                    <div class="text-2xl font-bold text-blue-600">{{ dashboardData.suivi_physique.projets.in_progress }}</div>
                  </div>

                  <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-300 text-center">
                    <div class="text-sm font-medium text-gray-700 mb-2">Planifiés</div>
                    <div class="text-2xl font-bold text-orange-600">{{ dashboardData.suivi_physique.projets.planned }}</div>
                  </div>
                </div>

                <!-- Overdue Projects Alert -->
                <div *ngIf="dashboardData.suivi_physique.projets.overdue_projects.length > 0" 
                     class="bg-orange-50 border border-orange-200 rounded-md p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-orange-800">Projets en retard</h3>
                      <p class="text-sm text-orange-700 mt-1">
                        {{ dashboardData.suivi_physique.projets.overdue_projects.length }} projets ont dépassé leur date de fin prévue
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Suivi Budgétaire -->
          <div class="bg-white rounded-lg shadow-md border border-gray-200" *ngIf="dashboardData.permissions.canViewBudget">
            <div class="px-6 py-4 border-b border-gray-200 bg-green-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <circle cx="12" cy="12" r="7" stroke-width="2" stroke="currentColor" fill="currentColor"></circle>
                      <path d="M9 12h6" stroke-width="2" stroke-linecap="round" stroke="white"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">Suivi Budgétaire</h2>
                    <p class="text-sm text-gray-600">Gestion financière des projets et actions</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-600">Santé Financière</div>
                  <div class="text-lg font-bold" 
                       [class.text-green-600]="dashboardData.overview.health_status.budget === 'good'"
                       [class.text-yellow-600]="dashboardData.overview.health_status.budget === 'warning'"
                       [class.text-red-600]="dashboardData.overview.health_status.budget === 'critical'">
                    {{ getBudgetHealthLabel(dashboardData.overview.health_status.budget) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6">
              <!-- Budget Overview -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-gray-500 hover:shadow-lg transition-shadow duration-300 text-center">
                  <div class="text-sm font-medium text-gray-700 mb-2">Budget Total Prévu</div>
                  <div class="text-2xl font-bold text-gray-900">
                    {{ formatCompactCurrency(getDashboardProjetBudgetPrevu()) }}
                  </div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300 text-center">
                  <div class="text-sm font-medium text-gray-700 mb-2">Budget Payé</div>
                  <div class="text-2xl font-bold text-green-600">
                    {{ formatCompactCurrency(dashboardData.suivi_budgetaire.projets.budget_paye_projets) }}
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div class="bg-green-500 h-2 rounded-full" 
                         [style.width.%]="dashboardData.suivi_budgetaire.budget_global.execution_rate"></div>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{{ dashboardData.suivi_budgetaire.budget_global.execution_rate }}%</div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-300 text-center">
                  <div class="text-sm font-medium text-gray-700 mb-2">Budget Restant</div>
                  <div class="text-2xl font-bold text-orange-600">
                    {{ formatCompactCurrency((getDashboardProjetBudgetPrevu() || 0) - (dashboardData.suivi_budgetaire.projets.budget_paye_projets || 0)) }}
                  </div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300 text-center">
                  <div class="text-sm font-medium text-gray-700 mb-2">Taux d'Exécution</div>
                  <div class="text-2xl font-bold text-blue-600">{{ dashboardData.suivi_budgetaire.projets.execution_rate_projets }}%</div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div class="bg-blue-500 h-2 rounded-full" 
                         [style.width.%]="dashboardData.suivi_budgetaire.projets.execution_rate_projets"></div>
                  </div>
                </div>
              </div>

              <!-- Budget Charts -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Budget Projets Chart -->
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Projets Gros Budgets</h3>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div class="min-h-[300px]">
                      <div #projetsBudgetChartRef class="w-full"></div>

                      <div *ngIf="projetsBudgetChartLoading" class="flex items-center justify-center h-60">
                        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                      </div>

                      <div *ngIf="!projetsBudgetChartLoading && dashboardData.suivi_budgetaire.projets.nombre_projets_budgetises === 0" 
                           class="text-center py-8 text-gray-500">
                        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        <p class="text-lg font-medium text-gray-700">Aucun projet budgétisé</p>
                      </div>
                    </div>
                  </div>

                  <!-- Budget Projets Stats -->
                  <div class="mt-4 grid grid-cols-2 gap-4">
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                      <div class="text-sm text-gray-600">Prévu</div>
                      <div class="text-lg font-bold text-blue-600">
                        {{ formatCompactCurrency(getDashboardProjetBudgetPrevu()) }}
                      </div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                      <div class="text-sm text-gray-600">Payé</div>
                      <div class="text-lg font-bold text-green-600">
                        {{ formatCompactCurrency(dashboardData.suivi_budgetaire.projets.budget_paye_projets) }}
                      </div>
                      <div class="text-xs" 
                           [class.text-red-600]="dashboardData.suivi_budgetaire.projets.execution_rate_projets > 100"
                           [class.text-green-600]="dashboardData.suivi_budgetaire.projets.execution_rate_projets <= 100">
                        {{ dashboardData.suivi_budgetaire.projets.execution_rate_projets }}%
                        <span *ngIf="dashboardData.suivi_budgetaire.projets.execution_rate_projets > 100" class="ml-1">⚠️</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Budget Actions Chart -->
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Actions Gros Budgets</h3>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div class="min-h-[300px]">
                      <div #actionsBudgetChartRef class="w-full"></div>

                      <div *ngIf="actionsBudgetChartLoading" class="flex items-center justify-center h-60">
                        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      </div>

                      <div *ngIf="!actionsBudgetChartLoading && dashboardData.suivi_budgetaire.actions.nombre_actions_budgetisees === 0" 
                           class="text-center py-8 text-gray-500">
                        <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        <p class="text-lg font-medium text-gray-700">Aucune action budgétisée</p>
                      </div>
                    </div>
                  </div>

                  <!-- Budget Actions Stats -->
                  <div class="mt-4 grid grid-cols-2 gap-4">
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                      <div class="text-sm text-gray-600">Prévu</div>
                      <div class="text-lg font-bold text-blue-600">
                        <!-- use computed constant per-action budget instead of backend summed field -->
                        {{ formatCompactCurrency(getDashboardActionBudgetPrevu()) }}
                      </div>
                    </div>
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                      <div class="text-sm text-gray-600">Payé</div>
                      <div class="text-lg font-bold text-green-600">
                        {{ formatCompactCurrency(dashboardData.suivi_budgetaire.actions.budget_paye_actions) }}
                      </div>
                      <div class="text-xs" 
                           [class.text-red-600]="dashboardData.suivi_budgetaire.actions.execution_rate_actions > 100"
                           [class.text-green-600]="dashboardData.suivi_budgetaire.actions.execution_rate_actions <= 100">
                        {{ dashboardData.suivi_budgetaire.actions.execution_rate_actions }}%
                        <span *ngIf="dashboardData.suivi_budgetaire.actions.execution_rate_actions > 100" class="ml-1">⚠️</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- New: Budget Trends (Projets & Actions) - grouped bars (Prévu vs Payé) with period selectors -->
              <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Projets Trend -->
                <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-md font-semibold text-gray-900">Tendance Budget Projets</h4>
                    <div class="inline-flex rounded-md shadow-sm" role="group">
                      <button type="button" (click)="loadProjetsTrendChart(7)"
                              [ngClass]="projetsTrendPeriodDays === 7 ? selectedBtnClass : normalBtnClass">7j</button>
                      <button type="button" (click)="loadProjetsTrendChart(30)"
                              [ngClass]="projetsTrendPeriodDays === 30 ? selectedBtnClass : normalBtnClass">30j</button>
                      <button type="button" (click)="loadProjetsTrendChart(90)"
                              [ngClass]="projetsTrendPeriodDays === 90 ? selectedBtnClass : normalBtnClass">90j</button>
                    </div>
                  </div>

                  <div class="min-h-[280px]">
                    <div #projetsTrendChartRef class="w-full"></div>

                    <div *ngIf="projetsTrendChartLoading" class="flex items-center justify-center h-48">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>

                    <div *ngIf="!projetsTrendChartLoading && isProjetsTrendEmpty()" class="text-center py-8 text-gray-500">
                      <svg class="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      <p class="text-sm font-medium text-gray-700">Aucune donnée de budget disponible pour la période sélectionnée</p>
                    </div>
                  </div>
                </div>

                <!-- Actions Trend -->
                <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-md font-semibold text-gray-900">Tendance Budget Actions</h4>
                    <div class="inline-flex rounded-md shadow-sm" role="group">
                      <button type="button" (click)="loadActionsTrendChart(7)"
                              [ngClass]="actionsTrendPeriodDays === 7 ? selectedBtnClass : normalBtnClass">7j</button>
                      <button type="button" (click)="loadActionsTrendChart(30)"
                              [ngClass]="actionsTrendPeriodDays === 30 ? selectedBtnClass : normalBtnClass">30j</button>
                      <button type="button" (click)="loadActionsTrendChart(90)"
                              [ngClass]="actionsTrendPeriodDays === 90 ? selectedBtnClass : normalBtnClass">90j</button>
                    </div>
                  </div>

                  <div class="min-h-[280px]">
                    <div #actionsTrendChartRef class="w-full"></div>

                    <div *ngIf="actionsTrendChartLoading" class="flex items-center justify-center h-48">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>

                    <div *ngIf="!actionsTrendChartLoading && isActionsTrendEmpty()" class="text-center py-8 text-gray-500">
                      <svg class="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      <p class="text-sm font-medium text-gray-700">Aucune donnée de budget disponible pour la période sélectionnée</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Budget Overruns Alert -->
              <div *ngIf="dashboardData.suivi_budgetaire.ecarts.projets_depassement.length > 0 || dashboardData.suivi_budgetaire.ecarts.actions_depassement.length > 0" 
                   class="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Dépassements budgétaires détectés</h3>
                    <p class="text-sm text-red-700 mt-1">
                      {{ dashboardData.suivi_budgetaire.ecarts.projets_depassement.length }} projets et 
                      {{ dashboardData.suivi_budgetaire.ecarts.actions_depassement.length }} actions dépassent leur budget prévu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Suivi Cadre Logique -->
          <div class="bg-white rounded-lg shadow-md border border-gray-200" *ngIf="dashboardData.permissions.canViewIndicateurs">
            <div class="px-6 py-4 border-b border-gray-200 bg-purple-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">Suivi des Éléments du Cadre Logique</h2>
                    <p class="text-sm text-gray-600">Indicateurs et progression du cadre logique</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-600">Performance Indicateurs</div>
                  <div class="text-lg font-bold" 
                       [class.text-green-600]="dashboardData.overview.health_status.indicators === 'good'"
                       [class.text-yellow-600]="dashboardData.overview.health_status.indicators === 'warning'"
                       [class.text-red-600]="dashboardData.overview.health_status.indicators === 'critical'">
                    {{ getIndicatorHealthLabel(dashboardData.overview.health_status.indicators) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6">
              <!-- Indicators Overview -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-gray-500 hover:shadow-lg transition-shadow duration-300 text-center">
                  <div class="text-sm font-medium text-gray-700 mb-2">Total Indicateurs</div>
                  <div class="text-2xl font-bold text-gray-900">{{ dashboardData.suivi_cadre_logique.indicateurs.total }}</div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300 text-center">
                  <div class="text-sm font-medium text-gray-700 mb-2">Atteints</div>
                  <div class="text-2xl font-bold text-green-600">{{ dashboardData.suivi_cadre_logique.indicateurs.atteints }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ getIndicatorAchievementRate() }}%</div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-300 text-center">
                  <div class="text-sm font-medium text-gray-700 mb-2">Modérés</div>
                  <div class="text-2xl font-bold text-orange-600">{{ dashboardData.suivi_cadre_logique.indicateurs.moderes }}</div>
                </div>

                <div class="bg-white p-4 rounded-lg shadow-blue-200 border-l-4 border-red-500 hover:shadow-lg transition-shadow duration-300 text-center">
                  <div class="text-sm font-medium text-gray-700 mb-2">En retard</div>
                  <div class="text-2xl font-bold text-red-600">{{ dashboardData.suivi_cadre_logique.indicateurs.en_retard }}</div>
                </div>
              </div>

               <!-- Grid Layout: Structure du Cadre Logique (Left) and Measures Chart (Right) -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Left: Cadre Logique Structure -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Structure du Cadre Logique</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="text-sm font-medium text-gray-700">Objectifs Globaux</div>
                      <div class="text-xl font-bold text-purple-600">{{ dashboardData.suivi_cadre_logique.cadre_logique.par_niveau['Objectif global'] }}</div>
                    </div>

                    <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="text-sm font-medium text-gray-700">Objectifs Spécifiques</div>
                      <div class="text-xl font-bold text-blue-600">{{ dashboardData.suivi_cadre_logique.cadre_logique.par_niveau['Objectif spécifique'] }}</div>
                    </div>

                    <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="text-sm font-medium text-gray-700">Résultats</div>
                      <div class="text-xl font-bold text-green-600">{{ dashboardData.suivi_cadre_logique.cadre_logique.par_niveau['Résultat'] }}</div>
                    </div>

                    <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="text-sm font-medium text-gray-700">Activités</div>
                      <div class="text-xl font-bold text-orange-600">{{ dashboardData.suivi_cadre_logique.cadre_logique.par_niveau['Activité'] }}</div>
                    </div>
                  </div>

                  <!-- Additional Info Below Structure -->
                  <div class="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div class="text-sm text-purple-800 font-medium">Éléments avec Indicateurs</div>
                    <div class="text-lg font-bold text-purple-600">{{ dashboardData.suivi_cadre_logique.cadre_logique.elements_with_indicators }}</div>
                    <div class="text-xs text-purple-600 mt-1">sur {{ dashboardData.suivi_cadre_logique.cadre_logique.total_elements }} total</div>
                  </div>
                </div>

                <!-- Right: Measures Chart Card -->
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Évolution des Mesures</h3>
                    <div class="text-sm text-gray-600">
                      Ce mois: <span class="font-semibold text-purple-600">{{ dashboardData.suivi_cadre_logique.mesures.measurements_this_month }}</span>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <!-- Period Selection -->
                    <div class="flex justify-end mb-3">
                      <div class="inline-flex rounded-md shadow-sm" role="group">
                        <button type="button" (click)="changeChartPeriod(7)"
                                [ngClass]="chartPeriodDays === 7 ? selectedBtnClass : normalBtnClass">7j</button>
                        <button type="button" (click)="changeChartPeriod(30)"
                                [ngClass]="chartPeriodDays === 30 ? selectedBtnClass : normalBtnClass">30j</button>
                        <button type="button" (click)="changeChartPeriod(90)"
                                [ngClass]="chartPeriodDays === 90 ? selectedBtnClass : normalBtnClass">90j</button>
                      </div>
                    </div>

                    <!-- Chart Container -->
                    <div class="min-h-[280px]">
                      <div #measuresChartRef class="w-full"></div>

                      <div *ngIf="measuresChartLoading" class="flex items-center justify-center h-60">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>

                      <div *ngIf="!measuresChartLoading && isMeasuresChartEmpty()" 
                           class="text-center py-8 text-gray-500">
                        <svg class="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        <p class="text-sm font-medium text-gray-700">Aucune mesure</p>
                        <p class="text-xs text-gray-500">pour la période sélectionnée</p>
                      </div>
                    </div>
                  </div>

                  <!-- Summary Stats -->
                  <div class="mt-4 grid grid-cols-3 gap-3">
                    <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div class="text-xs text-gray-600">Total Mesures</div>
                      <div class="text-sm font-bold text-purple-600">{{ dashboardData.suivi_cadre_logique.mesures.total_measurements }}</div>
                    </div>
                    <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div class="text-xs text-gray-600">Mois Dernier</div>
                      <div class="text-sm font-bold text-gray-600">{{ dashboardData.suivi_cadre_logique.mesures.measurements_last_month }}</div>
                    </div>
                    <div class="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div class="text-xs text-gray-600">Tendance</div>
                      <div class="text-sm font-bold" 
                           [class.text-green-600]="dashboardData.suivi_cadre_logique.mesures.trend_direction === 'up'"
                           [class.text-red-600]="dashboardData.suivi_cadre_logique.mesures.trend_direction === 'down'"
                           [class.text-gray-600]="dashboardData.suivi_cadre_logique.mesures.trend_direction === 'stable'">
                        {{ dashboardData.suivi_cadre_logique.mesures.trend_direction === 'up' ? '↗️' : 
                           dashboardData.suivi_cadre_logique.mesures.trend_direction === 'down' ? '↘️' : '→' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Critical Indicators Alert -->
              <div *ngIf="dashboardData.suivi_cadre_logique.indicateurs.critical_indicators.length > 0" 
                   class="mt-8 bg-orange-50 border border-orange-200 rounded-md p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-orange-800">Indicateurs critiques</h3>
                    <p class="text-sm text-orange-700 mt-1">
                      {{ dashboardData.suivi_cadre_logique.indicateurs.critical_indicators.length }} indicateurs ont une performance faible (&lt;30%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: ComprehensiveDashboardData | null = null;
  loading = false;
  errorMessage = '';
  currentUser: any = null;
  zonesPopoverVisible: boolean = false;
  
  // Chart related (measures)
  @ViewChild('measuresChartRef', { static: false }) measuresChartRef!: ElementRef;
  measuresChart: any = null;
  measuresChartSeries: number[] = [];
  measuresChartCategories: string[] = [];
  chartPeriodDays = 30;
  measuresChartLoading = false;

  // Budget Charts
  @ViewChild('projetsBudgetChartRef', { static: false }) projetsBudgetChartRef!: ElementRef;
  @ViewChild('actionsBudgetChartRef', { static: false }) actionsBudgetChartRef!: ElementRef;
  projetsBudgetChart: any = null;
  actionsBudgetChart: any = null;
  projetsBudgetChartLoading = false;
  actionsBudgetChartLoading = false;

  // New: Budget Trend Charts (grouped bars: Prévu vs Payé)
  @ViewChild('projetsTrendChartRef', { static: false }) projetsTrendChartRef!: ElementRef;
  @ViewChild('actionsTrendChartRef', { static: false }) actionsTrendChartRef!: ElementRef;
  projetsTrendChart: any = null;
  actionsTrendChart: any = null;

  projetsTrendSeriesPrevu: number[] = [];
  projetsTrendSeriesPaye: number[] = [];
  projetsTrendCategories: string[] = [];
  projetsTrendPeriodDays = 30;
  projetsTrendChartLoading = false;

  actionsTrendSeriesPrevu: number[] = [];
  actionsTrendSeriesPaye: number[] = [];
  actionsTrendCategories: string[] = [];
  actionsTrendPeriodDays = 30;
  actionsTrendChartLoading = false;

  // Button styles
  selectedBtnClass = 'px-3 py-1 bg-indigo-600 text-white text-sm border border-indigo-600 rounded-l-md first:rounded-l-md last:rounded-r-md';
  normalBtnClass = 'px-3 py-1 bg-white border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 rounded-l-md first:rounded-l-md last:rounded-r-md';
  
  Math = Math;
  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
	private authService: AuthService
  ) {}

  ngOnInit(): void {
  
  this.authService.refreshUserData()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (user) => {
        this.currentUser = user ?? this.authService.getCurrentUser();
        this.loadDashboard();
      },
      error: (err) => {
        console.warn('Failed to refresh user on init:', err);
        this.currentUser = this.authService.getCurrentUser();
        this.loadDashboard();
      }
    });

  
  this.authService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe(u => this.currentUser = u);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  async loadDashboard(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      this.dashboardData = await firstValueFrom(
        this.dashboardService.getComprehensiveDashboardData()
          .pipe(takeUntil(this.destroy$))
      );

      // Initialize charts after data is loaded
      setTimeout(() => {
        this.initializeCharts();
      }, 100);

    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      this.errorMessage = 'Impossible de charger les données du tableau de bord';
    } finally {
      this.loading = false;
    }
  }

  private async initializeCharts(): Promise<void> {
    if (!this.dashboardData) return;

    // Load measures chart
    this.loadMeasuresChart(this.chartPeriodDays);

    // Load budget charts
    if (this.dashboardData.permissions.canViewBudget) {
      this.loadProjetsBudgetChart();
      this.loadActionsBudgetChart();

      // New: also load trend charts for budgets
      this.loadProjetsTrendChart(this.projetsTrendPeriodDays);
      this.loadActionsTrendChart(this.actionsTrendPeriodDays);
    }
  }

  // Utility methods
  getCurrentDateTime(): string {
    return new Date().toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCompactCurrency(amount: number | undefined | null): string {
    const value = Number(amount ?? 0);
    if (Math.abs(value) >= 1000000) {
      return `${Math.round(value / 100000) / 10}M MAD`;
    } else if (Math.abs(value) >= 1000) {
      return `${Math.round(value / 100) / 10}K MAD`;
    } else {
      return `${Math.round(value)} MAD`;
    }
  }
  
  formatLargeNumber(value: number | undefined | null): string {
    const num = Number(value ?? 0);
    if (Math.abs(num) >= 1000000) {
      return `${Math.round(num / 100000) / 10}M`;
    } else if (Math.abs(num) >= 1000) {
      return `${Math.round(num / 100) / 10}K`;
    } else {
      return `${Math.round(num)}`;
    }
  }

  // Calculation methods
  getActionStatusPercentage(status: 'completed' | 'in_progress' | 'planned'): number {
    if (!this.dashboardData?.suivi_physique.actions.total) return 0;
    const count = this.dashboardData.suivi_physique.actions[status];
    return Math.round((count / this.dashboardData.suivi_physique.actions.total) * 100);
  }

  getIndicatorAchievementRate(): number {
    if (!this.dashboardData?.suivi_cadre_logique.indicateurs.total) return 0;
    const achieved = this.dashboardData.suivi_cadre_logique.indicateurs.atteints;
    const total = this.dashboardData.suivi_cadre_logique.indicateurs.total;
    return Math.round((achieved / total) * 100);
  }

  getBudgetHealthLabel(health: string): string {
    switch (health) {
      case 'good': return 'Excellent';
      case 'warning': return 'Attention';
      case 'critical': return 'Critique';
      default: return 'Inconnu';
    }
  }

   getIndicatorHealthLabel(health: string): string {
     switch (health) {
       case 'good': return 'Bon';
       case 'warning': return 'Moyen';
       case 'critical': return 'Faible';
       default: return 'Inconnu';
     }
   }
   
  // Compute dashboard-level "constant" budget prévu for projects (prefer one budget per project)
  getDashboardProjetBudgetPrevu(): number {
    if (!this.dashboardData || !this.dashboardData.suivi_budgetaire) return 0;
    const rawItems = (this.dashboardData.suivi_budgetaire.projets as any).top_projets_by_budget
      || (this.dashboardData.suivi_budgetaire.projets as any).all_budgets
      || (this.dashboardData.suivi_budgetaire.projets as any).budget_entries
      || [];

    const seen = new Map<string, number>();
    rawItems.forEach((item: any) => {
      const id = String(item.id_projet ?? item.projet_id ?? item.id_budget ?? '');
      if (!id) return;
      // prefer first non-zero budget_prevu encountered
      if (!seen.has(id) && item.budget_prevu) {
        seen.set(id, Number(item.budget_prevu || 0));
      }
    });
    return Array.from(seen.values()).reduce((acc, v) => acc + (Number(v) || 0), 0);
  }

  // Compute dashboard-level "constant" budget prévu for actions (prefer one budget per action)
  getDashboardActionBudgetPrevu(): number {
    if (!this.dashboardData || !this.dashboardData.suivi_budgetaire) return 0;
    const rawItems = (this.dashboardData.suivi_budgetaire.actions as any).top_actions_by_budget
      || (this.dashboardData.suivi_budgetaire.actions as any).all_budgets
      || (this.dashboardData.suivi_budgetaire.actions as any).budget_entries
      || [];

    const seen = new Map<string, number>();
    rawItems.forEach((item: any) => {
      const id = String(item.id_action ?? item.id_budget ?? '');
      if (!id) return;
      if (!seen.has(id) && item.budget_prevu) {
        seen.set(id, Number(item.budget_prevu || 0));
      }
    });
    return Array.from(seen.values()).reduce((acc, v) => acc + (Number(v) || 0), 0);
  }

  // Chart methods
  async loadMeasuresChart(periodDays: number): Promise<void> {
    this.measuresChartLoading = true;
    this.chartPeriodDays = periodDays;

    try {
      // if no measurements at all, clear
      if (!this.dashboardData?.suivi_cadre_logique.mesures.total_measurements) {
        this.measuresChartSeries = [];
        this.measuresChartCategories = [];
        return;
      }

      // Use recent measurements stored under indicateurs.recent_measurements (service populates it)
      const recentMeasurements = this.dashboardData.suivi_cadre_logique.indicateurs.recent_measurements || [];

      // Prepare date range and buckets
      const categories: string[] = [];
      const series: number[] = [];
      const end = new Date();
      const start = new Date(end);
      // make start inclusive for the desired period
      start.setDate(end.getDate() - (periodDays - 1));
      const interval = this.getLabelIntervalForPeriod(periodDays);

      const dailyMeasurements: { [key: string]: number } = {};

      // Initialize buckets for every day in range
      for (let i = 0; i < periodDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateKey = d.toISOString().slice(0, 10);
        dailyMeasurements[dateKey] = 0;
      }

      // Count actual measurements per day from recentMeasurements
      recentMeasurements.forEach((m: any) => {
        if (m && m.date_mesure) {
          const measureDate = new Date(m.date_mesure);
          const dateKey = measureDate.toISOString().slice(0, 10);
          if (dailyMeasurements.hasOwnProperty(dateKey)) {
            dailyMeasurements[dateKey]++;
          }
        }
      });

      // Build categories and series arrays
      for (let i = 0; i < periodDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateKey = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' });
        categories.push((i % interval === 0) ? label : '');
        series.push(dailyMeasurements[dateKey] || 0);
      }

      this.measuresChartSeries = series;
      this.measuresChartCategories = categories;

      await this.renderMeasuresChart();
    } catch (err) {
      console.error('Error loading measures chart', err);
      this.measuresChartSeries = [];
      this.measuresChartCategories = [];
    } finally {
      this.measuresChartLoading = false;
    }
  }

  // Helper used in template to avoid using arrow functions inside bindings
  isMeasuresChartEmpty(): boolean {
    if (!this.measuresChartSeries) return true;
    if (this.measuresChartSeries.length === 0) return true;
    return this.measuresChartSeries.every(v => v === 0);
  }

  async loadProjetsBudgetChart(): Promise<void> {
    this.projetsBudgetChartLoading = true;

    try {
      if (!this.dashboardData?.suivi_budgetaire.projets.nombre_projets_budgetises) {
        return;
      }

      await this.renderBudgetChart('projets');
    } catch (err) {
      console.error('Error loading projets budget chart', err);
    } finally {
      this.projetsBudgetChartLoading = false;
    }
  }

  async loadActionsBudgetChart(): Promise<void> {
    this.actionsBudgetChartLoading = true;

    try {
      if (!this.dashboardData?.suivi_budgetaire.actions.nombre_actions_budgetisees) {
        return;
      }

      await this.renderBudgetChart('actions');
    } catch (err) {
      console.error('Error loading actions budget chart', err);
    } finally {
      this.actionsBudgetChartLoading = false;
    }
  }

  // New: load projets trend chart (grouped bars per day: prévus vs payés)
  async loadProjetsTrendChart(periodDays: number): Promise<void> {
    this.projetsTrendChartLoading = true;
    this.projetsTrendPeriodDays = periodDays;

    try {
      if (!this.dashboardData || !this.dashboardData.suivi_budgetaire) {
        this.projetsTrendSeriesPrevu = [];
        this.projetsTrendSeriesPaye = [];
        this.projetsTrendCategories = [];
        return;
      }

      // Try to get budget entries for projets - fallbacks included
      const rawItems = (this.dashboardData.suivi_budgetaire.projets as any).budget_entries
        || (this.dashboardData.suivi_budgetaire.projets as any).all_budgets
        || (this.dashboardData.suivi_budgetaire.projets as any).top_projets_by_budget
        || [];

      const end = new Date();
       const start = new Date(end);
       start.setDate(end.getDate() - (periodDays - 1));
 
       // Prepare buckets
       const dailyPrevu: { [key: string]: number } = {};
       const dailyPaye: { [key: string]: number } = {};
       const categories: string[] = [];
       const interval = this.getLabelIntervalForPeriod(periodDays);
 
       for (let i = 0; i < periodDays; i++) {
         const d = new Date(start);
         d.setDate(start.getDate() + i);
         const dateKey = d.toISOString().slice(0, 10);
         dailyPrevu[dateKey] = 0;
         dailyPaye[dateKey] = 0;
         const label = d.toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' });
         categories.push((i % interval === 0) ? label : '');
       }

      // Aggregate by entity so we attribute only one "constant" budget per project.
      // For each project we keep the earliest date_entree in the period and attribute that project's budget once.
      const perProject = new Map<string, { date: string | null; prevu: number; paye: number }>();
      rawItems.forEach((item: any) => {
        const id = String(item.id_projet ?? item.projet_id ?? item.id_budget ?? '');
        if (!id) return;
        const dateStr = item.date_entree || item.date || item.entry_date || item.date_budget || null;
        const prevu = Number(item.budget_prevu || item.budget || 0) || 0;
        const paye = Number(item.montant_paye || item.paye || 0) || 0;

        if (!perProject.has(id)) {
          perProject.set(id, { date: dateStr, prevu, paye });
        } else {
          const existing = perProject.get(id)!;
          // keep the earliest valid date (so budget appears only once on the earliest entry)
          if (dateStr && (!existing.date || new Date(dateStr) < new Date(existing.date))) {
            existing.date = dateStr;
          }
          // prevu is a constant per project: keep the first non-zero encountered
          if (!existing.prevu && prevu) existing.prevu = prevu;
          // montant_paye should accumulate across suivi entries -> sum payments
          existing.paye = (existing.paye || 0) + (paye || 0);
        }
      });

      perProject.forEach((v) => {
        if (!v.date) return;
        const d = new Date(v.date);
        if (Number.isNaN(d.getTime())) return;
        const dateKey = d.toISOString().slice(0, 10);
        if (!(dateKey in dailyPrevu)) return;
        dailyPrevu[dateKey] += v.prevu || 0;
        dailyPaye[dateKey] += v.paye || 0;
      });

      // Build series arrays
      const prevuSeries = [];
      const payeSeries = [];
      for (let i = 0; i < periodDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateKey = d.toISOString().slice(0, 10);
        prevuSeries.push(dailyPrevu[dateKey] || 0);
        payeSeries.push(dailyPaye[dateKey] || 0);
      }

      this.projetsTrendSeriesPrevu = prevuSeries;
      this.projetsTrendSeriesPaye = payeSeries;
      this.projetsTrendCategories = categories;

      await this.renderProjetsTrendChart();
    } catch (err) {
      console.error('Error loading projets trend chart', err);
      this.projetsTrendSeriesPrevu = [];
      this.projetsTrendSeriesPaye = [];
      this.projetsTrendCategories = [];
    } finally {
      this.projetsTrendChartLoading = false;
    }
  }

  // New: load actions trend chart (grouped bars per day: prévus vs payés)
  async loadActionsTrendChart(periodDays: number): Promise<void> {
    this.actionsTrendChartLoading = true;
    this.actionsTrendPeriodDays = periodDays;

    try {
      if (!this.dashboardData || !this.dashboardData.suivi_budgetaire) {
        this.actionsTrendSeriesPrevu = [];
        this.actionsTrendSeriesPaye = [];
        this.actionsTrendCategories = [];
        return;
      }

      // Try to get budget entries for actions - fallbacks included
      const rawItems = (this.dashboardData.suivi_budgetaire.actions as any).budget_entries
        || (this.dashboardData.suivi_budgetaire.actions as any).all_budgets
        || (this.dashboardData.suivi_budgetaire.actions as any).top_actions_by_budget
        || [];

      const end = new Date();
      const start = new Date(end);
      start.setDate(end.getDate() - (periodDays - 1));

      // Prepare buckets
      const dailyPrevu: { [key: string]: number } = {};
      const dailyPaye: { [key: string]: number } = {};
      const categories: string[] = [];
      const interval = this.getLabelIntervalForPeriod(periodDays);

      for (let i = 0; i < periodDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateKey = d.toISOString().slice(0, 10);
        dailyPrevu[dateKey] = 0;
        dailyPaye[dateKey] = 0;
        const label = d.toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' });
        categories.push((i % interval === 0) ? label : '');
      }

      // Aggregate by entity so we attribute only one "constant" budget per action.
      const perAction = new Map<string, { date: string | null; prevu: number; paye: number }>();
      rawItems.forEach((item: any) => {
        const id = String(item.id_action ?? item.id_budget ?? '');
        if (!id) return;
        const dateStr = item.date_entree || item.date || item.entry_date || item.date_budget || null;
        const prevu = Number(item.budget_prevu || item.budget || 0) || 0;
        const paye = Number(item.montant_paye || item.paye || 0) || 0;

        if (!perAction.has(id)) {
          perAction.set(id, { date: dateStr, prevu, paye });
        } else {
          const existing = perAction.get(id)!;
          if (dateStr && (!existing.date || new Date(dateStr) < new Date(existing.date))) {
            existing.date = dateStr;
          }
          // prevu is constant per action: keep first non-zero
          if (!existing.prevu && prevu) existing.prevu = prevu;
          // sum payments across suivi entries
          existing.paye = (existing.paye || 0) + (paye || 0);
        }
      });

      perAction.forEach((v) => {
        if (!v.date) return;
        const d = new Date(v.date);
        if (Number.isNaN(d.getTime())) return;
        const dateKey = d.toISOString().slice(0, 10);
        if (!(dateKey in dailyPrevu)) return;
        dailyPrevu[dateKey] += v.prevu || 0;
        dailyPaye[dateKey] += v.paye || 0;
      });

      // Build series arrays
      const prevuSeries = [];
      const payeSeries = [];
      for (let i = 0; i < periodDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateKey = d.toISOString().slice(0, 10);
        prevuSeries.push(dailyPrevu[dateKey] || 0);
        payeSeries.push(dailyPaye[dateKey] || 0);
      }

      this.actionsTrendSeriesPrevu = prevuSeries;
      this.actionsTrendSeriesPaye = payeSeries;
      this.actionsTrendCategories = categories;

      await this.renderActionsTrendChart();
    } catch (err) {
      console.error('Error loading actions trend chart', err);
      this.actionsTrendSeriesPrevu = [];
      this.actionsTrendSeriesPaye = [];
      this.actionsTrendCategories = [];
    } finally {
      this.actionsTrendChartLoading = false;
    }
  }

  changeChartPeriod(days: number): void {
    if (this.chartPeriodDays === days) return;
    this.loadMeasuresChart(days);
  }

  getLabelIntervalForPeriod(days: number): number {
    if (days === 7) return 1;
    if (days === 30) return 5;
    if (days === 90) return 10;
    return Math.max(1, Math.round(days / 6));
  }

  async renderMeasuresChart(): Promise<void> {
    try {
      const ApexModule = await import('apexcharts');
      const ApexCharts = (ApexModule && (ApexModule as any).default) ? (ApexModule as any).default : (ApexModule as any);

      const options: any = {
        chart: {
          type: 'bar',
          height: 280,
          toolbar: { show: true },
          zoom: { enabled: false }
        },
        series: [{ name: 'Mesures', data: this.measuresChartSeries }],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            borderRadius: 4
          }
        },
        xaxis: {
          categories: this.measuresChartCategories,
          labels: {
            rotate: -45,
            hideOverlappingLabels: true,
            style: { fontSize: '11px' }
          }
        },
        yaxis: {
          labels: {
            formatter: (val: number) => `${Math.round(val)}`,
          },
          min: 0
        },
        dataLabels: { enabled: false },
        tooltip: {
          y: {
            formatter: (val: number) => `${Math.round(val)} mesure(s)`
          }
        },
        fill: { type: 'solid' },
        colors: ['#8b5cf6'],
        grid: { borderColor: '#e6e6e6' }
      };

      if (this.measuresChart) {
        this.measuresChart.updateOptions({
          series: [{ data: this.measuresChartSeries }],
          xaxis: { categories: this.measuresChartCategories }
        }, true, true);
        return;
      }

      if (!this.measuresChartRef || !this.measuresChartRef.nativeElement) {
        console.warn('Measures chart container not available');
        return;
      }

      this.measuresChart = new (ApexCharts)(this.measuresChartRef.nativeElement, options);
      await this.measuresChart.render();
    } catch (err) {
      console.warn('ApexCharts failed to load for measures chart.', err);
      this.destroyMeasuresChart();
    }
  }

    async renderBudgetChart(type: 'projets' | 'actions'): Promise<void> {
  try {
    const ApexModule = await import('apexcharts');
    const ApexCharts = (ApexModule && (ApexModule as any).default) ? (ApexModule as any).default : (ApexModule as any);

    if (!this.dashboardData) return;

    const budgetData = type === 'projets' 
      ? this.dashboardData.suivi_budgetaire.projets
      : this.dashboardData.suivi_budgetaire.actions;

    // Replace with this exact block:
const rawItems = type === 'projets'
  ? (this.dashboardData.suivi_budgetaire.projets.top_projets_by_budget || [])
  : (this.dashboardData.suivi_budgetaire.actions.top_actions_by_budget || []);

// Aggregate by project/action id so chart shows totals per entity (not individual budget entries)
const aggMap: Record<string, any> = {};
rawItems.forEach((item: any) => {
  const id = type === 'projets'
    ? (item.id_projet ?? item.projet_id ?? item.id_budget)
    : (item.id_action ?? item.id_budget);
  const key = String(id ?? 'unknown');

  if (!aggMap[key]) {
    if (type === 'projets') {
      aggMap[key] = {
        id_projet: id,
        projet_titre: item.projet_titre || item.nom || item.intitule || `Projet #${id}`,
        // initialize with 0 - we'll set budget_prevu as first non-zero encountered (constant per entity)
        budget_prevu: 0,
        montant_paye: 0
      };
    } else {
      aggMap[key] = {
        id_action: id,
        action_type: item.action_type || item.nom || item.intitule || `Action #${id}`,
        budget_prevu: 0,
        montant_paye: 0
      };
    }
  }

  // IMPORTANT: do NOT sum budget_prevu across multiple suivi entries for the same entity.
  // Treat budget_prevu as a constant per entity: take the first non-zero value encountered.
  const itemPrevu = Number(item.budget_prevu ?? item.budget ?? 0) || 0;
  if (!aggMap[key].budget_prevu && itemPrevu) {
    aggMap[key].budget_prevu = itemPrevu;
  }

  // montant_paye should be summed across entries (payments accumulate)
  aggMap[key].montant_paye += Number(item.montant_paye ?? item.paye ?? 0) || 0;
});

// Take top 5 entities by total budget_prevu
const topItems = Object.values(aggMap)
  .sort((a: any, b: any) => (b.budget_prevu || 0) - (a.budget_prevu || 0))
  .slice(0, 5);

if (topItems.length === 0) return;

// Build categories and series from aggregated entities
const categories = topItems.map((item: any) => {
  const name = type === 'projets' ? (item.projet_titre || `Projet #${item.id_projet}`) : (item.action_type || `Action #${item.id_action}`);
  return name.length > 15 ? name.substring(0, 15) + '...' : name;
});

const prevuSeries = topItems.map((item: any) => item.budget_prevu || 0);
const budgetedPayeSeries = topItems.map((item: any) => Math.min(item.montant_paye || 0, item.budget_prevu || 0));
const remainingSeries = topItems.map((item: any) => Math.max(0, (item.budget_prevu || 0) - (item.montant_paye || 0)));
const overrunSeries = topItems.map((item: any) => Math.max(0, (item.montant_paye || 0) - (item.budget_prevu || 0)));

    const options: any = {
      chart: {
        type: 'bar',
        height: 320,
        stacked: true,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      series: [
        { name: 'Payé (dans le budget)', data: budgetedPayeSeries, color: '#F97316' },
        { name: 'Restant', data: remainingSeries, color: '#10B981' },
        { name: 'Excédent', data: overrunSeries, color: '#EF4444' }

      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
        }
      },
      xaxis: {
        categories: categories,
        labels: {
          show: true // Hide x-axis labels
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          formatter: (val: number) => this.formatCompactCurrency(val),
        },
        min: 0
      },
      dataLabels: { 
        enabled: false // Remove numbers from bars
      },
      tooltip: {
        shared: true,
        intersect: false,
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const item = topItems[dataPointIndex];
          const prevu = prevuSeries[dataPointIndex];
          const paye = budgetedPayeSeries[dataPointIndex];
          const restant = remainingSeries[dataPointIndex];
          const percentage = prevu > 0 ? Math.round((paye / prevu) * 100) : 0;
          const isOverrun = percentage > 100;

          // Build fullName using available fields (project title or action type), fallback to ids
          let fullName = '';
          if (type === 'projets') {
            fullName = item.projet_titre || item.nom || item.intitule || `Projet #${item.id_projet ?? item.id_budget ?? ''}`;
          } else {
            fullName = item.action_type || item.nom || item.intitule || `Action #${item.id_action ?? item.id_budget ?? ''}`;
          }

          return `
                <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[250px]">
                    <div class="font-semibold text-gray-900 mb-3 text-sm text-wrap">${fullName}</div>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> 
                                <span class="text-gray-600">Budget Prévu:</span>
                            </div>
                            <span class="font-medium text-gray-900">${this.formatCompactCurrency(prevu)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                <span class="text-gray-600">Budget Payé:</span>
                            </div>
                            <span class="font-medium text-gray-900">${this.formatCompactCurrency(paye)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span class="text-gray-600">Restant:</span>
                            </div>
                            <span class="font-medium text-gray-900">${this.formatCompactCurrency(restant)}</span>
                        </div>
                        <div class="border-t border-gray-200 pt-2 mt-2">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Taux d'exécution:</span>
                                <span class="font-medium ${isOverrun ? 'text-red-600' : 'text-gray-900'}">
                                    ${percentage}% ${isOverrun ? '⚠️' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
      },
      fill: { 
        type: 'solid',
        opacity: 0.8
      },
      colors: ['#F97316', '#10B981', '#EF4444'],
      grid: { 
        borderColor: '#E5E7EB',
        show: true,
        strokeDashArray: 3
      },
      legend: {
        show: false // Remove legend to make chart cleaner
      }
    };

    const chartRef = type === 'projets' ? this.projetsBudgetChartRef : this.actionsBudgetChartRef;
    const chartInstance = type === 'projets' ? this.projetsBudgetChart : this.actionsBudgetChart;

    if (chartInstance) {
      chartInstance.updateOptions(options, true, true);
      return;
    }

    if (!chartRef || !chartRef.nativeElement) {
      console.warn(`${type} budget chart container not available`);
      return;
    }

    const newChart = new (ApexCharts)(chartRef.nativeElement, options);
    await newChart.render();

    if (type === 'projets') {
      this.projetsBudgetChart = newChart;
    } else {
      this.actionsBudgetChart = newChart;
    }

  } catch (err) {
    console.warn(`ApexCharts failed to load for ${type} budget chart.`, err);
    if (type === 'projets') {
      this.destroyProjetsBudgetChart();
    } else {
      this.destroyActionsBudgetChart();
    }
  }
}

  // New: render projets trend chart (grouped bars)
  async renderProjetsTrendChart(): Promise<void> {
    try {
      const ApexModule = await import('apexcharts');
      const ApexCharts = (ApexModule && (ApexModule as any).default) ? (ApexModule as any).default : (ApexModule as any);

      const options: any = {
        chart: {
          type: 'bar',
          height: 320,
          stacked: false,
          toolbar: { show: true },
          zoom: { enabled: false }
        },
        series: [
          { name: 'Budget Prévu', data: this.projetsTrendSeriesPrevu, color: '#3B82F6' },
          { name: 'Budget Payé', data: this.projetsTrendSeriesPaye, color: '#10B981' }
        ],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            borderRadius: 4,
            dataLabels: {
              position: 'top'
            }
          }
        },
        xaxis: {
          categories: this.projetsTrendCategories,
          labels: { rotate: -45, style: { fontSize: '11px' } }
        },
        yaxis: {
          labels: { formatter: (val: number) => this.formatCompactCurrency(val) },
          min: 0
        },
        dataLabels: { enabled: false },
        tooltip: {
          y: {
            formatter: (val: number) => `${this.formatCompactCurrency(Math.round(val))}`
          }
        },
        fill: { type: 'solid' },
        colors: ['#3B82F6', '#10B981'],
        grid: { borderColor: '#e6e6e6' },
        legend: { show: true }
      };

      if (this.projetsTrendChart) {
        this.projetsTrendChart.updateOptions({
          series: options.series,
          xaxis: { categories: this.projetsTrendCategories }
        }, true, true);
        return;
      }

      if (!this.projetsTrendChartRef || !this.projetsTrendChartRef.nativeElement) {
        console.warn('Projets trend chart container not available');
        return;
      }

      this.projetsTrendChart = new (ApexCharts)(this.projetsTrendChartRef.nativeElement, options);
      await this.projetsTrendChart.render();
    } catch (err) {
      console.warn('ApexCharts failed to load for projets trend chart.', err);
      this.destroyProjetsTrendChart();
    }
  }

  // New: render actions trend chart (grouped bars)
  async renderActionsTrendChart(): Promise<void> {
    try {
      const ApexModule = await import('apexcharts');
      const ApexCharts = (ApexModule && (ApexModule as any).default) ? (ApexModule as any).default : (ApexModule as any);

      const options: any = {
        chart: {
          type: 'bar',
          height: 320,
          stacked: false,
          toolbar: { show: true },
          zoom: { enabled: false }
        },
        series: [
          { name: 'Budget Prévu', data: this.actionsTrendSeriesPrevu, color: '#3B82F6' },
          { name: 'Budget Payé', data: this.actionsTrendSeriesPaye, color: '#10B981' }
        ],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            borderRadius: 4,
            dataLabels: {
              position: 'top'
            }
          }
        },
        xaxis: {
          categories: this.actionsTrendCategories,
          labels: { rotate: -45, style: { fontSize: '11px' } }
        },
        yaxis: {
          labels: { formatter: (val: number) => this.formatCompactCurrency(val) },
          min: 0
        },
        dataLabels: { enabled: false },
        tooltip: {
          y: {
            formatter: (val: number) => `${this.formatCompactCurrency(Math.round(val))}`
          }
        },
        fill: { type: 'solid' },
        colors: ['#3B82F6', '#10B981'],
        grid: { borderColor: '#e6e6e6' },
        legend: { show: true }
      };

      if (this.actionsTrendChart) {
        this.actionsTrendChart.updateOptions({
          series: options.series,
          xaxis: { categories: this.actionsTrendCategories }
        }, true, true);
        return;
      }

      if (!this.actionsTrendChartRef || !this.actionsTrendChartRef.nativeElement) {
        console.warn('Actions trend chart container not available');
        return;
      }

      this.actionsTrendChart = new (ApexCharts)(this.actionsTrendChartRef.nativeElement, options);
      await this.actionsTrendChart.render();
    } catch (err) {
      console.warn('ApexCharts failed to load for actions trend chart.', err);
      this.destroyActionsTrendChart();
    }
  }


  destroyCharts(): void {
    this.destroyMeasuresChart();
    this.destroyProjetsBudgetChart();
    this.destroyActionsBudgetChart();
    this.destroyProjetsTrendChart();
    this.destroyActionsTrendChart();
  }

  destroyMeasuresChart(): void {
    try {
      if (this.measuresChart && typeof this.measuresChart.destroy === 'function') {
        this.measuresChart.destroy();
      }
    } catch (e) {
      // ignore
    } finally {
      this.measuresChart = null;
    }
  }

  destroyProjetsBudgetChart(): void {
    try {
      if (this.projetsBudgetChart && typeof this.projetsBudgetChart.destroy === 'function') {
        this.projetsBudgetChart.destroy();
      }
    } catch (e) {
      // ignore
    } finally {
      this.projetsBudgetChart = null;
    }
  }

  destroyActionsBudgetChart(): void {
    try {
      if (this.actionsBudgetChart && typeof this.actionsBudgetChart.destroy === 'function') {
        this.actionsBudgetChart.destroy();
      }
    } catch (e) {
      // ignore
    } finally {
      this.actionsBudgetChart = null;
    }
  }

  // New destroy methods for trend charts
  destroyProjetsTrendChart(): void {
    try {
      if (this.projetsTrendChart && typeof this.projetsTrendChart.destroy === 'function') {
        this.projetsTrendChart.destroy();
      }
    } catch (e) {
      // ignore
    } finally {
      this.projetsTrendChart = null;
    }
  }

  destroyActionsTrendChart(): void {
    try {
      if (this.actionsTrendChart && typeof this.actionsTrendChart.destroy === 'function') {
        this.actionsTrendChart.destroy();
      }
    } catch (e) {
      // ignore
    } finally {
      this.actionsTrendChart = null;
    }
  }

  getUserInitials(user: string | undefined | null): string {
    if (!user) return '';
    return user.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Helpers used by templates to detect empty trend charts
  isProjetsTrendEmpty(): boolean {
    if (!this.projetsTrendSeriesPrevu || !this.projetsTrendSeriesPaye) return true;
    if (this.projetsTrendSeriesPrevu.length === 0 && this.projetsTrendSeriesPaye.length === 0) return true;
    const allZeroPrevu = this.projetsTrendSeriesPrevu.every(v => !v);
    const allZeroPaye = this.projetsTrendSeriesPaye.every(v => !v);
    return allZeroPrevu && allZeroPaye;
  }

  isActionsTrendEmpty(): boolean {
    if (!this.actionsTrendSeriesPrevu || !this.actionsTrendSeriesPaye) return true;
    if (this.actionsTrendSeriesPrevu.length === 0 && this.actionsTrendSeriesPaye.length === 0) return true;
    const allZeroPrevu = this.actionsTrendSeriesPrevu.every(v => !v);
    const allZeroPaye = this.actionsTrendSeriesPaye.every(v => !v);
    return allZeroPrevu && allZeroPaye;
  }
}