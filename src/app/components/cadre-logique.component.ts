import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CadreLogiqueService, CadreLogiqueFilters, CadreLogiqueStats, CadreLogiqueHierarchy, ApiResponse } from '../services/cadre-logique.service';
import { CadreLogique, CadreLogiqueNiveau } from '../models/cadre-logique.model';
import { CadreLogiqueFormComponent } from './cadre-logique-form.component';
import { AccessControlService } from '../services/access-control.service';

@Component({
  selector: 'app-cadre-logique',
  standalone: true,
  imports: [CommonModule, FormsModule, CadreLogiqueFormComponent],
  template: `
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Cadre Logique</h1>
            <p class="mt-1 text-sm text-gray-600">
              Gestion de la hiérarchie du cadre logique du projet
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              (click)="toggleView()"
              class="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 ease-in-out">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      [attr.d]="showHierarchy ? 'M4 6h16M4 10h16M4 14h16M4 18h16' : 'M8 16l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-6a3 3 0 11-6 0 3 3 0 016 0z'"/>
              </svg>
              {{ showHierarchy ? 'Vue Liste' : 'Vue Arbre' }}
            </button>
            <button
              *ngIf="canCreateCadreLogique"
              type="button"
              (click)="openCreateModal()"
              class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Nouvel Élément
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <!-- Total -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
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

        <!-- Objectifs globaux -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Obj. globaux</div>
                <div class="text-lg font-bold text-purple-600">{{ getStatValue('Objectif global') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Objectifs spécifiques -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Obj. spécifiques</div>
                <div class="text-lg font-bold text-indigo-600">{{ getStatValue('Objectif spécifique') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Résultats</div>
                <div class="text-lg font-bold text-green-600">{{ getStatValue('Résultat') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activités -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-3 py-4 sm:p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-500 truncate">Activités</div>
                <div class="text-lg font-bold text-orange-600">{{ getStatValue('Activité') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8" *ngIf="!showHierarchy">
        <div class="px-6 py-6 sm:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Filtres de recherche</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Rechercher -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Rechercher
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (input)="filterElements()"
                  placeholder="Intitulé de l'élément..."
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         placeholder-gray-400 
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400">
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Niveau -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Niveau
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.niveau"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les niveaux</option>
                  <option value="Objectif global">Objectif global</option>
                  <option value="Objectif spécifique">Objectif spécifique</option>
                  <option value="Résultat">Résultat</option>
                  <option value="Activité">Activité</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
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
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-sm text-gray-500">Chargement du cadre logique...</p>
        </div>
      </div>

      <!-- Tree Hierarchy View -->
      <div *ngIf="showHierarchy && !loading" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-6a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Arbre du Cadre Logique
          </h3>
        </div>
        <div class="p-8 overflow-x-auto">
          <div *ngIf="hierarchy.length === 0" class="text-center py-12 text-gray-500">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <p class="text-lg">Aucun élément dans le cadre logique</p>
          </div>
          
          <!-- Tree Structure -->
          <div class="tree-container" *ngIf="hierarchy.length > 0">
            <div class="tree-node" *ngFor="let rootElement of hierarchy; let isLast = last">
              <ng-container [ngTemplateOutlet]="treeNodeTemplate" 
                           [ngTemplateOutletContext]="{ 
                             element: rootElement, 
                             level: 0, 
                             isLast: isLast,
                             isRoot: true
                           }">
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <!-- Tree Node Template -->
      <ng-template #treeNodeTemplate let-element="element" let-level="level" let-isLast="isLast" let-isRoot="isRoot">
        <div class="tree-item" [class.is-last]="isLast">
          <div class="tree-content" [style.padding-left.px]="level * 40">
            <!-- Tree Lines -->
            <div class="tree-lines" *ngIf="!isRoot">
              <div class="vertical-line" [class.short]="isLast"></div>
              <div class="horizontal-line"></div>
            </div>

            <!-- Node -->
            <div class="node-container">
              <div class="node" [class]="getNodeClasses(element.niveau)">
                <!-- Level Icon -->
                <div class="node-icon" [class]="getIconClasses(element.niveau)">
                  <ng-container [ngSwitch]="element.niveau">
                    <svg *ngSwitchCase="'Objectif global'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                    </svg>
                    <svg *ngSwitchCase="'Objectif spécifique'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <svg *ngSwitchCase="'Résultat'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <svg *ngSwitchCase="'Activité'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </ng-container>
                </div>

                <!-- Content -->
                <div class="node-content">
                  <div class="node-title">{{ element.intitule }}</div>
                  <div class="node-meta">
                    <span class="level-badge" [class]="getLevelBadgeClasses(element.niveau)">
                      {{ element.niveau }}
                    </span>
                    <span *ngIf="element.ordre" class="order-badge">
                      Ordre: {{ element.ordre }}
                    </span>
                  </div>
                  <div *ngIf="element.observations" class="node-description">
                    {{ element.observations }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="node-actions" *ngIf="canEditCadreLogique || canDeleteCadreLogique">
                  <button
                    *ngIf="canEditCadreLogique"
                    type="button"
                    (click)="openEditModal(element)"
                    class="action-btn edit-btn"
                    title="Modifier">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    *ngIf="canDeleteCadreLogique"
                    type="button"
                    (click)="confirmDelete(element)"
                    class="action-btn delete-btn"
                    title="Supprimer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Children -->
          <div class="children-container" *ngIf="element.children && element.children.length > 0">
            <div *ngFor="let child of element.children; let childIsLast = last">
              <ng-container [ngTemplateOutlet]="treeNodeTemplate" 
                           [ngTemplateOutletContext]="{ 
                             element: child, 
                             level: level + 1, 
                             isLast: childIsLast,
                             isRoot: false
                           }">
              </ng-container>
            </div>
          </div>
        </div>
      </ng-template>

      <!-- List View -->
      <div *ngIf="!showHierarchy && !loading" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intitulé</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordre</th>
                <th *ngIf="canEditCadreLogique || canDeleteCadreLogique" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let element of filteredElements" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3" 
                         [class]="getIconBackgroundClasses(element.niveau)">
                      <ng-container [ngSwitch]="element.niveau">
                        <svg *ngSwitchCase="'Objectif global'" class="w-4 h-4" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                        </svg>
                        <svg *ngSwitchCase="'Objectif spécifique'" class="w-4 h-4" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        <svg *ngSwitchCase="'Résultat'" class="w-4 h-4" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <svg *ngSwitchCase="'Activité'" class="w-4 h-4" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                      </ng-container>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900 flex items-center">
                        <span *ngIf="getHierarchyPrefix(element)" class="text-gray-400 mr-2 font-mono">
                          {{ getHierarchyPrefix(element) }}
                        </span>
                        {{ element.intitule }}
                      </div>
                      <div class="text-sm text-gray-500 mt-1" *ngIf="element.observations">
                        {{ element.observations }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [class]="getLevelBadgeClasses(element.niveau)">
                    {{ element.niveau }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900" *ngIf="getParentName(element.parent_id); else noParent">
                    {{ getParentName(element.parent_id) }}
                  </div>
                  <ng-template #noParent>
                    <span class="text-sm text-gray-500 italic">Racine</span>
                  </ng-template>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900">{{ element.ordre || '-' }}</span>
                </td>
                <td *ngIf="canEditCadreLogique || canDeleteCadreLogique" class="px-6 py-4 text-right">
                  <div class="flex justify-end space-x-2">
                    <button
                      *ngIf="canEditCadreLogique"
                      type="button"
                      (click)="openEditModal(element)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      *ngIf="canDeleteCadreLogique"
                      type="button"
                      (click)="confirmDelete(element)"
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
            <div *ngFor="let element of filteredElements" class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center flex-1">
                  <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3" 
                       [class]="getIconBackgroundClasses(element.niveau)">
                    <ng-container [ngSwitch]="element.niveau">
                      <svg *ngSwitchCase="'Objectif global'" class="w-4 h-4" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                      </svg>
                      <svg *ngSwitchCase="'Objectif spécifique'" class="w-4 h-4" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      <svg *ngSwitchCase="'Résultat'" class="w-4 h-4" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <svg *ngSwitchCase="'Activité'" class="w-4 h-4" [class]="getIconColorClasses(element.niveau)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </ng-container>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900 flex items-center">
                      <span *ngIf="getHierarchyPrefix(element)" class="text-gray-400 mr-2 font-mono text-xs">
                        {{ getHierarchyPrefix(element) }}
                      </span>
                      {{ element.intitule }}
                    </h3>
                  </div>
                </div>
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2"
                      [class]="getLevelBadgeClasses(element.niveau)">
                  {{ element.niveau }}
                </span>
              </div>
              
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between" *ngIf="getParentName(element.parent_id)">
                  <span class="font-medium">Parent:</span>
                  <span>{{ getParentName(element.parent_id) }}</span>
                </div>
                <div class="flex justify-between" *ngIf="element.ordre">
                  <span class="font-medium">Ordre:</span>
                  <span>{{ element.ordre }}</span>
                </div>
                <div *ngIf="element.observations" class="mt-2">
                  <span class="font-medium">Observations:</span>
                  <p class="mt-1 text-xs">{{ element.observations }}</p>
                </div>
              </div>
              
              <div class="flex justify-end space-x-2 mt-4" *ngIf="canEditCadreLogique || canDeleteCadreLogique">
                <button
                  *ngIf="canEditCadreLogique"
                  type="button"
                  (click)="openEditModal(element)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                <button
                  *ngIf="canDeleteCadreLogique"
                  type="button"
                  (click)="confirmDelete(element)"
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
        <div *ngIf="filteredElements.length === 0" class="text-center py-12">
          <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun élément trouvé</h3>
          <p class="mt-2 text-sm text-gray-500">
            <span *ngIf="canCreateCadreLogique">Commencez par créer un nouvel élément ou ajustez vos filtres.</span>
            <span *ngIf="!canCreateCadreLogique">Aucun élément disponible avec les filtres actuels.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div *ngIf="isModalOpen && canCreateCadreLogique" 
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
                  {{ modalMode === 'edit' ? 'Modifier Élément' : 'Nouvel Élément' }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ modalMode === 'edit' ? 'Modifiez les informations de cet élément' : 'Créez un nouvel élément du cadre logique' }}
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
            <app-cadre-logique-form
              [cadreLogique]="selectedElement"
              (save)="onElementSaved($event)"
              (cancel)="closeModal()">
            </app-cadre-logique-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteConfirm && canDeleteCadreLogique" 
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
                  Êtes-vous sûr de vouloir supprimer l'élément "<span class="font-medium">{{ elementToDelete?.intitule }}</span>" ? Cette action ne peut pas être annulée.
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
              (click)="deleteElement()"
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

      /* Tree Structure Styles */
      .tree-container {
        position: relative;
        padding: 20px;
        min-height: 200px;
      }

      .tree-item {
        position: relative;
        margin-bottom: 20px;
      }

      .tree-content {
        position: relative;
      }

      .tree-lines {
        position: absolute;
        left: -30px;
        top: 0;
        width: 30px;
        height: 100%;
      }

      .vertical-line {
        position: absolute;
        left: 15px;
        top: -20px;
        width: 2px;
        height: 40px;
        background-color: #d1d5db;
      }

      .vertical-line.short {
        height: 20px;
      }

      .horizontal-line {
        position: absolute;
        left: 15px;
        top: 20px;
        width: 15px;
        height: 2px;
        background-color: #d1d5db;
      }

      .node-container {
        display: flex;
        align-items: flex-start;
      }

      .node {
        display: flex;
        align-items: center;
        padding: 16px;
        border-radius: 12px;
        border: 2px solid transparent;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        min-width: 300px;
        max-width: 600px;
      }

      .node:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .node.objectif-global {
        border-color: #a855f7;
        background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      }

      .node.objectif-specifique {
        border-color: #6366f1;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
      }

      .node.resultat {
        border-color: #10b981;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      }

      .node.activite {
        border-color: #f97316;
        background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%);
      }

      .node-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
      }

      .node-icon.purple {
        background-color: #a855f7;
        color: white;
      }

      .node-icon.indigo {
        background-color: #6366f1;
        color: white;
      }

      .node-icon.green {
        background-color: #10b981;
        color: white;
      }

      .node-icon.orange {
        background-color: #f97316;
        color: white;
      }

      .node-content {
        flex: 1;
        min-width: 0;
      }

      .node-title {
        font-weight: 600;
        font-size: 16px;
        color: #1f2937;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .node-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .level-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
      }

      .order-badge {
        font-size: 12px;
        color: #6b7280;
      }

      .node-description {
        font-size: 14px;
        color: #6b7280;
        font-style: italic;
        line-height: 1.4;
      }

      .node-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-left: 16px;
      }

      .action-btn {
        padding: 8px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .edit-btn {
        background-color: #eff6ff;
        color: #2563eb;
      }

      .edit-btn:hover {
        background-color: #dbeafe;
      }

      .delete-btn {
        background-color: #fef2f2;
        color: #dc2626;
      }

      .delete-btn:hover {
        background-color: #fee2e2;
      }

      .children-container {
        margin-left: 40px;
        position: relative;
      }

      .children-container::before {
        content: '';
        position: absolute;
        left: -25px;
        top: -20px;
        bottom: 20px;
        width: 2px;
        background-color: #d1d5db;
      }
    </style>
  `
})
export class CadreLogiqueComponent implements OnInit, OnDestroy {
  elements: CadreLogique[] = [];
  filteredElements: CadreLogique[] = [];
  hierarchy: CadreLogiqueHierarchy[] = [];
  stats: CadreLogiqueStats | null = null;
  loading = false;
  deleting = false;
  showHierarchy = false;

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Modal states
  isModalOpen = false;
   modalMode: 'create' | 'edit' = 'create';
  selectedElement: CadreLogique | null = null;
  
  // Delete confirmation
  showDeleteConfirm = false;
  elementToDelete: CadreLogique | null = null;

  // Filters
  searchTerm = '';
  filters: CadreLogiqueFilters = {};
  allElementsCache: CadreLogique[] = [];

  // Permission properties
  canCreateCadreLogique = false;
  canEditCadreLogique = false;
  canDeleteCadreLogique = false;

  // Subscriptions
  private subs: Subscription[] = [];

  constructor(
    public cadreLogiqueService: CadreLogiqueService,
    private accessControl: AccessControlService
  ) {}

  ngOnInit() {
    this.checkPermissions();
	this.loadAllCache();
    this.loadElements();
    this.loadStats();
    this.loadHierarchy();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private checkPermissions() {
    this.canCreateCadreLogique = this.accessControl.canAccess('cadreLogique', 'create');
    this.canEditCadreLogique = this.accessControl.canAccess('cadreLogique', 'update');
    this.canDeleteCadreLogique = this.accessControl.canAccess('cadreLogique', 'delete');
  }

  toggleView() {
    this.showHierarchy = !this.showHierarchy;
  }

  loadElements() {
    this.loading = true;
    
    const sub = this.cadreLogiqueService.getAll(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.elements = response.data || [];
          this.filterElements();
        } else {
          this.showError(response.message || 'Erreur lors du chargement du cadre logique');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du cadre logique:', error);
        this.showError('Erreur lors du chargement du cadre logique');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  loadStats() {
    const sub = this.cadreLogiqueService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
    this.subs.push(sub);
  }

  loadHierarchy() {
    const sub = this.cadreLogiqueService.getHierarchy().subscribe({
      next: (response) => {
        if (response.success) {
          this.hierarchy = response.data || [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la hiérarchie:', error);
      }
    });
    this.subs.push(sub);
  }
  
  private loadAllCache() {
    const sub = this.cadreLogiqueService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.allElementsCache = response.data || [];
        } else {
          this.allElementsCache = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement du cache du cadre logique:', error);
        this.allElementsCache = [];
      }
    });
    this.subs.push(sub);
  }

  onFilterChange() {
    console.log('Filter changed:', this.filters);
    this.loadElements();
  }

  getStatValue(level: string): number {
    if (!this.stats?.byLevel) return 0;
    return this.stats.byLevel[level] || 0;
  }

  getParentName(parentId: number | null | undefined): string | null {
    if (!parentId) return null;
    // prefer current elements (fast), else fallback to the full cache
    const parent = this.elements.find(el => el.id_cadre === parentId) || this.allElementsCache.find(el => el.id_cadre === parentId);
    return parent ? parent.intitule : null;
  }

  filterElements() {
    const levelPriority: { [k in CadreLogiqueNiveau]: number } = {
      'Objectif global': 1,
      'Objectif spécifique': 2,
      'Résultat': 3,
      'Activité': 4
    };

    let filtered = [...this.elements];

    // Apply search filter (search across multiple fields)
    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      const q = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(element => {
        const intitule = (element.intitule || '').toString().toLowerCase();
        const observations = (element.observations || '').toString().toLowerCase();
        const ordre = (element.ordre !== undefined && element.ordre !== null) ? String(element.ordre).toLowerCase() : '';
        const niveau = (element.niveau || '').toString().toLowerCase();
        return intitule.includes(q) || observations.includes(q) || ordre.includes(q) || niveau.includes(q);
      });
    }

    if (this.showHierarchy) {
      // Keep existing hierarchical ordering for the tree view
      this.filteredElements = this.cadreLogiqueService.sortElementsHierarchically(filtered);
    } else {
      // List view: sort by ordre within each sibling/group; items without ordre go to the end.
      this.filteredElements = filtered.sort((a, b) => {
        const oa = (a.ordre !== undefined && a.ordre !== null) ? Number(a.ordre) : Number.MAX_SAFE_INTEGER;
        const ob = (b.ordre !== undefined && b.ordre !== null) ? Number(b.ordre) : Number.MAX_SAFE_INTEGER;
        if (oa !== ob) return oa - ob;

        const pa = levelPriority[a.niveau] ?? 99;
        const pb = levelPriority[b.niveau] ?? 99;
        if (pa !== pb) return pa - pb;

        // final fallback
        return (a.intitule || '').localeCompare(b.intitule || '');
      });
    }
  }

  getHierarchyPrefix(element: CadreLogique): string {
    const level = this.getElementLevel(element);
    if (level === 0) return '';
    return '└─ '.repeat(1) + '  '.repeat(level - 1);
  }

  private getElementLevel(element: CadreLogique): number {
    let level = 0;
    let currentElement = element;
    
    while (currentElement.parent_id) {
      level++;
      const parent = this.elements.find(el => el.id_cadre === currentElement.parent_id);
      if (!parent) break;
      currentElement = parent;
    }
    
    return level;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.filters.niveau
    );
  }

  clearFilters() {
    this.searchTerm = '';
    this.filters = {};
    this.loadElements();
    this.showSuccess('Filtres effacés avec succès');
  }

  // Styling methods for tree view
  getNodeClasses(niveau: CadreLogiqueNiveau): string {
    const levelClasses = {
      'Objectif global': 'objectif-global',
      'Objectif spécifique': 'objectif-specifique',
      'Résultat': 'resultat',
      'Activité': 'activite'
    };
    return levelClasses[niveau] || '';
  }

  getIconClasses(niveau: CadreLogiqueNiveau): string {
    const levelClasses = {
      'Objectif global': 'purple',
      'Objectif spécifique': 'indigo',
      'Résultat': 'green',
      'Activité': 'orange'
    };
    return levelClasses[niveau] || 'gray';
  }

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

  openCreateModal() {
    if (!this.canCreateCadreLogique) {
      this.showError('Vous n\'avez pas les permissions pour créer des éléments du cadre logique');
      return;
    }
    
    this.selectedElement = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(element: CadreLogique) {
    if (!this.canEditCadreLogique) {
      this.showError('Vous n\'avez pas les permissions pour modifier des éléments du cadre logique');
      return;
    }
    
    this.selectedElement = { ...element };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedElement = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedElement = null;
      this.modalMode = 'create';
    }
  }

  confirmDelete(element: CadreLogique) {
    if (!this.canDeleteCadreLogique) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des éléments du cadre logique');
      return;
    }
    
    this.elementToDelete = element;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.elementToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteElement() {
    if (!this.elementToDelete || !this.canDeleteCadreLogique) return;

    this.deleting = true;
    const sub = this.cadreLogiqueService.delete(this.elementToDelete.id_cadre).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadElements();
          this.loadStats();
          this.loadHierarchy();
          this.showSuccess(`Élément "${this.elementToDelete!.intitule}" supprimé avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.showError('Erreur lors de la suppression de l\'élément');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  onElementSaved(element: CadreLogique) {
    this.loadElements();
    this.loadStats();
    this.loadHierarchy();
    
    if (this.modalMode === 'create') {
      this.showSuccess(`Élément "${element.intitule}" créé avec succès`);
    } else {
      this.showSuccess(`Élément "${element.intitule}" modifié avec succès`);
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