import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PlanAnnuelService, PlanAnnuelFilters } from '../services/plan-annuel.service';
import { ProjetService } from '../services/projet.service';
import { PlanAnnuel } from '../models/plan-annuel.model';
import { Projet } from '../models/projet.model';
import { PlanAnnuelFormComponent } from './plan-annuel-form.component';
import { AccessControlService } from '../services/access-control.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

interface PlanAnnuelDisplay extends PlanAnnuel {
  showprojets?: boolean;
  projetsData?: Projet[];
}

@Component({
  selector: 'app-plans-annuels',
  standalone: true,
  imports: [CommonModule, FormsModule, PlanAnnuelFormComponent],
  template: `
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gestion des Plans Annuels</h1>
            <p class="mt-1 text-sm text-gray-600">
              Planification et suivi des projets par année
            </p>
          </div>
          <button
            *ngIf="canCreatePlans"
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nouveau Plan
          </button>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Plans -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Total Plans</div>
                <div class="text-2xl font-bold text-gray-900">{{ plansAnnuels.length }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Plans Actifs -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">En cours</div>
                <div class="text-2xl font-bold text-green-600">{{ getPlansEnCours() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Durée Moyenne -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
           <div class="px-4 py-5 sm:p-6">
             <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                     <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                     </svg>
                  </div>
                </div>
               <div class="ml-4 flex-1">
                 <div class="text-sm font-medium text-gray-500">Durée Moyenne</div>
                  <div class="text-2xl font-bold text-purple-600">{{ getDureeMoyenne() }} jours</div>
              </div>
             </div>
           </div>
        </div>

        <!-- projets Liées -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">projets</div>
                <div class="text-2xl font-bold text-orange-600">{{ getUniqueprojets() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-6 py-6 sm:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Filtres de recherche</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <!-- Rechercher -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Rechercher
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (input)="filterPlans()"
                  placeholder="Intitulé du plan..."
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         placeholder-gray-400 
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed">
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Year Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Année
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.annee"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Toutes les années</option>
                  <option *ngFor="let y of years" [ngValue]="y">{{ y }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Responsable Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Responsable
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.responsable"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les responsables</option>
                  <option *ngFor="let u of users" [value]="getUserValue(u)">
                    {{ getUserDisplay(u) }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- projet Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                projet
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.id_projet"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 pr-10 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Toutes les projets</option>
                  <option *ngFor="let projet of projets" [value]="projet.id_projet">
                    {{ projet.titre }}{{ projet.id_projet ? (' — #' + projet.id_projet) : '' }}
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
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-sm text-gray-500">Chargement des plans annuels...</p>
        </div>
      </div>

      <!-- Plans Annuels List -->
      <div *ngIf="!loading" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Annuel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéances</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th *ngIf="canEditPlans || canDeletePlans" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">projets</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <ng-container *ngFor="let plan of filteredPlans; trackBy: trackByPlanId">
                <!-- Plan Row -->
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <button
                        type="button"
                        (click)="toggleprojets(plan)"
                        class="mr-3 p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <svg 
                          class="w-4 h-4 text-gray-500 transition-transform duration-200"
                          [class.rotate-90]="plan.showprojets"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ plan.intitule }}</div>
                        <div class="text-xs text-gray-500 mt-1">
                          {{ getprojetCount(plan) }} action(s) planifiée(s)
                        </div>
                        <div class="text-xs text-gray-500" *ngIf="plan.observations">
                          {{ plan.observations | slice:0:60 }}{{ plan.observations && plan.observations.length > 60 ? '...' : '' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {{ plan.annee }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">
                      <ng-container *ngIf="isNumber(plan.responsable); else textResp">
                        {{ resolveUserDisplay(plan.responsable) }}
                      </ng-container>
                      <ng-template #textResp>{{ plan.responsable || '-' }}</ng-template>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs text-gray-600">
                      <div>Début: {{ formatDate(plan.echeance_debut) }}</div>
                      <div>Fin: {{ formatDate(plan.echeance_fin) }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ getPlanDuration(plan) }} jours</div>
                    <div class="text-xs" [class.text-green-600]="isPlanActive(plan)" [class.text-gray-500]="!isPlanActive(plan)">
                      {{ getPlanStatus(plan) }}
                    </div>
                  </td>
                  <td *ngIf="canEditPlans || canDeletePlans" class="px-6 py-4 text-right">
                    <div class="flex justify-end space-x-2">
                      <button
                        *ngIf="canEditPlans"
                        type="button"
                        (click)="openEditModal(plan)"
                        class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        *ngIf="canDeletePlans"
                        type="button"
                        (click)="confirmDelete(plan)"
                        class="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expandable projets Row -->
                <tr *ngIf="plan.showprojets" class="bg-gray-50">
                  <td colspan="6" class="px-6 py-0">
                    <div class="py-4">
                      <div class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Actions Associées
                      </div>
                      <div class="space-y-2" *ngIf="plan.projetsData && plan.projetsData.length > 0; else noprojets">
                        <div 
                          *ngFor="let projet of plan.projetsData" 
                          class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                          <div class="flex items-center justify-between">
                            <div class="flex-1">
                              <div class="flex items-center space-x-3">
                                <h4 class="text-sm font-medium text-gray-900">{{ projet.titre }}</h4>
                                <span [class]="getprojetstatusClass(projet.statut)" 
                                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap">
                                  {{ projet.statut }}
                                </span>
                              </div>
                              <div class="mt-1 text-xs text-gray-500 space-x-4">
                                <span>Zone: {{ projet.commune || 'Zone ' + projet.id_zone }}</span>
                                <span>{{ formatDate(projet.date_debut) }} - {{ formatDate(projet.date_fin) }}</span>
                                <span>{{ resolveUserDisplay(projet.responsable) }}</span>
                              </div>
                              <div *ngIf="projet.observations" class="mt-2 text-xs text-gray-600">
                                {{ projet.observations | slice:0:120 }}{{ projet.observations && projet.observations.length > 120 ? '...' : '' }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ng-template #noprojets>
                        <div class="text-sm text-gray-500 italic bg-white rounded-lg border border-gray-200 p-4">
                          Aucune projet détaillée disponible
                        </div>
                      </ng-template>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="lg:hidden">
          <div class="divide-y divide-gray-200">
            <div *ngFor="let plan of filteredPlans; trackBy: trackByPlanId" class="p-4 hover:bg-gray-50 transition-colors">
              <!-- Plan Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <button
                      type="button"
                      (click)="toggleprojets(plan)"
                      class="mr-2 p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <svg 
                        class="w-4 h-4 text-gray-500 transition-transform duration-200"
                        [class.rotate-90]="plan.showprojets"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <h3 class="text-sm font-medium text-gray-900">{{ plan.intitule }}</h3>
                  </div>
                  <p class="text-xs text-gray-600">
                    {{ getprojetCount(plan) }} projet(s) • 
                    <ng-container *ngIf="isNumber(plan.responsable); else txtRespMobile">
                      {{ resolveUserDisplay(plan.responsable) }}
                    </ng-container>
                    <ng-template #txtRespMobile>{{ plan.responsable || 'Aucun responsable' }}</ng-template>
                  </p>
                </div>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 ml-2">
                  {{ plan.annee }}
                </span>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span class="font-medium">Début:</span>
                  <div class="text-gray-900">{{ formatDate(plan.echeance_debut) }}</div>
                </div>
                <div>
                  <span class="font-medium">Fin:</span>
                  <div class="text-gray-900">{{ formatDate(plan.echeance_fin) }}</div>
                </div>
                <div>
                  <span class="font-medium">Durée:</span>
                  <div class="text-gray-900">{{ getPlanDuration(plan) }} jours</div>
                </div>
                <div>
                  <span class="font-medium">Statut:</span>
                  <div [class.text-green-600]="isPlanActive(plan)" [class.text-gray-500]="!isPlanActive(plan)">
                    {{ getPlanStatus(plan) }}
                  </div>
                </div>
              </div>

              <div *ngIf="plan.observations" class="text-xs text-gray-500 mb-3">
                {{ plan.observations }}
              </div>

              <!-- Expandable projets for Mobile -->
              <div *ngIf="plan.showprojets" class="mt-4 bg-gray-50 -mx-4 px-4 py-3">
                <div class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  projets associées
                </div>
                <div class="space-y-3" *ngIf="plan.projetsData && plan.projetsData.length > 0; else noprojetsMobile">
                  <div 
                    *ngFor="let projet of plan.projetsData" 
                    class="bg-white rounded-lg border border-gray-200 p-3">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="text-sm font-medium text-gray-900">{{ projet.titre }}</h4>
                      <span [class]="getprojetstatusClass(projet.statut)" 
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap">
                        {{ projet.statut }}
                      </span>
                    </div>
                    <div class="text-xs text-gray-500 space-y-1">
                      <div>Zone: {{ projet.commune || 'Zone ' + projet.id_zone }}</div>
                      <div>{{ formatDate(projet.date_debut) }} - {{ formatDate(projet.date_fin) }}</div>
                      <div>{{ resolveUserDisplay(projet.responsable) }}</div>
                    </div>
                    <div *ngIf="projet.observations" class="mt-2 text-xs text-gray-600">
                      {{ projet.observations | slice:0:80 }}{{ projet.observations && projet.observations.length > 80 ? '...' : '' }}
                    </div>
                  </div>
                </div>
                <ng-template #noprojetsMobile>
                  <div class="text-sm text-gray-500 italic bg-white rounded-lg border border-gray-200 p-3">
                    Aucune projet détaillée disponible
                  </div>
                </ng-template>
              </div>
              
              <div class="flex justify-end space-x-2 mt-4" *ngIf="canEditPlans || canDeletePlans">
                <button
                  *ngIf="canEditPlans"
                  type="button"
                  (click)="openEditModal(plan)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                <button
                  *ngIf="canDeletePlans"
                  type="button"
                  (click)="confirmDelete(plan)"
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

        <!-- Empty State -->
        <div *ngIf="filteredPlans.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun plan annuel trouvé</h3>
          <p class="mt-2 text-sm text-gray-500">
            <span *ngIf="canCreatePlans">Commencez par créer un nouveau plan annuel ou ajustez vos filtres.</span>
            <span *ngIf="!canCreatePlans">Aucun plan annuel disponible avec les filtres actuels.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div *ngIf="isModalOpen && canCreatePlans" 
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
                  {{ modalMode === 'edit' ? 'Modifier Plan Annuel' : 'Nouveau Plan Annuel' }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ modalMode === 'edit' ? 'Modifiez les informations de ce plan' : 'Créez un nouveau plan de planification annuelle' }}
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
            <app-plan-annuel-form
              [planAnnuel]="selectedPlan"
              (save)="onPlanSaved($event)"
              (cancel)="closeModal()">
            </app-plan-annuel-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteConfirm && canDeletePlans" 
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
                  Êtes-vous sûr de vouloir supprimer le plan annuel "<span class="font-medium">{{ planToDelete?.intitule }}</span>" ({{ planToDelete?.annee }}) ? Cette projet ne peut pas être annulée.
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
              (click)="deletePlan()"
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

    <style>
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

      .rotate-90 {
        transform: rotate(90deg);
      }
    </style>
  `
})
export class PlansAnnuelsComponent implements OnInit, OnDestroy {
  plansAnnuels: PlanAnnuelDisplay[] = [];
  filteredPlans: PlanAnnuelDisplay[] = [];
  projets: Projet[] = [];
  users: User[] = [];
  years: number[] = [];
  loading = false;
  deleting = false;
  currentYear = new Date().getFullYear();

  // Search and filters
  searchTerm = '';

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Modal states
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedPlan: PlanAnnuel | null = null;
  
  // Delete confirmation
  showDeleteConfirm = false;
  planToDelete: PlanAnnuel | null = null;

  // Filters
  filters: PlanAnnuelFilters = {};

  // Permission properties
  canCreatePlans = false;
  canEditPlans = false;
  canDeletePlans = false;

  // Subscriptions
  private subs: Subscription[] = [];

  constructor(
    private planAnnuelService: PlanAnnuelService,
    private projetsvc: ProjetService,
    private userService: UserService,
    private accessControl: AccessControlService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadprojets();
    this.loadUsers();
    this.loadYearsFromBackend();
    this.loadPlansAnnuels();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  trackByPlanId(index: number, plan: PlanAnnuelDisplay): number {
    return plan.id_plan;
  }

  loadYearsFromBackend() {
    const sub = this.planAnnuelService.getAll().subscribe({
      next: (response: any) => {
        if (!response || !response.success || !Array.isArray(response.data)) {
          this.years = [];
          return;
        }
        const plans: PlanAnnuel[] = response.data;
        const set = new Set<number>();
        plans.forEach(p => {
          if (p && p.annee != null) {
            const n = Number(p.annee);
            if (!isNaN(n)) set.add(n);
          }
        });
        
        this.years = Array.from(set).sort((a,b) => b - a);
      },
      error: (err) => {
        console.error('Failed to load years from backend:', err);
        this.years = [];
      }
    });
    this.subs.push(sub);
  }

  private checkPermissions() {
    this.canCreatePlans = this.accessControl.canAccess('plansAnnuels', 'create');
    this.canEditPlans = this.accessControl.canAccess('plansAnnuels', 'update');
    this.canDeletePlans = this.accessControl.canAccess('plansAnnuels', 'delete');

    console.log('Plans Annuels permissions:', {
      canCreate: this.canCreatePlans,
      canEdit: this.canEditPlans,
      canDelete: this.canDeletePlans
    });
  }

  loadprojets() {
    const sub = this.projetsvc.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.projets = response.data || [];
          console.log('projets loaded:', this.projets);
        } else {
          console.warn('projets response not successful:', response.message);
        }
      },
      error: (error: any) => {
        console.error('Error loading projets:', error);
      }
    });
    this.subs.push(sub);
  }

  loadUsers() {
    const sub = this.userService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.users = response.data || [];
          console.log('Users loaded for responsable filter:', this.users);
        } else {
          console.warn('Users response not successful:', response.message);
          this.users = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading users for responsable filter:', error);
        this.users = [];
      }
    });
    this.subs.push(sub);
  }

  getUserValue(u: User): string {
    const anyU = u as any;
    return String(anyU.id_utilisateur ?? '');
  }

  getUserDisplay(u: User): string {
    const anyU = u as any;
    if (anyU.fullName) return anyU.fullName;
    if (anyU.prenom || anyU.nom) {
      return `${anyU.prenom ? anyU.prenom + ' ' : ''}${anyU.nom ? anyU.nom : ''}`.trim();
    }
    return anyU.login ?? anyU.email ?? `#${anyU.id_utilisateur ?? 'user'}`;
  }

  loadPlansAnnuels() {
    this.loading = true;
    console.log('Loading plans annuels with filters:', this.filters);
    
    const sub = this.planAnnuelService.getAll(this.filters).subscribe({
      next: (response: any) => {
        console.log('Plans Annuels response:', response);
        if (response.success) {
          this.plansAnnuels = (response.data || []).map((plan: PlanAnnuel) => ({
            ...plan,
            showprojets: false,
            projetsData: []
          } as PlanAnnuelDisplay));
          this.filterPlans();
        } else {
          this.showError(response.message || 'Erreur lors du chargement des plans annuels');
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading plans annuels:', error);
        this.showError('Erreur lors du chargement des plans annuels');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  filterPlans() {
    const term = (this.searchTerm || '').trim().toLowerCase();

    this.filteredPlans = this.plansAnnuels.filter(plan => {
      if (term) {
        if (!plan.intitule || !plan.intitule.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }

  onFilterChange() {
    this.loadPlansAnnuels();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.filters.annee ||
      this.filters.responsable ||
      this.filters.id_projet
    );
  }

  clearFilters() {
    this.searchTerm = '';
    this.filters = {};
    this.loadPlansAnnuels();
    this.showSuccess('Filtres effacés avec succès');
  }

  toggleprojets(plan: PlanAnnuelDisplay) {
    plan.showprojets = !plan.showprojets;
    
    if (plan.showprojets && (!plan.projetsData || plan.projetsData.length === 0)) {
      this.loadprojetsForPlan(plan);
    }
  }

  private getPlanProjectIds(plan: PlanAnnuel): number[] {
    const anyP = plan as any;
    if (Array.isArray(anyP.id_projets)) {
      return anyP.id_projets.map((id: any) => Number(id));
    }
    if (Array.isArray(anyP.projets)) {
      return (anyP.projets as any[]).map(p => Number(p.id_projet)).filter(n => !isNaN(n));
    }
    return [];
  }

  private loadprojetsForPlan(plan: PlanAnnuelDisplay) {
    const projectIds = this.getPlanProjectIds(plan);
    if (projectIds.length === 0) {
      plan.projetsData = [];
      return;
    }

    // Get projets data from already loaded projets by matching projet.id_projet
    plan.projetsData = this.projets.filter(projet => projectIds.includes(Number(projet.id_projet)));
  }

  getprojetCount(plan: PlanAnnuel): number {
    const projectIds = this.getPlanProjectIds(plan);
    if (projectIds.length === 0) return 0;
    return this.projets.filter(a => projectIds.includes(Number(a.id_projet))).length;
  }

  getprojetstatusClass(statut: string): string {
    const classes = {
      'Planifiée': 'bg-amber-100 text-amber-800',
      'En cours': 'bg-blue-100 text-blue-800',
      'Terminée': 'bg-green-100 text-green-800',
      'Suspendue': 'bg-red-100 text-red-800'
    };
    return (classes as any)[statut] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date?: Date | string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getPlanDuration(plan: PlanAnnuel): number {
    if (!plan.echeance_debut || !plan.echeance_fin) return 0;
    const debut = new Date(plan.echeance_debut);
    const fin = new Date(plan.echeance_fin);
    const diffTime = fin.getTime() - debut.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isPlanActive(plan: PlanAnnuel): boolean {
    const now = new Date();
    const debut = new Date(plan.echeance_debut);
    const fin = new Date(plan.echeance_fin);
    return now >= debut && now <= fin;
  }

  getPlanStatus(plan: PlanAnnuel): string {
    const now = new Date();
    const debut = new Date(plan.echeance_debut);
    const fin = new Date(plan.echeance_fin);
    
    if (now < debut) return 'À venir';
    if (now > fin) return 'Terminé';
    return 'En cours';
  }

  getPlansEnCours(): number {
    return this.plansAnnuels.filter(plan => this.isPlanActive(plan)).length;
  }

  getUniqueprojets(): number {
    const uniqueprojets = new Set<number>();
    // For each plan, collect projets whose id_projet is in plan.id_projets
    this.plansAnnuels.forEach(plan => {
      const projectIds = this.getPlanProjectIds(plan);
      if (projectIds.length === 0) return;
      this.projets.forEach(projet => {
        if (projectIds.includes(Number(projet.id_projet))) {
          uniqueprojets.add(Number(projet.id_projet));
        }
      });
    });
    return uniqueprojets.size;
  }

  openCreateModal() {
    if (!this.canCreatePlans) {
      this.showError('Vous n\'avez pas les permissions pour créer des plans annuels');
      return;
    }
    
    this.selectedPlan = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(plan: PlanAnnuel) {
    if (!this.canEditPlans) {
      this.showError('Vous n\'avez pas les permissions pour modifier des plans annuels');
      return;
    }
    
    this.selectedPlan = { ...plan };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedPlan = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedPlan = null;
      this.modalMode = 'create';
    }
  }

  confirmDelete(plan: PlanAnnuel) {
    if (!this.canDeletePlans) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des plans annuels');
      return;
    }
    
    this.planToDelete = plan;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.planToDelete = null;
    this.showDeleteConfirm = false;
  }

  deletePlan() {
    if (!this.planToDelete || !this.canDeletePlans) return;

    this.deleting = true;
    const sub = this.planAnnuelService.delete(this.planToDelete.id_plan).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadPlansAnnuels();
          this.showSuccess(`Plan annuel "${this.planToDelete!.intitule}" (${this.planToDelete!.annee}) supprimé avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error: any) => {
        console.error('Error deleting plan annuel:', error);
        this.showError('Erreur lors de la suppression du plan annuel');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  onPlanSaved(plan: PlanAnnuel) {
    this.loadPlansAnnuels();
    
    if (this.modalMode === 'create') {
      this.showSuccess(`Plan annuel créé avec succès`);
    } else {
      this.showSuccess(`Plan annuel modifié avec succès`);
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
  
  getDureeMoyenne(): number {
    if (this.plansAnnuels.length === 0) return 0;
    
    const plansAvecDuree = this.plansAnnuels.filter(plan => 
      plan.echeance_debut && plan.echeance_fin
    );
    
    if (plansAvecDuree.length === 0) return 0;
    
    const totalDuration = plansAvecDuree.reduce((sum, plan) => {
      return sum + this.getPlanDuration(plan);
    }, 0);
    
    return Math.round(totalDuration / plansAvecDuree.length);
  }

  // Helpers for responsable display/filters
  isNumber(v: any): boolean {
    if (v === null || v === undefined) return false;
    return !isNaN(Number(v));
  }

  resolveUserDisplay(idOrValue: any): string {
    const id = Number(idOrValue);
    if (!isNaN(id)) {
      const u = this.users.find(x => x.id_utilisateur === id);
      if (u) {
        return `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.login || u.email || `#${u.id_utilisateur}`;
      }
    }
    return String(idOrValue ?? '');
  }
}