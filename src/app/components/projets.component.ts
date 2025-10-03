import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjetService, ProjetFilters, ProjetStats } from '../services/projet.service';
import { Projet, ProjetStatus } from '../models/projet.model';
import { ProjetFormComponent } from './projet-form.component';
import { AccessControlService } from '../services/access-control.service';
import { CadreLogiqueService } from '../services/cadre-logique.service';
import { CadreLogique } from '../models/cadre-logique.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projets',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjetFormComponent],
  template: `
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            *ngIf="canCreateprojets"
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nouveau Projet
          </button>
          <div *ngIf="!canCreateprojets" class="text-sm text-gray-500 italic">
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
                <div class="text-2xl font-bold text-blue-600">{{ stats?.par_statut?.['En cours'] || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Planifiés -->
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
                <div class="text-sm font-medium text-gray-500">Planifiés</div>
                <div class="text-2xl font-bold text-amber-600">{{ stats?.par_statut?.['Planifié'] || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terminés -->
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
                <div class="text-sm font-medium text-gray-500">Terminés</div>
                <div class="text-2xl font-bold text-green-600">{{ stats?.par_statut?.['Terminé'] || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Suspendus -->
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
                <div class="text-sm font-medium text-gray-500">Suspendus</div>
                <div class="text-2xl font-bold text-red-600">{{ stats?.par_statut?.['Suspendu'] || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-6 py-6 sm:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Filtres de recherche</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <!-- Rechercher -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Rechercher
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (input)="filterprojets()"
                  placeholder="Titre du projet"
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

            <!-- Statut -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Statut
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.statut"
                  (change)="loadprojets()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les statuts</option>
                  <option value="Planifié">Planifié</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                  <option value="Suspendu">Suspendu</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Cadre logique -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Cadre logique
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.id_cadre"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les cadres</option>
                  <option *ngFor="let c of cadres" [ngValue]="c.id_cadre">{{ getCadreDisplay(c) }}</option>
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
          <p class="mt-4 text-sm text-gray-500">Chargement des projets...</p>
        </div>
      </div>

      <!-- projets Table/Cards -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden" *ngIf="!loading">
        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                <th *ngIf="canEditprojets || canDeleteprojets" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let projet of filteredprojets" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ projet.titre }}</div>
                  <div class="text-sm text-gray-500 mt-1" *ngIf="projet.observations">
                    {{ projet.observations | slice:0:60 }}{{ projet.observations && projet.observations.length > 60 ? '...' : '' }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ projet.entreprise }}</div>
                  <div class="text-sm text-gray-500">{{ projet.n_marche }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ formatDate(projet.date_debut) }}</div>
                  <div class="text-sm text-gray-500">{{ formatDate(projet.date_fin) }}</div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="getStatusClass(projet.statut)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap">
                    {{ projet.statut }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ projet.responsable_name }}
                </td>
                <td *ngIf="canEditprojets || canDeleteprojets" class="px-6 py-4 text-right">
                  <div class="flex justify-end space-x-2">
				    <button
                      type="button"
                      (click)="goToBudgetSuivi(projet)"
                      class="inline-flex items-center p-2 border border-gray-200 rounded-lg text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                      title="Voir le suivi budget de ce projet">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="7" stroke-width="2" stroke="currentColor" fill="currentColor"></circle>
                        <path d="M9 12h6" stroke-width="2" stroke-linecap="round" stroke="white"></path>
                      </svg>
                    </button>
				    <button
                      type="button"
                      (click)="goToCreateAction(projet)"
                      class="inline-flex items-center p-2 border border-gray-200 rounded-lg text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      title="Créer une action pour ce projet">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </button>
                    <button
                      *ngIf="canEditprojets"
                      type="button"
                      (click)="openEditModal(projet)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      *ngIf="canDeleteprojets"
                      type="button"
                      (click)="confirmDelete(projet)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                    <div *ngIf="!canEditprojets && !canDeleteprojets" class="text-xs text-gray-400 italic px-2 py-1">
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
            <div *ngFor="let projet of filteredprojets" class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-900">{{ projet.titre }}</h3>
                <span [class]="getStatusClass(projet.statut)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap">
                  {{ projet.statut }}
                </span>
              </div>
              
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span class="font-medium">Entreprise:</span>
                  <span>{{ projet.entreprise }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">N° Marché:</span>
                  <span>{{ projet.n_marche }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Période:</span>
                  <span>{{ formatDate(projet.date_debut) }} - {{ formatDate(projet.date_fin) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Créé par:</span>
                  <span>{{ projet.responsable_name }}</span>
                </div>
                <div *ngIf="projet.observations" class="mt-2">
                  <span class="font-medium">Observations:</span>
                  <p class="mt-1 text-xs">{{ projet.observations | slice:0:100 }}{{ projet.observations && projet.observations.length > 100 ? '...' : '' }}</p>
                </div>
              </div>
              
              <div class="flex justify-end space-x-2 mt-4" *ngIf="canEditprojets || canDeleteprojets">
			    <button
                  type="button"
                  (click)="goToBudgetSuivi(projet)"
                  class="inline-flex items-center p-2 border border-gray-200 rounded-lg text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                  title="Voir le suivi budget de ce projet">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                     <circle cx="12" cy="12" r="7" stroke-width="2" stroke="currentColor" fill="currentColor"></circle>
                     <path d="M9 12h6" stroke-width="2" stroke-linecap="round" stroke="white"></path>
                  </svg>
                </button>
			    <button
                   type="button"
                   (click)="goToCreateAction(projet)"
                   class="inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-lg text-green-600 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                   <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                   </svg>
                   Nouvelle Action
                </button>
                <button
                  *ngIf="canEditprojets"
                  type="button"
                  (click)="openEditModal(projet)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                <button
                  *ngIf="canDeleteprojets"
                  type="button"
                  (click)="confirmDelete(projet)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>
              <div *ngIf="!canEditprojets && !canDeleteprojets" class="text-xs text-gray-400 italic text-center mt-4">
                Mode lecture seule - Vous n'avez pas les permissions pour modifier
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredprojets.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun projet trouvée</h3>
          <p class="mt-2 text-sm text-gray-500">
            <span *ngIf="canCreateprojets">Commencez par créer un nouveau projet ou ajustez vos filtres.</span>
            <span *ngIf="!canCreateprojets">Aucune projet disponible avec les filtres actuels.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal with Professional Overlay -->
    <div *ngIf="isModalOpen && canCreateprojets" 
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
                  {{ modalMode === 'edit' ? 'Modifier Projet' : 'Nouveau Projet' }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ modalMode === 'edit' ? 'Modifiez les informations du projet' : 'Créez un nouveau projet' }}
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
            <app-projet-form
              [projet]="selectedprojet"
              (save)="onprojetSaved($event)"
              (cancel)="closeModal()">
            </app-projet-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal with Professional Overlay -->
    <div *ngIf="showDeleteConfirm && canDeleteprojets" 
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
                  Êtes-vous sûr de vouloir supprimer le projet "<span class="font-medium">{{ projetToDelete?.titre }}</span>" ? Cette action ne peut pas être annulée.
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
              (click)="deleteprojet()"
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
export class ProjetsComponent implements OnInit {
  projets: Projet[] = [];
  filteredprojets: Projet[] = [];
  stats: ProjetStats | null = null;
  loading = false;
  deleting = false;

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Modal states
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedprojet: Projet | null = null;
  
  // Delete confirmation
  showDeleteConfirm = false;
  projetToDelete: Projet | null = null;

  // Filters
  searchTerm = '';
  // Removed commune filter, only keeping id_cadre as client-side filter
  filters: ProjetFilters & { id_cadre?: number } = {};

  // Permission properties
  canCreateprojets = false;
  canEditprojets = false;
  canDeleteprojets = false;

  // For dropdowns - removed communes, kept cadres
  cadres: CadreLogique[] = [];

  constructor(
    private projetService: ProjetService,
    private accessControl: AccessControlService,
    private cadreService: CadreLogiqueService,
	private router: Router
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadFilterData();
    this.loadprojets();
    this.loadStats();
  }

  private checkPermissions() {
    this.canCreateprojets = this.accessControl.canAccess('projets', 'create');
    this.canEditprojets = this.accessControl.canAccess('projets', 'update');
    this.canDeleteprojets = this.accessControl.canAccess('projets', 'delete');

    console.log('projet permissions:', {
      canCreate: this.canCreateprojets,
      canEdit: this.canEditprojets,
      canDelete: this.canDeleteprojets
    });
  }

  // Load cadres used for filter dropdown
  private loadFilterData() {
    // load cadres for dropdown
    this.cadreService.getAll().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          try {
            this.cadres = this.cadreService.sortElementsHierarchically(res.data || []);
          } catch (err) {
            console.warn('Failed to hierarchical sort cadres, using raw list', err);
            this.cadres = res.data || [];
          }
        } else {
          this.cadres = [];
        }
      },
      error: (err) => {
        console.error('Failed to load cadres for filters:', err);
        this.cadres = [];
      }
    });
  }
  
  goToCreateAction(projet: Projet) {
    if (!projet || !projet.id_projet) return;
    this.router.navigate(['/projets-actions'], { 
      queryParams: { 
        tab: 'actions',
        id_projet: projet.id_projet 
      } 
    });
  }
  
  goToBudgetSuivi(projet: Projet) {
  if (!projet || !projet.id_projet) return;
  this.router.navigate(['/suivi-budgets'], { 
    queryParams: { 
      tab: 'projets',
      id_projet: projet.id_projet 
    } 
  });
  }

  loadprojets() {
    this.loading = true;

    // Send serverFilters excluding client-only id_cadre
    const serverFilters: ProjetFilters = { ...this.filters as ProjetFilters };
    // @ts-ignore
    delete (serverFilters as any).id_cadre;

    this.projetService.getAll(serverFilters).subscribe({
      next: (response) => {
        if (response.success) {
          this.projets = response.data;
          this.filterprojets(); // apply client-side filters (id_cadre, searchTerm)
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des projets:', error);
        this.showError('Erreur lors du chargement des projets');
        this.loading = false;
      }
    });
  }

  loadStats() {
    // request stats excluding client-only filters
    const serverFilters: ProjetFilters = { ...this.filters as ProjetFilters };
    // @ts-ignore
    delete (serverFilters as any).id_cadre;

    this.projetService.getStats(serverFilters).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  filterprojets() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    const selectedCadre = this.filters.id_cadre;

    this.filteredprojets = this.projets.filter(projet => {
      // search term on title
      if (term) {
        if (!projet.titre || !projet.titre.toLowerCase().includes(term)) return false;
      }

      // cadre client-side filter (projet.id_cadre expected)
      if (selectedCadre !== undefined && selectedCadre !== null) {
        // some projets may not have id_cadre; compare loosely
        if ((projet as any).id_cadre === undefined || (projet as any).id_cadre !== selectedCadre) return false;
      }

      // server-side filters (statut) already applied from server, but double-check
      if (this.filters.statut) {
        if (projet.statut !== this.filters.statut) return false;
      }

      return true;
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.filters.statut ||
      this.filters.id_cadre
    );
  }

  clearFilters() {
    this.searchTerm = '';
    this.filters = {};
    // reload data and stats
    this.loadprojets();
    this.loadStats();
    this.showSuccess('Filtres effacés avec succès');
  }

  openCreateModal() {
    if (!this.canCreateprojets) {
      this.showError('Vous n\'avez pas les permissions pour créer des projets');
      return;
    }
    
    console.log('Opening create modal');
    this.selectedprojet = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(projet: Projet) {
    if (!this.canEditprojets) {
      this.showError('Vous n\'avez pas les permissions pour modifier des projets');
      return;
    }
    
    console.log('Opening edit modal for projet:', projet);
    this.selectedprojet = { ...projet };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedprojet = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedprojet = null;
      this.modalMode = 'create';
    }
  }

  onFilterChange() {
    // When client-side filter values change (cadre), we only need to re-apply client-side
    // However, since some filters (statut) are server-side, reload projets from server excluding client-only filters
    this.loadprojets();
    this.loadStats();
  }

  confirmDelete(projet: Projet) {
    if (!this.canDeleteprojets) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des projets');
      return;
    }
    
    this.projetToDelete = projet;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.projetToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteprojet() {
    if (!this.projetToDelete || !this.canDeleteprojets) return;

    this.deleting = true;
    this.projetService.delete(this.projetToDelete.id_projet).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadprojets();
          this.loadStats();
          this.showSuccess(`projet "${this.projetToDelete!.titre}" supprimée avec succès`);
          this.cancelDelete();
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.showError('Erreur lors de la suppression de l\'projet');
        this.deleting = false;
      }
    });
  }

  onprojetSaved(projet: Projet) {
    console.log('projet saved:', projet);
    this.loadprojets();
    this.loadStats();
    
    if (this.modalMode === 'create') {
      this.showSuccess(`projet "${projet.titre}" créée avec succès`);
    } else {
      this.showSuccess(`projet "${projet.titre}" modifiée avec succès`);
    }
    
    this.closeModal();
  }

  getStatusClass(statut: ProjetStatus): string {
    const classes = {
      'Planifié': 'bg-amber-100 text-amber-800',
      'En cours': 'bg-blue-100 text-blue-800',
      'Terminé': 'bg-green-100 text-green-800',
      'Suspendu': 'bg-red-100 text-red-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date?: Date | string): string {
    // Accept undefined (model has optional dates). Return empty string if missing/invalid.
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('fr-FR');
  }

  getCadreDisplay(c: CadreLogique): string {
    // prefer _displayIntitule if provided by service sorter
    // @ts-ignore
    if ((c as any)._displayIntitule) return (c as any)._displayIntitule;
    if ((c as any).intitule) return (c as any).intitule;
    return `Cadre ${c.id_cadre}`;
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
