import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { actionService, actionFilters } from '../services/action.service';
import { Action, ActionStatus } from '../models/action.model';
import { ActionFormComponent } from './action-form.component';
import { ActionProgressFormComponent } from './action-progress-form.component'; // <-- ADDED
import { AccessControlService } from '../services/access-control.service';
import { Projet } from '../models/projet.model';
import { ProjetService } from '../services/projet.service';
import { Zone } from '../models/zone.model';
import { ZoneService } from '../services/zone.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, ActionFormComponent, ActionProgressFormComponent], // <-- ADDED ActionProgressFormComponent
  template: `
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            *ngIf="canCreateActions"
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nouvelle Action
          </button>
          <div *ngIf="!canCreateActions" class="text-sm text-gray-500 italic">
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <!-- Total -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Total</div>
                <div class="text-2xl font-bold text-gray-900">{{ stats?.total || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- En cours -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">En cours</div>
                <div class="text-2xl font-bold text-blue-600">{{ getStatValue('En cours') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Planifiées -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Planifiées</div>
                <div class="text-2xl font-bold text-amber-600">{{ getStatValue('Planifiée') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terminées -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Terminées</div>
                <div class="text-2xl font-bold text-green-600">{{ getStatValue('Terminée') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Suspendues -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Suspendues</div>
                <div class="text-2xl font-bold text-red-600">{{ getStatValue('Suspendue') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-6 py-6 sm:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Filtres de recherche</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            <!-- Rechercher -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Rechercher
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (input)="filterActions()"
                  placeholder="Titre de l'action"
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

            <!-- Type Volet -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Type Volet
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.type_volet"
                  (change)="loadActions()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les volets</option>
                  <option value="CES">CES</option>
                  <option value="CEP">CEP</option>
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
                  [(ngModel)]="filters.statut"
                  (change)="loadActions()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les statuts</option>
                  <option value="Planifiée">Planifiée</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminée">Terminée</option>
                  <option value="Suspendue">Suspendue</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Commune -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Commune
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.commune"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 pr-10 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Toutes les communes</option>
                  <option *ngFor="let c of communes" [value]="c">{{ c }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Projet (dropdown) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Projet
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.id_projet"
                  (change)="loadActions()"
                  class="block w-full px-4 py-3 pr-10 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les projets</option>
                  <option *ngFor="let p of projets" [ngValue]="p.id_projet">
                    {{ p.titre }}{{ p.id_projet ? (' — #' + p.id_projet) : '' }}
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

          <!-- Preselected Project Widget -->
          <div *ngIf="preselectedProjetId" class="mt-6 p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200 rounded-xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-semibold text-indigo-900">Projet sélectionné</h4>
                  <p class="text-sm text-indigo-700 mt-1 truncate">
                    {{ getSelectedProjectName() }}
                  </p>
                  <p class="text-xs text-indigo-600 mt-1">
                    Les actions sont automatiquement filtrées pour ce projet
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
          <p class="mt-4 text-sm text-gray-500">Chargement des actions...</p>
        </div>
      </div>

      <!-- Actions Table/Cards -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden" *ngIf="!loading">
        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Volet</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                <th *ngIf="canEditActions || canDeleteActions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <ng-container *ngFor="let a of filteredActions">
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ a.type_action }}</div>
                    <div class="text-sm text-gray-500 mt-1" *ngIf="a.projet_titre">
                      Projet: {{ a.projet_titre | slice:0:40 }}{{ a.projet_titre && a.projet_titre.length > 40 ? '...' : '' }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                     <div class="text-sm text-gray-900">{{ getZoneDisplay(a).commune }}</div>
                     <div class="text-sm text-gray-500">{{ getZoneDisplay(a).province }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ a.type_volet }}</td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ formatDate(a.date_debut) }}</div>
                    <div class="text-sm text-gray-500">{{ formatDate(a.date_fin) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span [ngClass]="getStatusClass(a.statut)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap">
                      {{ normalizeStatusLabel(a.statut) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                      {{ a.quantite_realisee || 0 }} / {{ a.quantite_prevue || 0 }}
                    </div>
                    <div class="text-sm text-gray-500" *ngIf="a.pourcentage_realisation !== undefined">
                      {{ a.pourcentage_realisation | number:'1.0-1' }}%
                    </div>
                  </td>
                  <td *ngIf="canEditActions || canDeleteActions" class="px-6 py-4 text-right">
                    <div class="flex justify-end space-x-2">
                      <button
                        type="button"
                        (click)="goToBudgetSuivi(a)"
                        class="inline-flex items-center p-2 border border-gray-200 rounded-lg text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                        title="Voir le suivi budget de cette action">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                           <circle cx="12" cy="12" r="7" stroke-width="2" stroke="currentColor" fill="currentColor"></circle>
                           <path d="M9 12h6" stroke-width="2" stroke-linecap="round" stroke="white"></path>
                        </svg>
                      </button>

                      <!-- Toggle progress form button -->
                      <button
                        *ngIf="canEditActions"
                        type="button"
                        (click)="toggleProgressForm(a)"
                        [class]="isProgressOpen(a) ? 'inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors' : 'inline-flex items-center p-2 border border-gray-200 rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'"
                        title="Mettre à jour le progrès">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h4l3 8 4-16 3 8h4"/>
                        </svg>
                      </button>

                      <button
                        *ngIf="canEditActions"
                        type="button"
                        (click)="openEditModal(a)"
                        class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        *ngIf="canDeleteActions"
                        type="button"
                        (click)="confirmDelete(a)"
                        class="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                      <div *ngIf="!canEditActions && !canDeleteActions" class="text-xs text-gray-400 italic px-2 py-1">
                        Lecture seule
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Progress form row for desktop -->
                <tr *ngIf="isProgressOpen(a)">
                  <td colspan="7" class="px-6 py-4 bg-gray-50">
                    <app-action-progress-form
                      [action]="a"
                      (save)="onProgressSaved($event)"
                      (cancel)="onProgressCancelled(a)">
                    </app-action-progress-form>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="lg:hidden">
          <div class="divide-y divide-gray-200">
            <div *ngFor="let a of filteredActions" class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-900">{{ a.type_action }}</h3>
                <span [ngClass]="getStatusClass(a.statut)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap">
                  {{ normalizeStatusLabel(a.statut) }}
                </span>
              </div>

              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span class="font-medium">Zone:</span>
                  <span>{{ getZoneDisplay(a).commune }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Province:</span>
                  <span>{{ getZoneDisplay(a).province }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Type Volet:</span>
                  <span>{{ a.type_volet }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Période:</span>
                  <span>{{ formatDate(a.date_debut) }} - {{ formatDate(a.date_fin) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Progression:</span>
                  <span>{{ a.quantite_realisee || 0 }} / {{ a.quantite_prevue || 0 }}</span>
                </div>
                <div *ngIf="a.projet_titre" class="mt-2">
                  <span class="font-medium">Projet:</span>
                  <p class="mt-1 text-xs">{{ a.projet_titre | slice:0:100 }}{{ a.projet_titre && a.projet_titre.length > 100 ? '...' : '' }}</p>
                </div>
              </div>

              <div class="flex justify-end space-x-2 mt-4" *ngIf="canEditActions || canDeleteActions">
                <button
                  type="button"
                  (click)="goToBudgetSuivi(a)"
                  class="inline-flex items-center p-2 border border-gray-200 rounded-lg text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                  title="Voir le suivi budget de cette action">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <circle cx="12" cy="12" r="7" stroke-width="2" stroke="currentColor" fill="currentColor"></circle>
                    <path d="M9 12h6" stroke-width="2" stroke-linecap="round" stroke="white"></path>
                  </svg>
                </button>

                <button
                  *ngIf="canEditActions"
                  type="button"
                  (click)="toggleProgressForm(a)"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h4l3 8 4-16 3 8h4"/>
                  </svg>
                  Progrès
                </button>

                <button
                  *ngIf="canEditActions"
                  type="button"
                  (click)="openEditModal(a)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                <button
                  *ngIf="canDeleteActions"
                  type="button"
                  (click)="confirmDelete(a)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>

              <div *ngIf="isProgressOpen(a)" class="mt-4">
                <app-action-progress-form
                  [action]="a"
                  (save)="onProgressSaved($event)"
                  (cancel)="onProgressCancelled(a)">
                </app-action-progress-form>
              </div>

              <div *ngIf="!canEditActions && !canDeleteActions" class="text-xs text-gray-400 italic text-center mt-4">
                Mode lecture seule - Vous n'avez pas les permissions pour modifier
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredActions.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucune action trouvée</h3>
          <p class="mt-2 text-sm text-gray-500">
            <span *ngIf="canCreateActions">Commencez par créer une nouvelle action ou ajustez vos filtres.</span>
            <span *ngIf="!canCreateActions">Aucune action disponible avec les filtres actuels.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div *ngIf="isModalOpen && canCreateActions" 
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
                  {{ modalMode === 'edit' ? 'Modifier Action' : 'Nouvelle Action' }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ modalMode === 'edit' ? 'Modifiez les informations de cette action' : 'Créez une nouvelle action pour votre projet' }}
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
            <app-action-form
              [action]="selectedAction"
              [preselectedProjetId]="preselectedProjetId"
              (save)="onActionSaved($event)"
              (cancel)="closeModal()">
            </app-action-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteConfirm && canDeleteActions" 
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
                  Êtes-vous sûr de vouloir supprimer l'action "<span class="font-medium">{{ actionToDelete?.type_action }}</span>" ? Cette action ne peut pas être annulée.
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
              (click)="deleteAction()"
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
export class ActionsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() preselectedProjetId: number | null = null;

  actions: Action[] = [];
  filteredActions: Action[] = [];
  stats: any = null;
  loading = false;
  deleting = false;

  successMessage = '';
  errorMessage = '';

  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedAction: Action | null = null;

  showDeleteConfirm = false;
  actionToDelete: Action | null = null;

  searchTerm = '';
  filters: actionFilters & { commune?: string } = {};

  projets: Projet[] = [];
  communes: string[] = [];

  canCreateActions = false;
  canEditActions = false;
  canDeleteActions = false;

  // Track which actions have their progress form open
  expandedProgressIds = new Set<number>();

  private subs: Subscription[] = [];

  constructor(
    private actionSvc: actionService,
    private accessControl: AccessControlService,
    private projetService: ProjetService,
    private zoneService: ZoneService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadProjets();
    this.loadCommunes();
    
    // Apply preselected project filter if provided
    if (this.preselectedProjetId) {
      this.filters.id_projet = this.preselectedProjetId;
    }
    
    this.loadActions();
    this.loadStats();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['preselectedProjetId'] && !changes['preselectedProjetId'].firstChange) {
      if (this.preselectedProjetId) {
        this.filters.id_projet = this.preselectedProjetId;
        this.loadActions();
        this.loadStats();
      }
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  private checkPermissions() {
    this.canCreateActions = this.accessControl.canAccess('actions', 'create');
    this.canEditActions = this.accessControl.canAccess('actions', 'update');
    this.canDeleteActions = this.accessControl.canAccess('actions', 'delete');
  }

  private loadProjets() {
    const s = this.projetService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.projets = res.data || [];
        } else {
          console.warn('projets response not successful:', res.message);
          this.projets = [];
        }
      },
      error: (err) => {
        console.error('Failed to load projets:', err);
        this.projets = [];
      }
    });
    this.subs.push(s);
  }

  private loadCommunes() {
  const s = this.zoneService.getAll().subscribe({
    next: (res) => {
      if (res.success && Array.isArray(res.data)) {
        const set = new Set<string>();
        res.data.forEach((z: Zone & any) => {
         if (z.commune && String(z.commune).trim() && String(z.commune).trim() !== 'Région GON') {
         set.add(String(z.commune).trim());
        }
        });
        this.communes = this.sortCommunes(Array.from(set));
      } else {
        this.communes = [];
      }
    },
    error: (err) => {
      this.communes = [];
    }
  });
  this.subs.push(s);
  }
  
  private sortCommunes(communes: string[]): string[] {
  return communes.sort((a, b) => {
    return a.localeCompare(b, 'fr', { numeric: true });
  });
  }

  // Get selected project name for the widget
  getSelectedProjectName(): string {
    if (!this.preselectedProjetId) return '';
    const projet = this.projets.find(p => p.id_projet === this.preselectedProjetId);
    return projet ? `${projet.titre} — #${projet.id_projet}` : `Projet #${this.preselectedProjetId}`;
  }
  
  getZoneDisplay(entity: any): { commune: string; province: string } {
  if (!entity) return { commune: '', province: '' };

  // Treat id_zone === 0 as the special default zone ("Région GON")
  if (Number(entity.id_zone) === 0) {
    const commune = (entity.commune === 'default' || !entity.commune) ? '—' : entity.commune;
    const province = (entity.province === 'default' || !entity.province) ? 'Région GON' : entity.province;
    return { commune, province };
  }

  return {
    commune: entity.commune || `Zone ${entity.id_zone}`,
    province: entity.province || ''
  };
  }
  
  goToBudgetSuivi(action: Action) {
  if (!action || !action.id_action) return;
  this.router.navigate(['/suivi-budgets'], {
    queryParams: {
      tab: 'actions',
      id_action: action.id_action
    }
  });
  }

  loadActions() {
    this.loading = true;

    const serverFilters: any = { ...this.filters };
    delete serverFilters.commune;

    const sub = this.actionSvc.getAll(serverFilters).subscribe({
      next: (response) => {
        if (response.success) {
          this.actions = response.data || [];
          this.filterActions();
        } else {
          this.showError(response.message || 'Erreur lors du chargement des actions');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actions:', error);
        this.showError('Erreur lors du chargement des actions');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  loadStats() {
    const serverFilters: any = { ...this.filters };
    delete serverFilters.commune;

    const sub = this.actionSvc.getStats(serverFilters).subscribe({
      next: (response) => {
        if (response.success) {
          // If we already have the actions list (which the service has already scoped by user zones),
          // compute the top-card stats from that scoped list so the cards reflect the same filtering.
          if (this.actions && this.actions.length) {
            const list = this.actions;
            const byStatus: Record<string, number> = {};
            list.forEach((a: any) => {
              const s = this.normalizeStatusLabel(a.statut);
              byStatus[s] = (byStatus[s] || 0) + 1;
            });
            this.stats = {
              ...(response.data || {}),
              total: list.length,
              par_statut: byStatus,
              byStatus
            };
          } else {
            // fallback to server-provided aggregated stats when the list isn't loaded yet
            this.stats = response.data;
          }
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
    if (!this.stats) return 0;
    if (this.stats.byStatus) return this.stats.byStatus[status] || 0;
    if (this.stats.par_statut) return this.stats.par_statut[status] || 0;
    return 0;
  }

  filterActions() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    const commune = (this.filters.commune || '').toString().trim().toLowerCase();
    const typeVolet = (this.filters.type_volet || '').toString().trim();
    const statut = (this.filters.statut || '').toString().trim();
    const idProjet = this.filters.id_projet;

    this.filteredActions = (this.actions || []).filter(a => {
      if (term) {
        if (!a.type_action || !a.type_action.toLowerCase().includes(term)) return false;
      }

      if (commune) {
        if (!a.commune || a.commune.toLowerCase() !== commune) return false;
      }

      if (typeVolet) {
        if (!a.type_volet || a.type_volet !== typeVolet) return false;
      }

      if (statut) {
        const s = (a.statut || '').toString();
        if (!s.toLowerCase().includes(statut.toLowerCase())) return false;
      }

      if (idProjet != null) {
        if (!a.id_projet || Number(a.id_projet) !== Number(idProjet)) return false;
      }

      return true;
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.filters.type_volet ||
      this.filters.statut ||
      this.filters.commune ||
      this.filters.id_projet
    );
  }

  clearFilters() {
    this.searchTerm = '';
    this.filters = {};
    this.preselectedProjetId = null;
    this.filters.id_projet = undefined;
    
    // Clear URL query parameters
    this.router.navigate([], {
     relativeTo: this.router.routerState.root,
     queryParams: {},
     replaceUrl: true
    });

    this.loadActions();
    this.loadStats();
    this.showSuccess('Filtres effacés avec succès');
  }

  openCreateModal() {
    if (!this.canCreateActions) {
      this.showError('Vous n\'avez pas les permissions pour créer des actions');
      return;
    }
    this.selectedAction = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(a: Action) {
    if (!this.canEditActions) {
      this.showError('Vous n\'avez pas les permissions pour modifier des actions');
      return;
    }
    this.selectedAction = { ...(a as Action) };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedAction = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedAction = null;
      this.modalMode = 'create';
    }
  }

  confirmDelete(a: Action) {
    if (!this.canDeleteActions) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des actions');
      return;
    }
    this.actionToDelete = a;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.actionToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteAction() {
    if (!this.actionToDelete || !this.canDeleteActions) return;

    this.deleting = true;
    const sub = this.actionSvc.delete(this.actionToDelete.id_action).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadActions();
          this.loadStats();
          this.showSuccess(`Action "${this.actionToDelete!.type_action}" supprimée avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.showError('Erreur lors de la suppression de l\'action');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  onActionSaved(a: Action) {
    this.loadActions();
    this.loadStats();

    if (this.modalMode === 'create') {
      this.showSuccess(`Action "${a.type_action}" créée avec succès`);
    } else {
      this.showSuccess(`Action "${a.type_action}" modifiée avec succès`);
    }

    this.closeModal();
  }

  // --- Progress form helpers ---
  isProgressOpen(a: Action): boolean {
    if (!a || a.id_action === undefined || a.id_action === null) return false;
    return this.expandedProgressIds.has(Number(a.id_action));
  }

  toggleProgressForm(a: Action) {
    if (!a || a.id_action === undefined || a.id_action === null) return;
    const id = Number(a.id_action);
    if (this.expandedProgressIds.has(id)) {
      this.expandedProgressIds.delete(id);
    } else {
      this.expandedProgressIds.add(id);
    }
  }

  onProgressSaved(updatedAction: Action) {
    // refresh list and close the form for that action
    if (updatedAction && updatedAction.id_action) {
      this.expandedProgressIds.delete(Number(updatedAction.id_action));
    }
    this.loadActions();
    this.loadStats();
    this.showSuccess('Progrès mis à jour avec succès');
  }

  onProgressCancelled(a: Action) {
    if (!a || a.id_action === undefined || a.id_action === null) return;
    this.expandedProgressIds.delete(Number(a.id_action));
  }

  getStatusClass(statut: string | ActionStatus): string {
    if (!statut) return 'bg-gray-100 text-gray-800';
    const s = String(statut).trim().toLowerCase();
    if (s.startsWith('plan')) return 'bg-amber-100 text-amber-800';
    if (s.includes('en cours') || s === 'encours' || s === 'en-cours') return 'bg-blue-100 text-blue-800';
    if (s.startsWith('term') || s.startsWith('réal') || s.startsWith('real')) return 'bg-green-100 text-green-800';
    if (s.startsWith('suspend') || s.startsWith('suspendu') || s.startsWith('suspendue')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }

  normalizeStatusLabel(statut: string | ActionStatus): string {
    if (!statut) return '';
    const s = String(statut).trim().toLowerCase();
    if (s.startsWith('plan')) return 'Planifiée';
    if (s.includes('en cours') || s === 'encours' || s === 'en-cours') return 'En cours';
    if (s.startsWith('term') || s.startsWith('réal') || s.startsWith('real')) return 'Terminée';
    if (s.startsWith('suspend')) return 'Suspendue';
    const raw = String(statut).trim();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  onFilterChange() {
    this.loadActions();
    this.loadStats();
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