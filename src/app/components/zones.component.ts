import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZoneService, ZoneFilters, ZoneStats } from '../services/zone.service';
import { Zone } from '../models/zone.model';
import { ZoneFormComponent } from './zone-form.component';
import { AccessControlService } from '../services/access-control.service';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [CommonModule, FormsModule, ZoneFormComponent],
  template: `
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gestion des Zones</h1>
            <p class="mt-1 text-sm text-gray-600">
              Gestion des zones géographiques du plan d'aménagement
            </p>
          </div>
          <button
            *ngIf="canCreateZones"
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nouvelle Zone
          </button>
          <div *ngIf="!canCreateZones" class="text-sm text-gray-500 italic">
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Total Zones</div>
                <div class="text-2xl font-bold text-gray-900">{{ stats?.total || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Communes (NEW) -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Communes</div>
                <div class="text-2xl font-bold text-indigo-600">{{ getCommuneCount() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Provinces -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Provinces</div>
                <div class="text-2xl font-bold text-green-600">{{ getProvinceCount() }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Périmètres -->
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <div class="text-sm font-medium text-gray-500">Périmètres</div>
                <div class="text-2xl font-bold text-amber-600">{{ getPerimetreCount() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-6 py-6 sm:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Filtres de recherche</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
            <!-- Province (dropdown) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Province
              </label>
              <div class="relative">
                <select
                  #provinceSelect
                  [(ngModel)]="filters.province"
                  (change)="onProvinceFilterChange(provinceSelect.value)"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400
                         disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                         appearance-none bg-white">
                  <option [ngValue]="undefined">Toutes les provinces</option>
                  <option *ngFor="let p of provinces" [value]="p">{{ p }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Commune (dropdown, always active) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Commune
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.commune"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
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

            <!-- Périmètre (text search input, client-side) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Périmètre
              </label>
              <div class="relative">
                <input
                  #perimetreInput
                  type="text"
                  [value]="filters.perimetre || ''"
                  (input)="onPerimetreFilterChange(perimetreInput.value)"
                  placeholder="Nom du périmètre..."
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400">
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
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
          <p class="mt-4 text-sm text-gray-500">Chargement des zones...</p>
        </div>
      </div>

      <!-- Zones Table/Cards -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden" *ngIf="!loading">
        <!-- Desktop Table View -->
        <div class="hidden lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Province</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commune</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Périmètre</th>
                <th *ngIf="canEditZones || canDeleteZones" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let zone of filteredZones" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ zone.province }}
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ zone.commune }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ zone.perimetre }}
                </td>
                <td *ngIf="canEditZones || canDeleteZones" class="px-6 py-4 text-right">
                  <div class="flex justify-end space-x-2">
                    <button
                      *ngIf="canEditZones"
                      type="button"
                      (click)="openEditModal(zone)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      *ngIf="canDeleteZones"
                      type="button"
                      (click)="confirmDelete(zone)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                    <div *ngIf="!canEditZones && !canDeleteZones" class="text-xs text-gray-400 italic px-2 py-1">
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
            <div *ngFor="let zone of filteredZones" class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-900">{{ zone.commune }}</h3>
                <span class="text-xs text-gray-500">{{ zone.province }}</span>
              </div>
              
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span class="font-medium">Province:</span>
                  <span>{{ zone.province }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Périmètre:</span>
                  <span>{{ zone.perimetre }}</span>
                </div>
              </div>
              
              <div class="flex justify-end space-x-2 mt-4" *ngIf="canEditZones || canDeleteZones">
                <button
                  *ngIf="canEditZones"
                  type="button"
                  (click)="openEditModal(zone)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                <button
                  *ngIf="canDeleteZones"
                  type="button"
                  (click)="confirmDelete(zone)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>
              <div *ngIf="!canEditZones && !canDeleteZones" class="text-xs text-gray-400 italic text-center mt-4">
                Mode lecture seule - Vous n'avez pas les permissions pour modifier
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredZones.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucune zone trouvée</h3>
          <p class="mt-2 text-sm text-gray-500">
            <span *ngIf="canCreateZones">Commencez par créer une nouvelle zone ou ajustez vos filtres.</span>
            <span *ngIf="!canCreateZones">Aucune zone disponible avec les filtres actuels.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal with Professional Overlay -->
    <div *ngIf="isModalOpen && canCreateZones" 
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
                  {{ modalMode === 'edit' ? 'Modifier Zone' : 'Nouvelle Zone' }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ modalMode === 'edit' ? 'Modifiez les informations de cette zone' : 'Créez une nouvelle zone géographique' }}
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
            <app-zone-form
              [zone]="selectedZone"
              (save)="onZoneSaved($event)"
              (cancel)="closeModal()">
            </app-zone-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal with Professional Overlay -->
    <div *ngIf="showDeleteConfirm && canDeleteZones" 
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
                  Êtes-vous sûr de vouloir supprimer la zone "<span class="font-medium">{{ zoneToDelete?.commune }}</span>" ? Cette action ne peut pas être annulée.
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
              (click)="deleteZone()"
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
export class ZonesComponent implements OnInit {
  zones: Zone[] = [];
  filteredZones: Zone[] = [];
  stats: ZoneStats | null = null;
  loading = false;
  deleting = false;

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Modal states
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedZone: Zone | null = null;

  // Delete confirmation
  showDeleteConfirm = false;
  zoneToDelete: Zone | null = null;

  // Filters
  filters: ZoneFilters = {};

  // Permission properties
  canCreateZones = false;
  canEditZones = false;
  canDeleteZones = false;

  // Filter dropdown options
  provinces: string[] = [];
  communes: string[] = [];

  constructor(
    private zoneService: ZoneService,
    private accessControl: AccessControlService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    // initialize filters empty, then load data
    this.loadZones();
    this.loadStats();
  }

  private checkPermissions() {
    this.canCreateZones = this.accessControl.canAccess('zones', 'create');
    this.canEditZones = this.accessControl.canAccess('zones', 'update');
    this.canDeleteZones = this.accessControl.canAccess('zones', 'delete');

    console.log('Zone permissions:', {
      canCreate: this.canCreateZones,
      canEdit: this.canEditZones,
      canDelete: this.canDeleteZones
    });
  }

  loadZones() {
    this.loading = true;

    // Send filters to server EXCLUDING perimetre (we want perimetre to be client-side)
    const serverFilters: ZoneFilters = { ...this.filters };
    if ('perimetre' in serverFilters) {
      delete (serverFilters as any).perimetre;
    }

    this.zoneService.getAll(serverFilters).subscribe({
      next: (response) => {
        if (response.success) {
          this.zones = response.data;
          // populate communes dropdown with all available communes from returned zones
          const set = new Set<string>();
          this.zones.forEach(z => {
            if (z.commune && z.commune.trim()) set.add(z.commune.trim());
          });
          this.communes = Array.from(set).sort();

          // Apply client-side filtering (will apply perimetre client-side)
          this.filterZones();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des zones:', error);
        this.showError('Erreur lors du chargement des zones');
        this.loading = false;
      }
    });
  }

  loadStats() {
    // Request stats from server excluding perimetre so perimetre stays client-side
    const serverFilters: ZoneFilters = { ...this.filters };
    if ('perimetre' in serverFilters) {
      delete (serverFilters as any).perimetre;
    }

    this.zoneService.getStats(serverFilters).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
          // populate province dropdown options from stats
          this.provinces = this.stats && this.stats.par_province ? Object.keys(this.stats.par_province).sort() : [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    });
  }

  // When perimetre filter text changes — apply client-side only (no backend calls)
  onPerimetreFilterChange(value: string) {
    const v = (value || '').trim();
    if (v) {
      this.filters.perimetre = v;
    } else {
      delete this.filters.perimetre;
    }

    // Apply filtering only on the already-loaded zones (frontend)
    this.filterZones();
  }

  // When province filter changes via dropdown
  onProvinceFilterChange(value: string) {
    if (value) {
      this.filters.province = value;
      // load communes for this province to populate commune dropdown (override global list)
      this.loadCommunesForFilter(value);
    } else {
      delete this.filters.province;
      // clear commune filter when province cleared
      delete this.filters.commune;
      // repopulate communes with full list by reloading zones (will fill communes)
      this.loadZones();
    }
    // Reload from server (excluding perimetre) and refresh stats
    this.loadZones();
    this.loadStats();
  }

  // When commune filter changes or any other filter change that should hit server
  onFilterChange() {
    // Province / commune changes still use server-side (so reload)
    // After loadZones returns, filterZones will re-apply perimetre client-side
    this.loadZones();
    this.loadStats();
  }

  private loadCommunesForFilter(province: string) {
    if (!province) {
      this.communes = [];
      return;
    }
    this.zoneService.getByProvince(province).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const set = new Set<string>();
          res.data.forEach(z => {
            if (z.commune && z.commune.trim()) {
              set.add(z.commune.trim());
            }
          });
          this.communes = Array.from(set).sort();
        } else {
          this.communes = [];
        }
      },
      error: (err) => {
        console.error('Failed to load communes for filter province:', err);
        this.communes = [];
      }
    });
  }

  // Apply client-side filtering combining server-returned zones with local perimetre search
  filterZones() {
    const perimetre = (this.filters.perimetre || '').trim().toLowerCase();

    this.filteredZones = this.zones.filter(zone => {
      // filter by selected commune if set (server may already have filtered, but we re-check)
      if (this.filters.commune) {
        if ((zone.commune || '').toLowerCase() !== String(this.filters.commune).toLowerCase()) {
          return false;
        }
      }
      // filter by selected province if set
      if (this.filters.province) {
        if ((zone.province || '').toLowerCase() !== String(this.filters.province).toLowerCase()) {
          return false;
        }
      }
      // filter by perimetre if set (text match) — client-side
      if (perimetre) {
        if (!zone.perimetre || !zone.perimetre.toLowerCase().includes(perimetre)) {
          return false;
        }
      }
      return true;
    });
  }

  getProvinceCount(): number {
    if (!this.stats?.par_province) return 0;
    return Object.keys(this.stats.par_province).length;
  }

  getPerimetreCount(): number {
    if (!this.stats?.par_perimetre) return 0;
    return Object.keys(this.stats.par_perimetre).length;
  }

  // New: count unique communes from loaded zones (reflects current filters)
  getCommuneCount(): number {
    if (!this.zones || this.zones.length === 0) return 0;
    const set = new Set(this.zones.map(z => (z.commune || '').trim()));
    return set.size;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.province ||
      this.filters.commune ||
      this.filters.perimetre
    );
  }

  clearFilters() {
    this.filters = {};
    this.communes = [];
    this.loadZones();
    this.loadStats();
    this.showSuccess('Filtres effacés avec succès');
  }

  openCreateModal() {
    if (!this.canCreateZones) {
      this.showError('Vous n\'avez pas les permissions pour créer des zones');
      return;
    }

    console.log('Opening create modal');
    this.selectedZone = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(zone: Zone) {
    if (!this.canEditZones) {
      this.showError('Vous n\'avez pas les permissions pour modifier des zones');
      return;
    }

    console.log('Opening edit modal for zone:', zone);
    this.selectedZone = { ...zone };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedZone = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedZone = null;
      this.modalMode = 'create';
    }
  }

  confirmDelete(zone: Zone) {
    if (!this.canDeleteZones) {
      this.showError('Vous n\'avez pas les permissions pour supprimer des zones');
      return;
    }

    this.zoneToDelete = zone;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.zoneToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteZone() {
    if (!this.zoneToDelete || !this.canDeleteZones) return;

    this.deleting = true;
    this.zoneService.delete(this.zoneToDelete.id_zone).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadZones();
          this.loadStats();
          this.showSuccess(`Zone "${this.zoneToDelete!.commune}" supprimée avec succès`);
          this.cancelDelete();
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.showError('Erreur lors de la suppression de la zone');
        this.deleting = false;
      }
    });
  }

  onZoneSaved(zone: Zone) {
    console.log('Zone saved:', zone);
    this.loadZones();
    this.loadStats();

    if (this.modalMode === 'create') {
      this.showSuccess(`Zone "${zone.commune}" créée avec succès`);
    } else {
      this.showSuccess(`Zone "${zone.commune}" modifiée avec succès`);
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