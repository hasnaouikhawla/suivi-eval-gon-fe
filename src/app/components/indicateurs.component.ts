import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IndicateurService, IndicateurFilters, IndicateurStats, ApiResponse } from '../services/indicateur.service';
import { Indicateur, IndicateurStatus } from '../models/indicateur.model';
import { CadreLogique } from '../models/cadre-logique.model';
import { IndicateurFormComponent } from './indicateur-form.component';
import { AccessControlService } from '../services/access-control.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-indicateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, IndicateurFormComponent],
  template: `
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gestion des Indicateurs</h1>
            <p class="mt-1 text-sm text-gray-600">
              Suivi et évaluation des indicateurs de performance
            </p>
          </div>
          <button
            *ngIf="canCreateIndicateurs"
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nouvel Indicateur
          </button>
          <div *ngIf="!canCreateIndicateurs" class="text-sm text-gray-500 italic">
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <!-- Total -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Total</div>
                <div class="text-lg font-bold text-gray-900">{{ stats?.total || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Atteints -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-sm">🟢</span>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Atteints</div>
                <div class="text-lg font-bold text-green-600">{{ getStatValue('Atteint') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modérés -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span class="text-sm">🟠</span>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Modérés</div>
                <div class="text-lg font-bold text-orange-600">{{ getStatValue('Modéré') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- En retard -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span class="text-sm">🔴</span>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">En retard</div>
                <div class="text-lg font-bold text-red-600">{{ getStatValue('Retard') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progression moyenne -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Moyenne</div>
                <div class="text-lg font-bold text-purple-600">{{ stats?.averageProgress || 0 }}%</div>
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
                  (input)="filterIndicateurs()"
                  placeholder="Nom de l'indicateur..."
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

            <!-- Source -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Source
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.source"
                  (change)="loadIndicateurs()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Toutes les sources</option>
                  <option value="Interne">Interne</option>
                  <option value="Externe">Externe</option>
                  <option value="Mixte">Mixte</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Statut -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Statut
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="statusFilter"
                  (change)="filterIndicateurs()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les statuts</option>
                  <option value="Atteint">🟢 Atteints</option>
                  <option value="Modéré">🟠 Modérés</option>
                  <option value="Retard">🔴 En retard</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Cadre Logique Dropdown -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Cadre Logique
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.cadre_logique_id"
                  (change)="loadIndicateurs()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les cadres logiques</option>
                  <option [value]="cadre.id_cadre" *ngFor="let cadre of cadreLogiques">
                    {{ getCadreLogiqueLabel(cadre) }}
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
          <p class="mt-4 text-sm text-gray-500">Chargement des indicateurs...</p>
        </div>
      </div>

      <!-- Indicateurs Table/Cards -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden" *ngIf="!loading">
        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicateur</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeurs</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th *ngIf="canEditIndicateurs || canDeleteIndicateurs || canUpdateProgress" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let indicateur of filteredIndicateurs" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ indicateur.nom_indicateur }}</div>
                  <div class="text-sm text-gray-500 mt-1" *ngIf="indicateur.cadre_logique_nom">
                    Cadre logique: {{ indicateur.cadre_logique_nom }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [class.bg-blue-100]="indicateur.source === 'Interne'"
                        [class.text-blue-800]="indicateur.source === 'Interne'"
                        [class.bg-green-100]="indicateur.source === 'Externe'"
                        [class.text-green-800]="indicateur.source === 'Externe'"
                        [class.bg-purple-100]="indicateur.source === 'Mixte'"
                        [class.text-purple-800]="indicateur.source === 'Mixte'">
                    {{ indicateur.source }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    <span class="font-semibold">{{ indicateur.valeur_realisee || 0 }}</span> / {{ indicateur.valeur_cible }}
                  </div>
                  <div class="text-xs text-gray-500" *ngIf="canUpdateProgress">
                    <input 
                      type="number" 
                      [value]="indicateur.valeur_realisee || 0"
                      (change)="updateProgress(indicateur, $event)"
                      min="0"
                      step="0.01"
                      class="w-20 px-2 py-1 text-xs border border-gray-300 rounded">
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="h-2 rounded-full transition-all duration-300"
                           [class.bg-green-500]="getProgress(indicateur) >= 100"
                           [class.bg-orange-500]="getProgress(indicateur) >= 50 && getProgress(indicateur) < 100"
                           [class.bg-red-500]="getProgress(indicateur) < 50"
                           [style.width.%]="Math.min(getProgress(indicateur), 100)">
                      </div>
                    </div>
                    <span class="text-sm text-gray-700">{{ getProgress(indicateur) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-base">{{ getStatusDisplay(indicateur.statut) }}</span>
                </td>
                <td *ngIf="canEditIndicateurs || canDeleteIndicateurs || canUpdateProgress" class="px-6 py-4 text-right">
                  <div class="flex justify-end space-x-2">
				    <button
                      type="button"
                      (click)="goToSuivi(indicateur)"
                      class="inline-flex items-center p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
					
                    <button
                      *ngIf="canEditIndicateurs"
                      type="button"
                      (click)="openEditModal(indicateur)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>

                    <button
                      *ngIf="canDeleteIndicateurs"
                      type="button"
                      (click)="confirmDelete(indicateur)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                    <div *ngIf="!canEditIndicateurs && !canDeleteIndicateurs && !canUpdateProgress" class="text-xs text-gray-400 italic px-2 py-1">
                      Lecture seule
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="lg:hidden">
          <div class="divide-y divide-gray-200">
            <div *ngFor="let indicateur of filteredIndicateurs" class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-900">{{ indicateur.nom_indicateur }}</h3>
                <span class="text-base">{{ getStatusDisplay(indicateur.statut) }}</span>
              </div>
              
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span class="font-medium">Source:</span>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [class.bg-blue-100]="indicateur.source === 'Interne'"
                        [class.text-blue-800]="indicateur.source === 'Interne'"
                        [class.bg-green-100]="indicateur.source === 'Externe'"
                        [class.text-green-800]="indicateur.source === 'Externe'"
                        [class.bg-purple-100]="indicateur.source === 'Mixte'"
                        [class.text-purple-800]="indicateur.source === 'Mixte'">
                    {{ indicateur.source }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Valeurs:</span>
                  <span>{{ indicateur.valeur_realisee || 0 }} / {{ indicateur.valeur_cible }}</span>
                </div>
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="font-medium">Progression:</span>
                    <span>{{ getProgress(indicateur) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300"
                         [class.bg-green-500]="getProgress(indicateur) >= 100"
                         [class.bg-orange-500]="getProgress(indicateur) >= 50 && getProgress(indicateur) < 100"
                         [class.bg-red-500]="getProgress(indicateur) < 50"
                         [style.width.%]="Math.min(getProgress(indicateur), 100)">
                    </div>
                  </div>
                </div>
                <div *ngIf="indicateur.cadre_logique_nom" class="mt-2">
                  <span class="font-medium">Cadre logique:</span>
                  <p class="mt-1 text-xs">{{ indicateur.cadre_logique_nom }}</p>
                </div>
                
                <!-- Mobile Progress Update -->
                <div *ngIf="canUpdateProgress" class="mt-2">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Mettre à jour la valeur réalisée:</label>
                  <input 
                    type="number" 
                    [value]="indicateur.valeur_realisee || 0"
                    (change)="updateProgress(indicateur, $event)"
                    min="0"
                    step="0.01"
                    class="w-full px-2 py-1 text-xs border border-gray-300 rounded">
                </div>
              </div>
              
              <div class="flex justify-end space-x-2 mt-4" *ngIf="canEditIndicateurs || canDeleteIndicateurs">
			    <button
                  type="button"
                  (click)="goToSuivi(indicateur)"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Mesures
                </button>
				
                <button
                  *ngIf="canEditIndicateurs"
                  type="button"
                  (click)="openEditModal(indicateur)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>

                <button
                  *ngIf="canDeleteIndicateurs"
                  type="button"
                  (click)="confirmDelete(indicateur)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>
              <div *ngIf="!canEditIndicateurs && !canDeleteIndicateurs && !canUpdateProgress" class="text-xs text-gray-400 italic text-center mt-4">
                Mode lecture seule - Vous n'avez pas les permissions pour modifier
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredIndicateurs.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun indicateur trouvé</h3>
          <p class="mt-2 text-sm text-gray-500">
            <span *ngIf="canCreateIndicateurs">Commencez par créer un nouvel indicateur ou ajustez vos filtres.</span>
            <span *ngIf="!canCreateIndicateurs">Aucun indicateur disponible avec les filtres actuels.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal with Professional Overlay -->
    <div *ngIf="isModalOpen && canCreateIndicateurs" 
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
                  {{ modalMode === 'edit' ? 'Modifier Indicateur' : 'Nouvel Indicateur' }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ modalMode === 'edit' ? 'Modifiez les informations de cet indicateur' : 'Créez un nouvel indicateur de performance' }}
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
            <app-indicateur-form
              [indicateur]="selectedIndicateur"
              (save)="onIndicateurSaved($event)"
              (cancel)="closeModal()">
            </app-indicateur-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal with Professional Overlay -->
    <div *ngIf="showDeleteConfirm && canDeleteIndicateurs" 
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
                  Êtes-vous sûr de vouloir supprimer l'indicateur "<span class="font-medium">{{ indicateurToDelete?.nom_indicateur }}</span>" ? Cette action ne peut pas être annulée.
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
              (click)="deleteIndicateur()"
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
export class IndicateursComponent implements OnInit, OnDestroy {
  indicateurs: Indicateur[] = [];
  filteredIndicateurs: Indicateur[] = [];
  cadreLogiques: CadreLogique[] = [];
  stats: IndicateurStats | null = null;
  loading = false;
  deleting = false;

  Math = Math; // Expose Math to template

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Modal states
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedIndicateur: Indicateur | null = null;
  
  // Delete confirmation
  showDeleteConfirm = false;
  indicateurToDelete: Indicateur | null = null;

  // Filters
  searchTerm = '';
  statusFilter: string | undefined = undefined;
  filters: IndicateurFilters = {};

  // Permission properties
  canCreateIndicateurs = false;
  canEditIndicateurs = false;
  canDeleteIndicateurs = false;
  canUpdateProgress = false;

  // Subscriptions
  private subs: Subscription[] = [];

  constructor(
    private indicateurService: IndicateurService,
    private accessControl: AccessControlService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadCadreLogiques();
    this.loadIndicateurs();
    this.loadStats();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private checkPermissions() {
    this.canCreateIndicateurs = this.accessControl.canAccess('indicateurs', 'create');
    this.canEditIndicateurs = this.accessControl.canAccess('indicateurs', 'update');
    this.canDeleteIndicateurs = this.accessControl.canAccess('indicateurs', 'delete');
    this.canUpdateProgress = this.accessControl.canAccess('indicateurs', 'progress');

    console.log('Indicateur permissions:', {
      canCreate: this.canCreateIndicateurs,
      canEdit: this.canEditIndicateurs,
      canDelete: this.canDeleteIndicateurs,
      canUpdateProgress: this.canUpdateProgress
    });
  }

  loadCadreLogiques() {
    const sub = this.indicateurService.getCadreLogiques().subscribe({
      next: (response) => {
        if (response.success) {
          this.cadreLogiques = response.data || [];
          console.log('Cadre logiques loaded:', this.cadreLogiques);
        } else {
          console.warn('Cadre logiques response not successful:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading cadre logiques:', error);
      }
    });
    this.subs.push(sub);
  }

  getCadreLogiqueLabel(cadre: CadreLogique): string {
    return `${cadre.intitule} (${cadre.niveau})`;
  }

  // Map database status to display emoji
  getStatusDisplay(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'Atteint': '🟢',
      'Modéré': '🟠',
      'Retard': '🔴'
    };
    return statusMap[statut] || '🟠';
  }

  loadIndicateurs() {
    this.loading = true;
    console.log('Loading indicateurs with filters:', this.filters);
    
    const sub = this.indicateurService.getAll(this.filters).subscribe({
      next: (response) => {
        console.log('Indicateurs response:', response);
        if (response.success) {
          this.indicateurs = response.data || [];
          this.filterIndicateurs();
        } else {
          this.showError(response.message || 'Erreur lors du chargement des indicateurs');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des indicateurs:', error);
        this.showError('Erreur lors du chargement des indicateurs');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  loadStats() {
    console.log('Loading stats with filters:', this.filters);
    
    // Use filtered stats when filters are active for better accuracy
    const hasFilters = this.hasActiveFilters();
    const observable = hasFilters 
      ? this.indicateurService.getStatsFiltered(this.filters)
      : this.indicateurService.getStats(this.filters);

    const sub = observable.subscribe({
      next: (response) => {
        console.log('Stats response:', response);
        if (response.success) {
          this.stats = response.data;
        } else {
          console.warn('Stats response not successful:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
    this.subs.push(sub);
  }

  getStatValue(status: string): number {
    if (!this.stats?.byStatus) return 0;
    return this.stats.byStatus[status] || 0;
  }

  getProgress(indicateur: Indicateur): number {
    if (!indicateur.valeur_cible || indicateur.valeur_cible === 0) return 0;
    return Math.min(Math.round((indicateur.valeur_realisee / indicateur.valeur_cible) * 100), 100);
  }

  updateProgress(indicateur: Indicateur, event: any) {
    if (!this.canUpdateProgress) return;

    const newValue = parseFloat(event.target.value);
    if (isNaN(newValue) || newValue < 0) {
      event.target.value = indicateur.valeur_realisee || 0;
      return;
    }

    const sub = this.indicateurService.updateProgress(indicateur.id_indicateur, { valeur_realisee: newValue }).subscribe({
      next: (response) => {
        if (response.success) {
          // Update local data with new status from backend
          const index = this.indicateurs.findIndex(i => i.id_indicateur === indicateur.id_indicateur);
          if (index >= 0) {
            this.indicateurs[index] = { 
              ...this.indicateurs[index], 
              valeur_realisee: newValue,
              statut: response.data.indicateur?.statut || this.indicateurs[index].statut
            };
            this.filterIndicateurs();
          }
          
          this.loadStats();
          this.showSuccess(`Progression mise à jour: ${newValue}`);
        } else {
          this.showError(response.message || 'Erreur lors de la mise à jour');
          event.target.value = indicateur.valeur_realisee || 0;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.showError('Erreur lors de la mise à jour');
        event.target.value = indicateur.valeur_realisee || 0;
      }
    });
    this.subs.push(sub);
  }

  /**
   * Navigate to the suivi-indicateurs page and pass the indicateur id as a query param.
   * The SuiviIndicateursComponent can read the query param to preselect the indicator.
   */
  goToSuivi(indicateur: Indicateur) {
    if (!indicateur || !indicateur.id_indicateur) return;
    this.router.navigate(['/suivi-indicateurs'], { queryParams: { id_indicateur: indicateur.id_indicateur } });
  }

  filterIndicateurs() {
    this.filteredIndicateurs = this.indicateurs.filter(indicateur => {
      const matchesSearch = !this.searchTerm || 
        indicateur.nom_indicateur.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || indicateur.statut === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.statusFilter ||
      this.filters.source ||
      this.filters.cadre_logique_id
    );
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = undefined;
    this.filters = {};
    this.loadIndicateurs();
    this.loadStats();
    this.showSuccess('Filtres effacés avec succès');
  }

  openCreateModal() {
    if (!this.canCreateIndicateurs) {
      this.showError('Vous n\'avez pas les permissions pour créer des indicateurs');
      return;
    }
    
    this.selectedIndicateur = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(indicateur: Indicateur) {
    if (!this.canEditIndicateurs) {
      this.showError('Vous n\'avez pas les permissions pour modifier des indicateurs');
      return;
    }
    
    this.selectedIndicateur = { ...indicateur };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedIndicateur = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedIndicateur = null;
      this.modalMode = 'create';
    }
  }

  confirmDelete(indicateur: Indicateur) {
    if (!this.canDeleteIndicateurs) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des indicateurs');
      return;
    }
    
    this.indicateurToDelete = indicateur;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.indicateurToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteIndicateur() {
    if (!this.indicateurToDelete || !this.canDeleteIndicateurs) return;

    this.deleting = true;
    const sub = this.indicateurService.delete(this.indicateurToDelete.id_indicateur).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadIndicateurs();
          this.loadStats();
          this.showSuccess(`Indicateur "${this.indicateurToDelete!.nom_indicateur}" supprimé avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.showError('Erreur lors de la suppression de l\'indicateur');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  onIndicateurSaved(indicateur: Indicateur) {
    this.loadIndicateurs();
    this.loadStats();
    
    if (this.modalMode === 'create') {
      this.showSuccess(`Indicateur "${indicateur.nom_indicateur}" créé avec succès`);
    } else {
      this.showSuccess(`Indicateur "${indicateur.nom_indicateur}" modifié avec succès`);
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
