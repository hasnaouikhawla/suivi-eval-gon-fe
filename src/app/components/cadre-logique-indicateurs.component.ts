import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CadreLogiqueService, CadreLogiqueFilters, CadreLogiqueStats, CadreLogiqueHierarchy } from '../services/cadre-logique.service';
import { IndicateurService, IndicateurFilters } from '../services/indicateur.service';
import { CadreLogique, CadreLogiqueNiveau } from '../models/cadre-logique.model';
import { Indicateur } from '../models/indicateur.model';
import { CadreLogiqueFormComponent } from './cadre-logique-form.component';
import { IndicateurFormComponent } from './indicateur-form.component';
import { AccessControlService } from '../services/access-control.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadre-logique-indicateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, CadreLogiqueFormComponent, IndicateurFormComponent],
  template: `
    <!-- Header Section -->
    <div class="bg-gray-100 shadow-none border-none">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Cadre Logique</h1>
            <p class="mt-1 text-sm text-gray-600">
              Gestion intégrée du cadre logique et des indicateurs de performance
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              *ngIf="canCreateCadreLogique"
              type="button"
              (click)="openCreateCadreModal()"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Nouveau Cadre
            </button>
            <button
              *ngIf="canCreateIndicateurs"
              type="button"
              (click)="openCreateIndicateurModal()"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-200">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Nouvel Indicateur
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-100">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Cadres -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Cadres logiques</div>
                <div class="text-lg font-bold text-gray-900">{{ cadreStats?.total || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Indicateurs -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Indicateurs</div>
                <div class="text-lg font-bold text-gray-900">{{ indicateurStats?.total || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicateurs Atteints -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span class="text-sm">🟢</span>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Atteints</div>
                <div class="text-lg font-bold text-emerald-600">{{ getIndicateurStatValue('Atteint') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progression moyenne -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Prog. moyenne</div>
                <div class="text-lg font-bold text-purple-600">{{ indicateurStats?.averageProgress || 0 }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content - Split View -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Side - Cadre Logique -->
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <!-- Left Panel Header -->
          <div class="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                Cadre Logique
              </h3>
            </div>
          </div>

          <!-- Cadre Filters -->
          <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="flex-1">
                <input
                  type="text"
                  [(ngModel)]="cadreSearchTerm"
                  (input)="filterHierarchy()"
                  placeholder="Rechercher..."
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
              </div>
              <div class="flex-shrink-0">
                <select
                  [(ngModel)]="cadreFilters.niveau"
                  (change)="onCadreFilterChange()"
                  class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option [ngValue]="undefined">Tous niveaux</option>
                  <option value="Objectif global">Obj. global</option>
                  <option value="Objectif spécifique">Obj. spécifique</option>
                  <option value="Résultat">Résultat</option>
                  <option value="Activité">Activité</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="cadreLoading" class="p-8 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-500">Chargement...</p>
          </div>

          <!-- Cadre Logique Content - Tree View Only -->
          <div *ngIf="!cadreLoading" class="max-h-[600px] overflow-y-auto">
            <div class="p-4">
              <div *ngIf="filteredHierarchy.length === 0" class="text-center py-8 text-gray-500">
                <p>Aucun cadre logique trouvé</p>
              </div>
              
              <div *ngIf="filteredHierarchy.length > 0">
                <div *ngFor="let rootElement of filteredHierarchy">
                  <ng-container [ngTemplateOutlet]="cadreNodeTemplate" 
                               [ngTemplateOutletContext]="{ element: rootElement, level: 0 }">
                  </ng-container>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Indicateurs -->
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <!-- Right Panel Header -->
          <div class="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  Indicateurs
                </h3>
                <div *ngIf="selectedCadre" class="text-sm text-gray-600 truncate mt-1">
                  {{ selectedCadre.intitule }}
                </div>
              </div>
            </div>
          </div>

          <!-- Indicateur Filters -->
          <div *ngIf="selectedCadre" class="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="flex-1">
                <input
                  type="text"
                  [(ngModel)]="indicateurSearchTerm"
                  (input)="filterIndicateurs()"
                  placeholder="Rechercher indicateur..."
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500">
              </div>
              <div class="flex-shrink-0">
                <select
                  [(ngModel)]="indicateurStatusFilter"
                  (change)="filterIndicateurs()"
                  class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white">
                  <option [ngValue]="undefined">Tous statuts</option>
                  <option value="Atteint">🟢 Atteint</option>
                  <option value="Modéré">🟠 Modéré</option>
                  <option value="Retard">🔴 En retard</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Indicateurs Content -->
          <div class="max-h-[600px] overflow-y-auto">
            <!-- No Selection State -->
            <div *ngIf="!selectedCadre" class="p-8 text-center text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <p class="text-lg font-medium mb-2">Sélectionnez un cadre logique</p>
              <p class="text-sm">Cliquez sur un élément du cadre logique à gauche pour voir ses indicateurs</p>
            </div>

            <!-- Loading State -->
            <div *ngIf="selectedCadre && indicateurLoading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              <p class="mt-2 text-sm text-gray-500">Chargement des indicateurs...</p>
            </div>

            <!-- Indicateurs List -->
            <div *ngIf="selectedCadre && !indicateurLoading" class="divide-y divide-gray-200">
              <div *ngIf="filteredIndicateurs.length === 0" class="p-8 text-center text-gray-500">
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <p class="font-medium mb-1">Aucun indicateur</p>
                <p class="text-sm">Aucun indicateur trouvé pour ce cadre logique</p>
                <button
                  *ngIf="canCreateIndicateurs"
                  type="button"
                  (click)="openCreateIndicateurModal()"
                  class="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Créer le premier indicateur
                </button>
              </div>
              
              <div *ngFor="let indicateur of filteredIndicateurs" class="p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="text-sm font-medium text-gray-900 truncate">{{ indicateur.nom_indicateur }}</h4>
                      <span class="text-base ml-2 flex-shrink-0">{{ getStatusDisplay(indicateur.statut) }}</span>
                    </div>
                    
                    <div class="space-y-2 text-xs text-gray-600">
                      <div class="flex justify-between">
                        <span>Source:</span>
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
                        <span>Valeurs:</span>
                        <span>{{ indicateur.valeur_realisee || 0 }} / {{ indicateur.valeur_cible }}</span>
                      </div>
                      <div>
                        <div class="flex justify-between mb-1">
                          <span>Progression:</span>
                          <span>{{ getProgress(indicateur) }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                          <div class="h-1.5 rounded-full transition-all duration-300"
                               [class.bg-green-500]="getProgress(indicateur) >= 100"
                               [class.bg-orange-500]="getProgress(indicateur) >= 50 && getProgress(indicateur) < 100"
                               [class.bg-red-500]="getProgress(indicateur) < 50"
                               [style.width.%]="Math.min(getProgress(indicateur), 100)">
                          </div>
                        </div>
                      </div>

                      <!-- Quick Progress Update -->
                      <div *ngIf="canUpdateProgress" class="mt-2 pt-2 border-t border-gray-100">
                        <label class="block text-xs font-medium text-gray-500 mb-1">Valeur réalisée:</label>
                        <input 
                          type="number" 
                          [value]="indicateur.valeur_realisee || 0"
                          (change)="updateProgress(indicateur, $event)"
                          min="0"
                          step="0.01"
                          class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500">
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex flex-col space-y-1 ml-2 flex-shrink-0" *ngIf="canEditIndicateurs || canDeleteIndicateurs">
                    <button
                      type="button"
                      (click)="goToSuivi(indicateur)"
                      class="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Voir les mesures">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button
                      *ngIf="canEditIndicateurs"
                      type="button"
                      (click)="openEditIndicateurModal(indicateur)"
                      class="p-1 text-gray-400 hover:text-green-600 rounded"
                      title="Modifier">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      *ngIf="canDeleteIndicateurs"
                      type="button"
                      (click)="confirmDeleteIndicateur(indicateur)"
                      class="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Supprimer">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tree Node Template for Hierarchy -->
    <ng-template #cadreNodeTemplate let-element="element" let-level="level">
      <div class="mb-2" [style.margin-left.px]="level * 20">
        <div class="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border-l-4"
             [class.bg-indigo-50]="selectedCadre?.id_cadre === element.id_cadre"
             [class.border-l-indigo-500]="selectedCadre?.id_cadre === element.id_cadre"
             [class.border-l-transparent]="selectedCadre?.id_cadre !== element.id_cadre"
             (click)="selectCadre(element)">
          <div class="flex items-center justify-between">
            <div class="flex items-center flex-1 min-w-0">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center mr-2" 
                   [class]="getIconBackgroundClasses(element.niveau)">
                <ng-container [ngSwitch]="element.niveau">
                  <svg *ngSwitchCase="'Objectif global'" class="w-3 h-3" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  <svg *ngSwitchCase="'Objectif spécifique'" class="w-3 h-3" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <svg *ngSwitchCase="'Résultat'" class="w-3 h-3" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <svg *ngSwitchCase="'Activité'" class="w-3 h-3" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </ng-container>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 truncate">{{ element.intitule }}</div>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      [class]="getLevelBadgeClasses(element.niveau)">
                  {{ element.niveau }}
                </span>
                <!-- Selection indicator for hierarchy -->
                <div *ngIf="selectedCadre?.id_cadre === element.id_cadre" class="mt-1">
                  <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Sélectionné
                  </span>
                </div>
              </div>
            </div>
            <div class="flex space-y-1 flex-col ml-2" *ngIf="canEditCadreLogique || canDeleteCadreLogique">
              <button
                *ngIf="canEditCadreLogique"
                type="button"
                (click)="openEditCadreModal(element, $event)"
                class="p-1 text-gray-400 hover:text-indigo-600 rounded">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                *ngIf="canDeleteCadreLogique"
                type="button"
                (click)="confirmDeleteCadre(element, $event)"
                class="p-1 text-gray-400 hover:text-red-600 rounded">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Children -->
        <div *ngIf="element.children && element.children.length > 0">
          <div *ngFor="let child of element.children">
            <ng-container [ngTemplateOutlet]="cadreNodeTemplate" 
                         [ngTemplateOutletContext]="{ element: child, level: level + 1 }">
            </ng-container>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- Cadre Logique Form Modal -->
    <div *ngIf="isCadreModalOpen" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30" 
         (click)="closeCadreModal($event)">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                {{ cadreModalMode === 'edit' ? 'Modifier Cadre Logique' : 'Nouveau Cadre Logique' }}
              </h3>
              <button type="button" (click)="closeCadreModal()" class="rounded-xl p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <app-cadre-logique-form
              [cadreLogique]="selectedCadreForEdit"
              (save)="onCadreSaved($event)"
              (cancel)="closeCadreModal()">
            </app-cadre-logique-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Indicateur Form Modal -->
    <div *ngIf="isIndicateurModalOpen" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30" 
         (click)="closeIndicateurModal($event)">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl" (click)="$event.stopPropagation()">
          <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                {{ indicateurModalMode === 'edit' ? 'Modifier Indicateur' : 'Nouvel Indicateur' }}
              </h3>
              <button type="button" (click)="closeIndicateurModal()" class="rounded-xl p-2 text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <app-indicateur-form
              [indicateur]="selectedIndicateurForEdit"
              (save)="onIndicateurSaved($event)"
              (cancel)="closeIndicateurModal()">
            </app-indicateur-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modals -->
    <div *ngIf="showDeleteCadreConfirm" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30" 
         (click)="cancelDeleteCadre()">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full" (click)="$event.stopPropagation()">
          <div class="px-6 py-6">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Supprimer le cadre logique</h3>
                <p class="mt-2 text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer "{{ cadreToDelete?.intitule }}" ?
                </p>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button type="button" (click)="cancelDeleteCadre()" class="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700">
              Annuler
            </button>
            <button type="button" (click)="deleteCadre()" [disabled]="deleting" class="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold">
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="showDeleteIndicateurConfirm" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30" 
         (click)="cancelDeleteIndicateur()">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full" (click)="$event.stopPropagation()">
          <div class="px-6 py-6">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Supprimer l'indicateur</h3>
                <p class="mt-2 text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer "{{ indicateurToDelete?.nom_indicateur }}" ?
                </p>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button type="button" (click)="cancelDeleteIndicateur()" class="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700">
              Annuler
            </button>
            <button type="button" (click)="deleteIndicateur()" [disabled]="deleting" class="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold">
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div *ngIf="successMessage" class="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
      <div class="flex">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ successMessage }}
      </div>
    </div>

    <div *ngIf="errorMessage" class="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
      <div class="flex">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        {{ errorMessage }}
      </div>
    </div>

    <style>
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    </style>
  `
})
export class CadreLogiqueIndicateursComponent implements OnInit, OnDestroy {
  // Cadre Logique data
  cadres: CadreLogique[] = [];
  filteredCadres: CadreLogique[] = [];
  hierarchy: CadreLogiqueHierarchy[] = [];
  filteredHierarchy: CadreLogiqueHierarchy[] = [];
  cadreStats: CadreLogiqueStats | null = null;
  selectedCadre: CadreLogique | null = null;
  cadreLoading = false;

  // Indicateur data
  indicateurs: Indicateur[] = [];
  filteredIndicateurs: Indicateur[] = [];
  indicateurStats: any = null;
  indicateurLoading = false;

  // Search and filters
  cadreSearchTerm = '';
  cadreFilters: CadreLogiqueFilters = {};
  indicateurSearchTerm = '';
  indicateurStatusFilter: string | undefined;

  // Modal states
  isCadreModalOpen = false;
  cadreModalMode: 'create' | 'edit' = 'create';
  selectedCadreForEdit: CadreLogique | null = null;

  isIndicateurModalOpen = false;
  indicateurModalMode: 'create' | 'edit' = 'create';
  selectedIndicateurForEdit: Indicateur | null = null;

  // Delete confirmations
  showDeleteCadreConfirm = false;
  cadreToDelete: CadreLogique | null = null;
  showDeleteIndicateurConfirm = false;
  indicateurToDelete: Indicateur | null = null;
  deleting = false;

  // Messages
  successMessage = '';
  errorMessage = '';

  // Permissions
  canCreateCadreLogique = false;
  canEditCadreLogique = false;
  canDeleteCadreLogique = false;
  canCreateIndicateurs = false;
  canEditIndicateurs = false;
  canDeleteIndicateurs = false;
  canUpdateProgress = false;

  // Expose Math to template
  Math = Math;

  private subs: Subscription[] = [];

  constructor(
    private cadreLogiqueService: CadreLogiqueService,
    private indicateurService: IndicateurService,
    private accessControl: AccessControlService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadCadres();
    this.loadCadreStats();
    this.loadIndicateurStats();
    this.loadHierarchy();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private checkPermissions() {
    this.canCreateCadreLogique = this.accessControl.canAccess('cadreLogique', 'create');
    this.canEditCadreLogique = this.accessControl.canAccess('cadreLogique', 'update');
    this.canDeleteCadreLogique = this.accessControl.canAccess('cadreLogique', 'delete');
    this.canCreateIndicateurs = this.accessControl.canAccess('indicateurs', 'create');
    this.canEditIndicateurs = this.accessControl.canAccess('indicateurs', 'update');
    this.canDeleteIndicateurs = this.accessControl.canAccess('indicateurs', 'delete');
    this.canUpdateProgress = this.accessControl.canAccess('indicateurs', 'progress');
  }

  // Cadre Logique methods
  loadCadres() {
    this.cadreLoading = true;
    const sub = this.cadreLogiqueService.getAll(this.cadreFilters).subscribe({
      next: (response) => {
        if (response.success) {
          this.cadres = response.data || [];
          this.filterCadres();
        }
        this.cadreLoading = false;
      },
      error: (error) => {
        console.error('Error loading cadres:', error);
        this.cadreLoading = false;
      }
    });
    this.subs.push(sub);
  }

  loadCadreStats() {
    const sub = this.cadreLogiqueService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.cadreStats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading cadre stats:', error);
      }
    });
    this.subs.push(sub);
  }

  loadHierarchy() {
    const sub = this.cadreLogiqueService.getHierarchy().subscribe({
      next: (response) => {
        if (response.success) {
          this.hierarchy = response.data || [];
          this.filterHierarchy();
        }
      },
      error: (error) => {
        console.error('Error loading hierarchy:', error);
      }
    });
    this.subs.push(sub);
  }

  onCadreFilterChange() {
    this.loadHierarchy();
  }

  filterCadres() {
    this.filteredCadres = this.cadres.filter(cadre => {
      const matchesSearch = !this.cadreSearchTerm || 
        cadre.intitule.toLowerCase().includes(this.cadreSearchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  filterHierarchy() {
    this.filteredHierarchy = this.filterHierarchyElements(this.hierarchy);
  }

  private filterHierarchyElements(elements: CadreLogiqueHierarchy[]): CadreLogiqueHierarchy[] {
    return elements.filter(element => {
      const matchesSearch = !this.cadreSearchTerm || 
        element.intitule.toLowerCase().includes(this.cadreSearchTerm.toLowerCase());
      const matchesLevel = !this.cadreFilters.niveau || element.niveau === this.cadreFilters.niveau;
      
      // Filter children recursively
      const filteredChildren = element.children ? this.filterHierarchyElements(element.children) : [];
      
      // Include element if it matches filters OR if it has matching children
      const shouldInclude = (matchesSearch && matchesLevel) || filteredChildren.length > 0;
      
      if (shouldInclude) {
        return {
          ...element,
          children: filteredChildren
        };
      }
      
      return false;
    }).map(element => {
      if (element && element.children) {
        return {
          ...element,
          children: this.filterHierarchyElements(element.children)
        };
      }
      return element;
    }).filter(Boolean) as CadreLogiqueHierarchy[];
  }

  selectCadre(cadre: CadreLogique) {
    this.selectedCadre = cadre;
    this.loadIndicateursForCadre(cadre.id_cadre);
  }

  // Indicateur methods
  loadIndicateursForCadre(cadreLogiqueId: number) {
    this.indicateurLoading = true;
    const filters = { cadre_logique_id: cadreLogiqueId };
    
    const sub = this.indicateurService.getAll(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.indicateurs = response.data || [];
          this.filterIndicateurs();
        }
        this.indicateurLoading = false;
      },
      error: (error) => {
        console.error('Error loading indicateurs:', error);
        this.indicateurLoading = false;
      }
    });
    this.subs.push(sub);
  }

  loadIndicateurStats() {
    const sub = this.indicateurService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.indicateurStats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading indicateur stats:', error);
      }
    });
    this.subs.push(sub);
  }

  filterIndicateurs() {
    this.filteredIndicateurs = this.indicateurs.filter(indicateur => {
      const matchesSearch = !this.indicateurSearchTerm || 
        indicateur.nom_indicateur.toLowerCase().includes(this.indicateurSearchTerm.toLowerCase());
      const matchesStatus = !this.indicateurStatusFilter || indicateur.statut === this.indicateurStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  getIndicateurStatValue(status: string): number {
    if (!this.indicateurStats?.byStatus) return 0;
    return this.indicateurStats.byStatus[status] || 0;
  }

  getProgress(indicateur: Indicateur): number {
    if (!indicateur.valeur_cible || indicateur.valeur_cible === 0) return 0;
    return Math.min(Math.round((indicateur.valeur_realisee / indicateur.valeur_cible) * 100), 100);
  }

  getStatusDisplay(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'Atteint': '🟢',
      'Modéré': '🟠',
      'Retard': '🔴'
    };
    return statusMap[statut] || '🟠';
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
          // Update local data
          const index = this.indicateurs.findIndex(i => i.id_indicateur === indicateur.id_indicateur);
          if (index >= 0) {
            this.indicateurs[index] = { 
              ...this.indicateurs[index], 
              valeur_realisee: newValue,
              statut: response.data.indicateur?.statut || this.indicateurs[index].statut
            };
            this.filterIndicateurs();
          }
          this.loadIndicateurStats();
          this.showSuccess(`Progression mise à jour: ${newValue}`);
        } else {
          this.showError(response.message || 'Erreur lors de la mise à jour');
          event.target.value = indicateur.valeur_realisee || 0;
        }
      },
      error: (error) => {
        console.error('Error updating progress:', error);
        this.showError('Erreur lors de la mise à jour');
        event.target.value = indicateur.valeur_realisee || 0;
      }
    });
    this.subs.push(sub);
  }

  goToSuivi(indicateur: Indicateur) {
    if (!indicateur?.id_indicateur) return;
    this.router.navigate(['/suivi-indicateurs'], { 
      queryParams: { id_indicateur: indicateur.id_indicateur } 
    });
  }

  // Styling helper methods
  getIconBackgroundClasses(niveau: CadreLogiqueNiveau): string {
    const levelClasses = {
      'Objectif global': 'bg-purple-100',
      'Objectif spécifique': 'bg-indigo-100',
      'Résultat': 'bg-green-100',
      'Activité': 'bg-orange-100'
    };
    return levelClasses[niveau] || 'bg-gray-100';
  }

  getIconColorClasses(niveau: CadreLogiqueNiveau): string {
    const levelClasses = {
      'Objectif global': 'text-purple-600',
      'Objectif spécifique': 'text-indigo-600',
      'Résultat': 'text-green-600',
      'Activité': 'text-orange-600'
    };
    return levelClasses[niveau] || 'text-gray-600';
  }

  getLevelBadgeClasses(niveau: CadreLogiqueNiveau): string {
    const levelClasses = {
      'Objectif global': 'bg-purple-100 text-purple-800',
      'Objectif spécifique': 'bg-indigo-100 text-indigo-800',
      'Résultat': 'bg-green-100 text-green-800',
      'Activité': 'bg-orange-100 text-orange-800'
    };
    return levelClasses[niveau] || 'bg-gray-100 text-gray-800';
  }

  // Modal management for Cadre Logique
  openCreateCadreModal() {
    if (!this.canCreateCadreLogique) {
      this.showError('Vous n\'avez pas les permissions pour créer des cadres logiques');
      return;
    }
    this.selectedCadreForEdit = null;
    this.cadreModalMode = 'create';
    this.isCadreModalOpen = true;
  }

  openEditCadreModal(cadre: CadreLogique, event: Event) {
    event.stopPropagation();
    if (!this.canEditCadreLogique) {
      this.showError('Vous n\'avez pas les permissions pour modifier des cadres logiques');
      return;
    }
    this.selectedCadreForEdit = { ...cadre };
    this.cadreModalMode = 'edit';
    this.isCadreModalOpen = true;
  }

  closeCadreModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isCadreModalOpen = false;
      this.selectedCadreForEdit = null;
      this.cadreModalMode = 'create';
    } else if (!event) {
      this.isCadreModalOpen = false;
      this.selectedCadreForEdit = null;
      this.cadreModalMode = 'create';
    }
  }

  onCadreSaved(cadre: CadreLogique) {
    this.loadCadres();
    this.loadCadreStats();
    this.loadHierarchy();
    
    if (this.cadreModalMode === 'create') {
      this.showSuccess(`Cadre logique "${cadre.intitule}" créé avec succès`);
    } else {
      this.showSuccess(`Cadre logique "${cadre.intitule}" modifié avec succès`);
    }
    
    this.closeCadreModal();
  }

  // Modal management for Indicateurs
  openCreateIndicateurModal() {
    if (!this.canCreateIndicateurs) {
      this.showError('Vous n\'avez pas les permissions pour créer des indicateurs');
      return;
    }

    // Create a new indicateur with default values
    this.selectedIndicateurForEdit = {
      id_indicateur: 0,
      nom_indicateur: '',
      cadre_logique_id: this.selectedCadre?.id_cadre || 0,
      valeur_cible: 0,
      valeur_realisee: 0,
      source: 'Interne',
      statut: 'Modéré' as any,
      date_creation: new Date(),
      cadre_logique_nom: this.selectedCadre?.intitule || ''
    } as Indicateur;

    this.indicateurModalMode = 'create';
    this.isIndicateurModalOpen = true;
  }

  openEditIndicateurModal(indicateur: Indicateur) {
    if (!this.canEditIndicateurs) {
      this.showError('Vous n\'avez pas les permissions pour modifier des indicateurs');
      return;
    }
    this.selectedIndicateurForEdit = { ...indicateur };
    this.indicateurModalMode = 'edit';
    this.isIndicateurModalOpen = true;
  }

  closeIndicateurModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isIndicateurModalOpen = false;
      this.selectedIndicateurForEdit = null;
      this.indicateurModalMode = 'create';
    } else if (!event) {
      this.isIndicateurModalOpen = false;
      this.selectedIndicateurForEdit = null;
      this.indicateurModalMode = 'create';
    }
  }

  onIndicateurSaved(indicateur: Indicateur) {
    // Reload indicateurs for the selected cadre
    if (this.selectedCadre) {
      this.loadIndicateursForCadre(this.selectedCadre.id_cadre);
    }
    this.loadIndicateurStats();
    
    if (this.indicateurModalMode === 'create') {
      this.showSuccess(`Indicateur "${indicateur.nom_indicateur}" créé avec succès`);
    } else {
      this.showSuccess(`Indicateur "${indicateur.nom_indicateur}" modifié avec succès`);
    }
    
    this.closeIndicateurModal();
  }

  // Delete confirmation methods
  confirmDeleteCadre(cadre: CadreLogique, event: Event) {
    event.stopPropagation();
    if (!this.canDeleteCadreLogique) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des cadres logiques');
      return;
    }
    this.cadreToDelete = cadre;
    this.showDeleteCadreConfirm = true;
  }

  cancelDeleteCadre() {
    this.cadreToDelete = null;
    this.showDeleteCadreConfirm = false;
  }

  deleteCadre() {
    if (!this.cadreToDelete || !this.canDeleteCadreLogique) return;

    this.deleting = true;
    const sub = this.cadreLogiqueService.delete(this.cadreToDelete.id_cadre).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCadres();
          this.loadCadreStats();
          this.loadHierarchy();
          
          // Clear selection if deleted cadre was selected
          if (this.selectedCadre?.id_cadre === this.cadreToDelete!.id_cadre) {
            this.selectedCadre = null;
            this.indicateurs = [];
            this.filteredIndicateurs = [];
          }
          
          this.showSuccess(`Cadre logique "${this.cadreToDelete!.intitule}" supprimé avec succès`);
          this.cancelDeleteCadre();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Error deleting cadre:', error);
        this.showError('Erreur lors de la suppression du cadre logique');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  confirmDeleteIndicateur(indicateur: Indicateur) {
    if (!this.canDeleteIndicateurs) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des indicateurs');
      return;
    }
    this.indicateurToDelete = indicateur;
    this.showDeleteIndicateurConfirm = true;
  }

  cancelDeleteIndicateur() {
    this.indicateurToDelete = null;
    this.showDeleteIndicateurConfirm = false;
  }

  deleteIndicateur() {
    if (!this.indicateurToDelete || !this.canDeleteIndicateurs) return;

    this.deleting = true;
    const sub = this.indicateurService.delete(this.indicateurToDelete.id_indicateur).subscribe({
      next: (response) => {
        if (response.success) {
          // Reload indicateurs for the selected cadre
          if (this.selectedCadre) {
            this.loadIndicateursForCadre(this.selectedCadre.id_cadre);
          }
          this.loadIndicateurStats();
          this.showSuccess(`Indicateur "${this.indicateurToDelete!.nom_indicateur}" supprimé avec succès`);
          this.cancelDeleteIndicateur();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Error deleting indicateur:', error);
        this.showError('Erreur lors de la suppression de l\'indicateur');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  // Message helpers
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