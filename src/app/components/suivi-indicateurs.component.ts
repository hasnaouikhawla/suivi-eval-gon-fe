import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SuiviIndicateurService, SuiviIndicateurFilters, ApiResponse } from '../services/suivi-indicateur.service';
import { IndicateurService } from '../services/indicateur.service';
import { SuiviIndicateur } from '../models/suivi-indicateur.model';
import { Indicateur } from '../models/indicateur.model';
import { SuiviIndicateurFormComponent } from './suivi-indicateur-form.component';
import { AccessControlService } from '../services/access-control.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-suivi-indicateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, SuiviIndicateurFormComponent],
  template: `
    <!-- Header Section -->
    <div class="bg-gray-100 shadow-none border-none">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Suivi des Indicateurs</h1>
            <p class="mt-1 text-sm text-gray-600">
              Enregistrement et suivi des mesures d'indicateurs
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              *ngIf="canAddMeasurements"
              type="button"
              (click)="openCreateModal()"
              class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Nouvelle Mesure
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-100">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <!-- Total Mesures -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-3 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Total Mesures</div>
                <div class="text-base sm:text-lg font-bold text-blue-600">{{ suiviIndicateurs.length }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicateurs Suivis -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-3 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Indicateurs</div>
                <div class="text-base sm:text-lg font-bold text-green-600">{{ getUniqueIndicateurs() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mesures Ce Mois -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-3 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Ce Mois</div>
                <div class="text-base sm:text-lg font-bold text-indigo-600">{{ getMesuresThisMonth() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dernière Mesure -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-3 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Dernière</div>
                <div class="text-base sm:text-lg font-bold text-orange-600">{{ getLastMeasureDate() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-6 py-6 sm:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Filtres de recherche</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Indicateur Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Indicateur
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.id_indicateur"
                  (change)="loadSuiviIndicateurs()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les indicateurs</option>
                  <option [value]="indicateur.id_indicateur" *ngFor="let indicateur of indicateurs">
                    {{ indicateur.nom_indicateur }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Date Début Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Date Début
              </label>
              <input
                type="date"
                [(ngModel)]="filters.date_debut"
                (input)="loadSuiviIndicateurs()"
                class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                       focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                       hover:border-gray-400">
            </div>

            <!-- Date Fin Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Date Fin
              </label>
              <input
                type="date"
                [(ngModel)]="filters.date_fin"
                (input)="loadSuiviIndicateurs()"
                [min]="filters.date_debut"
                class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                       focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                       hover:border-gray-400">
            </div>

            <!-- Clear Filters Button -->
            <div class="flex items-end">
              <button
                type="button"
                (click)="clearFilters()"
                *ngIf="hasActiveFilters()"
                class="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 ease-in-out">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Effacer les filtres
              </button>
            </div>
          </div>

          <!-- Preselected Indicateur Widget -->
          <div *ngIf="preselectedIndicateurId" class="mt-6 p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-semibold text-purple-900">Indicateur sélectionné</h4>
                  <p class="text-sm text-purple-700 mt-1 truncate">
                    {{ getSelectedIndicateurName() }}
                  </p>
                  <div class="flex items-center space-x-4 mt-2 text-xs text-purple-600">
                    <span>Valeur actuelle: <span class="font-semibold">{{ getSelectedIndicateurCurrentValue() }}</span></span>
                    <span>Cible: <span class="font-semibold">{{ getSelectedIndicateurTargetValue() }}</span></span>
                    <span>Progression: <span class="font-semibold">{{ getSelectedIndicateurProgress() }}%</span></span>
                  </div>
                  <p class="text-xs text-purple-600 mt-1">
                    Les mesures sont automatiquement filtrées pour cet indicateur
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Clear Filters Button (moved here for better positioning when widget is present) -->
          <div *ngIf="!preselectedIndicateurId" class="mt-6 flex justify-end">
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
          <p class="mt-4 text-sm text-gray-500">Chargement des mesures...</p>
        </div>
      </div>

      <!-- Suivi Indicateurs List -->
      <div *ngIf="!loading" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <!-- Desktop Table View -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicateur</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ajouté par</th>
                <th *ngIf="canEditMeasurements || canDeleteMeasurements" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let suivi of suiviIndicateurs" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ getIndicateurName(suivi.id_indicateur) }}</div>
                  <div class="text-xs text-gray-500" *ngIf="suivi.observations">
                    {{ suivi.observations | slice:0:60 }}{{ suivi.observations && suivi.observations.length > 60 ? '...' : '' }}
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="text-sm font-semibold text-indigo-600">
                    {{ suivi.valeur_mesure }}
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="text-sm text-gray-900">{{ formatDate(suivi.date_mesure) }}</div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center">
                    <div class="w-12 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="h-2 rounded-full transition-all duration-300"
                           [class.bg-red-500]="getIndicateurProgress(suivi) < 25"
                           [class.bg-yellow-500]="getIndicateurProgress(suivi) >= 25 && getIndicateurProgress(suivi) < 75"
                           [class.bg-green-500]="getIndicateurProgress(suivi) >= 75"
                           [style.width.%]="Math.min(getIndicateurProgress(suivi), 100)">
                      </div>
                    </div>
                    <span class="text-xs font-medium text-gray-700">{{ getIndicateurProgress(suivi) }}%</span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="text-sm text-gray-900">{{ suivi.added_by_name }}</div>
                </td>
                <td *ngIf="canEditMeasurements || canDeleteMeasurements" class="px-4 py-4 text-right">
                  <div class="flex justify-end space-x-2">
                    <button
                      *ngIf="canEditMeasurements"
                      type="button"
                      (click)="openEditModal(suivi)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      *ngIf="canDeleteMeasurements"
                      type="button"
                      (click)="confirmDelete(suivi)"
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
            <div *ngFor="let suivi of suiviIndicateurs" class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ getIndicateurName(suivi.id_indicateur) }}</h3>
                  <p class="text-xs text-gray-600 mt-1">{{ formatDate(suivi.date_mesure) }}</p>
                </div>
                <div class="ml-2 text-right">
                  <div class="text-sm font-semibold text-indigo-600">
                    {{ suivi.valeur_mesure }}
                  </div>
                  <div class="text-xs text-gray-500">{{ getIndicateurProgress(suivi) }}% de la cible</div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span class="font-medium">Ajouté par:</span>
                  <div class="text-gray-900">{{ suivi.added_by_name }}</div>
                </div>
                <div>
                  <span class="font-medium">Progression:</span>
                  <div class="flex items-center mt-1">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="h-2 rounded-full transition-all duration-300"
                           [class.bg-red-500]="getIndicateurProgress(suivi) < 25"
                           [class.bg-yellow-500]="getIndicateurProgress(suivi) >= 25 && getIndicateurProgress(suivi) < 75"
                           [class.bg-green-500]="getIndicateurProgress(suivi) >= 75"
                           [style.width.%]="Math.min(getIndicateurProgress(suivi), 100)">
                      </div>
                    </div>
                    <span class="text-xs font-medium text-gray-700">{{ getIndicateurProgress(suivi) }}%</span>
                  </div>
                </div>
              </div>

              <div *ngIf="suivi.observations" class="text-xs text-gray-500 mb-3">
                {{ suivi.observations }}
              </div>
              
              <div class="flex justify-end space-x-2" *ngIf="canEditMeasurements || canDeleteMeasurements">
                <button
                  *ngIf="canEditMeasurements"
                  type="button"
                  (click)="openEditModal(suivi)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                <button
                  *ngIf="canDeleteMeasurements"
                  type="button"
                  (click)="confirmDelete(suivi)"
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
        <div *ngIf="suiviIndicateurs.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucune mesure trouvée</h3>
          <p class="mt-2 text-sm text-gray-500">
            <span *ngIf="canAddMeasurements">Commencez par enregistrer une nouvelle mesure ou ajustez vos filtres.</span>
            <span *ngIf="!canAddMeasurements">Aucune mesure disponible avec les filtres actuels.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div *ngIf="isModalOpen && canAddMeasurements" 
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
                  {{ modalMode === 'edit' ? 'Modifier Mesure' : 'Nouvelle Mesure' }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ getModalDescription() }}
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
            <app-suivi-indicateur-form
              [suiviIndicateur]="selectedSuivi"
              [preselectedIndicateurId]="preselectedIndicateurId"
              (save)="onSuiviSaved($event)"
              (cancel)="closeModal()">
            </app-suivi-indicateur-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteConfirm && canDeleteMeasurements" 
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
                  Êtes-vous sûr de vouloir supprimer cette mesure pour "{{ getIndicateurNameSafe(suiviToDelete?.id_indicateur) }}" ? Cette action ne peut pas être annulée.
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
              (click)="deleteMeasurement()"
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
    </style>
  `
})
export class SuiviIndicateursComponent implements OnInit, OnDestroy {
  suiviIndicateurs: SuiviIndicateur[] = [];
  indicateurs: Indicateur[] = [];
  loading = false;
  deleting = false;

  // Preselected indicateur from query params or external navigation
  preselectedIndicateurId: number | null = null;

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Modal states
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedSuivi: SuiviIndicateur | null = null;
  
  // Delete confirmation
  showDeleteConfirm = false;
  suiviToDelete: SuiviIndicateur | null = null;

  // Filters
  filters: SuiviIndicateurFilters = {};

  // Permission properties
  canAddMeasurements = false;
  canEditMeasurements = false;
  canDeleteMeasurements = false;
  canBulkAdd = false;
  canTrendAnalysis = false;

  // Subscriptions
  private subs: Subscription[] = [];

  // Expose Math for template
  Math = Math;

  constructor(
    private suiviIndicateurService: SuiviIndicateurService,
    private indicateurService: IndicateurService,
    private accessControl: AccessControlService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadIndicateurs();
    
    // Read query param 'id_indicateur' (set by IndicateursComponent) and apply filter if present.
const sub = this.route.queryParams.subscribe(params => {
  const id = params['id_indicateur'] ?? params['idIndicateur'] ?? params['id'];
  if (id) {
    // ensure numeric
    const idNum = Number(id);
    if (!isNaN(idNum)) {
      this.preselectedIndicateurId = idNum;
      this.filters.id_indicateur = idNum;
      console.log('Indicateur preselected:', this.preselectedIndicateurId);
    }
  } else {
    // Clear preselected indicator when no query param is present
    this.preselectedIndicateurId = null;
    delete this.filters.id_indicateur;
  }
  // Load data after processing query params
  this.loadSuiviIndicateurs();
});
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  getModalDescription(): string {
    return this.modalMode === 'edit' 
      ? 'Modifiez cette mesure d\'indicateur' 
      : 'Enregistrez une nouvelle mesure d\'indicateur';
  }

  private checkPermissions() {
    this.canAddMeasurements = this.accessControl.canAccess('suiviIndicateurs', 'create');
    this.canEditMeasurements = this.accessControl.canAccess('suiviIndicateurs', 'update');
    this.canDeleteMeasurements = this.accessControl.canAccess('suiviIndicateurs', 'delete');
    this.canBulkAdd = this.accessControl.canAccess('suiviIndicateurs', 'bulkAdd');
    this.canTrendAnalysis = this.accessControl.canAccess('suiviIndicateurs', 'trendAnalysis');

    console.log('Suivi Indicateurs permissions:', {
      canAdd: this.canAddMeasurements,
      canEdit: this.canEditMeasurements,
      canDelete: this.canDeleteMeasurements,
      canBulkAdd: this.canBulkAdd,
      canTrendAnalysis: this.canTrendAnalysis
    });
  }

  loadIndicateurs() {
    const sub = this.indicateurService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.indicateurs = response.data || [];
          console.log('Indicateurs loaded:', this.indicateurs);
        } else {
          console.warn('Indicateurs response not successful:', response.message);
        }
      },
      error: (error: any) => {
        console.error('Error loading indicateurs:', error);
      }
    });
    this.subs.push(sub);
  }

  loadSuiviIndicateurs() {
    this.loading = true;
    console.log('Loading suivi indicateurs with filters:', this.filters);
    
    const sub = this.suiviIndicateurService.getAll(this.filters).subscribe({
      next: (response: any) => {
        console.log('Suivi Indicateurs response:', response);
        if (response.success) {
          this.suiviIndicateurs = response.data || [];
        } else {
          this.showError(response.message || 'Erreur lors du chargement des mesures');
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading suivi indicateurs:', error);
        this.showError('Erreur lors du chargement des mesures');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.id_indicateur ||
      this.filters.date_debut ||
      this.filters.date_fin
    );
  }

  clearFilters() {
    this.filters = {};
    this.preselectedIndicateurId = null;
    
    // Clear URL query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });

    this.loadSuiviIndicateurs();
    this.showSuccess('Filtres effacés avec succès');
  }

  // Get selected indicateur name for the widget
  getSelectedIndicateurName(): string {
    if (!this.preselectedIndicateurId) return '';
    const indicateur = this.indicateurs.find(i => i.id_indicateur === this.preselectedIndicateurId);
    return indicateur ? indicateur.nom_indicateur : `Indicateur #${this.preselectedIndicateurId}`;
  }

  // Get selected indicateur current value
  getSelectedIndicateurCurrentValue(): string {
    if (!this.preselectedIndicateurId) return '-';
    const indicateur = this.indicateurs.find(i => i.id_indicateur === this.preselectedIndicateurId);
    return indicateur ? String(indicateur.valeur_realisee || 0) : '-';
  }

  // Get selected indicateur target value
  getSelectedIndicateurTargetValue(): string {
    if (!this.preselectedIndicateurId) return '-';
    const indicateur = this.indicateurs.find(i => i.id_indicateur === this.preselectedIndicateurId);
    return indicateur ? String(indicateur.valeur_cible || 0) : '-';
  }

  // Get selected indicateur progress percentage
  getSelectedIndicateurProgress(): string {
    if (!this.preselectedIndicateurId) return '0';
    const indicateur = this.indicateurs.find(i => i.id_indicateur === this.preselectedIndicateurId);
    if (!indicateur || !indicateur.valeur_cible) return '0';
    const progress = Math.round(((indicateur.valeur_realisee || 0) / indicateur.valeur_cible) * 100);
    return String(progress);
  }

  getIndicateurName(indicateurId: number): string {
    const indicateur = this.indicateurs.find(i => i.id_indicateur === indicateurId);
    return indicateur ? indicateur.nom_indicateur : 'Indicateur inconnu';
  }

  getIndicateurNameSafe(indicateurId: number | undefined): string {
    if (!indicateurId) return 'Indicateur inconnu';
    return this.getIndicateurName(indicateurId);
  }

  getIndicateurProgress(suivi: SuiviIndicateur): number {
    const indicateur = this.indicateurs.find(i => i.id_indicateur === suivi.id_indicateur);
    if (!indicateur || !indicateur.valeur_cible) return 0;
    return Math.round((suivi.valeur_mesure / indicateur.valeur_cible) * 100);
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getUniqueIndicateurs(): number {
    const uniqueIndicateurs = new Set(this.suiviIndicateurs.map(suivi => suivi.id_indicateur));
    return uniqueIndicateurs.size;
  }

  getMesuresThisMonth(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.suiviIndicateurs.filter(suivi => 
      new Date(suivi.date_mesure) >= startOfMonth
    ).length;
  }

  getLastMeasureDate(): string {
    if (this.suiviIndicateurs.length === 0) return '-';
    const lastMeasure = this.suiviIndicateurs.reduce((latest, current) => 
      new Date(current.date_mesure) > new Date(latest.date_mesure) ? current : latest
    );
    return this.formatDate(lastMeasure.date_mesure);
  }

  openCreateModal() {
    if (!this.canAddMeasurements) {
      this.showError('Vous n\'avez pas les permissions pour ajouter des mesures');
      return;
    }
    
    this.selectedSuivi = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(suivi: SuiviIndicateur) {
    if (!this.canEditMeasurements) {
      this.showError('Vous n\'avez pas les permissions pour modifier des mesures');
      return;
    }
    
    this.selectedSuivi = { ...suivi };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedSuivi = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedSuivi = null;
      this.modalMode = 'create';
    }
  }

  confirmDelete(suivi: SuiviIndicateur) {
    if (!this.canDeleteMeasurements) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des mesures');
      return;
    }
    
    this.suiviToDelete = suivi;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.suiviToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteMeasurement() {
    if (!this.suiviToDelete || !this.canDeleteMeasurements) return;

    this.deleting = true;
    const sub = this.suiviIndicateurService.deleteMeasurement(this.suiviToDelete.id_suivi).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadSuiviIndicateurs();
          this.showSuccess(`Mesure pour "${this.getIndicateurName(this.suiviToDelete!.id_indicateur)}" supprimée avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error: any) => {
        console.error('Error deleting measurement:', error);
        this.showError('Erreur lors de la suppression de la mesure');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  onSuiviSaved(suivi: SuiviIndicateur) {
    this.loadSuiviIndicateurs();
    
    if (this.modalMode === 'create') {
      this.showSuccess(`Mesure enregistrée avec succès`);
    } else {
      this.showSuccess(`Mesure modifiée avec succès`);
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