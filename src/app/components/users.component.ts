import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService, UserStats } from '../services/user.service';
import { User, UserRole } from '../models/user.model';
import { UserFormComponent } from './user-form.component';
import { ZoneService } from '../services/zone.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserFormComponent],
  template: `

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" *ngIf="stats">
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <div class="text-sm font-medium text-gray-500 truncate">Total Utilisateurs</div>
                <div class="text-lg font-bold text-blue-600">{{ stats.total }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <div class="text-sm font-medium text-gray-500 truncate">Comptes Actifs</div>
                <div class="text-lg font-bold text-green-600">{{ stats.active }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <div class="text-sm font-medium text-gray-500 truncate">Comptes Inactifs</div>
                <div class="text-lg font-bold text-red-600">{{ stats.inactive }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <div class="text-sm font-medium text-gray-500 truncate">Administrateurs</div>
                <div class="text-2xl font-bold text-purple-600">{{ stats.byRole['Admin'] || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-6 py-6 sm:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Filtres</h3>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <!-- Role Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Rôle</label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.role"
                  (change)="loadUsers()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les rôles</option>
                  <option value="Admin">Administrateur</option>
                  <option value="Coordinateur">Coordinateur</option>
                  <option value="Opérateur">Opérateur</option>
                  <option value="Observateur">Observateur</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Statut</label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.actif"
                  (change)="loadUsers()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [value]="undefined">Tous les statuts</option>
                  <option [value]="true">Actifs</option>
                  <option [value]="false">Inactifs</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Province Filter (click to open floating panel) -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-900 mb-2">Provinces</label>

              <!-- Field (keeps size consistent with other selects) -->
              <div
                #provinceToggle
                class="block w-full px-3 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out bg-white cursor-pointer flex items-center justify-between"
                (click)="toggleProvincePanel($event)">
                <div class="text-sm text-gray-700 truncate">
                  <ng-container *ngIf="filters.provinces && filters.provinces.length; else placeholderProv">
                    {{ (filters.provinces || []).slice(0,2).join(', ') }}<span *ngIf="filters.provinces.length > 2">, +{{ filters.provinces.length - 2 }}</span>
                  </ng-container>
                  <ng-template #placeholderProv>
                    <span class="text-gray-400">Toutes les provinces</span>
                  </ng-template>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="text-xs text-gray-500">{{ filters.provinces?.length || 0 }}</div>
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>

              <!-- Floating panel -->
              <div *ngIf="showProvincePanel" #provincePanel class="absolute z-50 mt-2 left-0 w-full md:w-[360px]">
                <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-4" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex-1 pr-2">
                      <input type="text" [(ngModel)]="provinceSearch" placeholder="Rechercher une province..."
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div class="flex items-center gap-2 ml-3">
                      <button type="button" (click)="selectAllProvincesFilter()" class="px-3 py-1 text-xs bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700">Tout</button>
                      <button type="button" (click)="clearProvincesFilter()" class="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md">Effacer</button>
                      <button type="button" (click)="closeProvincePanel()" class="px-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md">Fermer</button>
                    </div>
                  </div>

                  <div class="max-h-56 overflow-auto border rounded-lg p-2 bg-white">
                    <div *ngIf="filteredProvinces.length === 0" class="text-xs text-gray-500 py-4 text-center">Aucune province trouvée</div>
                    <div *ngFor="let p of filteredProvinces; trackBy: trackByValue" class="flex items-center py-1 px-2 rounded hover:bg-gray-50">
                      <input type="checkbox" [id]="'f-prov-' + p" [checked]="isFilterSelected('provinces', p)" (change)="toggleFilterSelection('provinces', p)"
                        class="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                      <label [for]="'f-prov-' + p" class="ml-3 text-sm text-gray-700 cursor-pointer">{{ p }}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Commune Filter (click to open floating panel) -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-900 mb-2">Communes</label>

              <div
                #communeToggle
                class="block w-full px-3 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out bg-white cursor-pointer flex items-center justify-between"
                (click)="toggleCommunePanel($event)">
                <div class="text-sm text-gray-700 truncate">
                  <ng-container *ngIf="filters.communes && filters.communes.length; else placeholderComm">
                    {{ (filters.communes || []).slice(0,2).join(', ') }}<span *ngIf="filters.communes.length > 2">, +{{ filters.communes.length - 2 }}</span>
                  </ng-container>
                  <ng-template #placeholderComm>
                    <span class="text-gray-400">Toutes les communes</span>
                  </ng-template>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="text-xs text-gray-500">{{ filters.communes?.length || 0 }}</div>
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>

              <!-- Floating panel -->
              <div *ngIf="showCommunePanel" #communePanel class="absolute z-50 mt-2 left-0 w-full md:w-[360px]">
                <div class="bg-white border border-gray-200 rounded-xl shadow-lg p-4" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex-1 pr-2">
                      <input type="text" [(ngModel)]="communeSearch" placeholder="Rechercher une commune..."
                        class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div class="flex items-center gap-2 ml-3">
                      <button type="button" (click)="selectAllCommunesFilter()" class="px-3 py-1 text-xs bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700">Tout</button>
                      <button type="button" (click)="clearCommunesFilter()" class="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md">Effacer</button>
                      <button type="button" (click)="closeCommunePanel()" class="px-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md">Fermer</button>
                    </div>
                  </div>

                  <div class="max-h-56 overflow-auto border rounded-lg p-2 bg-white">
                    <div *ngIf="filteredCommunes.length === 0" class="text-xs text-gray-500 py-4 text-center">Aucune commune trouvée</div>
                    <div *ngFor="let c of filteredCommunes; trackBy: trackByValue" class="flex items-center py-1 px-2 rounded hover:bg-gray-50">
                      <input type="checkbox" [id]="'f-comm-' + c" [checked]="isFilterSelected('communes', c)" (change)="toggleFilterSelection('communes', c)"
                        class="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                      <label [for]="'f-comm-' + c" class="ml-3 text-sm text-gray-700 cursor-pointer">{{ c }}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Clear Filters -->
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
          <p class="mt-4 text-sm text-gray-500">Chargement des utilisateurs...</p>
        </div>
      </div>

      <!-- Users Table -->
      <div *ngIf="!loading" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <!-- Desktop View -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Structure</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let user of users" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-indigo-600">
                          {{ user.prenom.charAt(0) }}{{ user.nom.charAt(0) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.prenom }} {{ user.nom }}</div>
                      <div class="text-sm text-gray-500">{{ user.login }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                </td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class.bg-purple-100]="user.role === 'Admin'"
                        [class.text-purple-800]="user.role === 'Admin'"
                        [class.bg-blue-100]="user.role === 'Coordinateur'"
                        [class.text-blue-800]="user.role === 'Coordinateur'"
                        [class.bg-green-100]="user.role === 'Opérateur'"
                        [class.text-green-800]="user.role === 'Opérateur'"
                        [class.bg-gray-100]="user.role === 'Observateur'"
                        [class.text-gray-800]="user.role === 'Observateur'">
                      {{ getRoleDisplayName(user.role) }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <div class="text-sm text-gray-900">{{ user.structure || '-' }}</div>
                </td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class.bg-green-100]="user.actif"
                        [class.text-green-800]="user.actif"
                        [class.bg-red-100]="!user.actif"
                        [class.text-red-800]="!user.actif">
                    {{ user.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-4 py-4 text-right">
                  <div class="flex justify-end space-x-2">
                    <button
                      type="button"
                      (click)="openEditModal(user)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="user.actif ? confirmDeactivation(user) : confirmActivation(user)"
                      [class.text-red-600]="user.actif"
                      [class.hover:bg-red-50]="user.actif"
                      [class.text-green-600]="!user.actif"
                      [class.hover:bg-green-50]="!user.actif"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg *ngIf="user.actif" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                      </svg>
                      <svg *ngIf="!user.actif" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="confirmDelete(user)"
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

        <!-- Mobile View -->
        <div class="lg:hidden">
          <div class="divide-y divide-gray-200">
            <div *ngFor="let user of users" class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-indigo-600">
                        {{ user.prenom.charAt(0) }}{{ user.nom.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ user.prenom }} {{ user.nom }}</div>
                    <div class="text-xs text-gray-500">{{ user.login }}</div>
                  </div>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [class.bg-green-100]="user.actif"
                      [class.text-green-800]="user.actif"
                      [class.bg-red-100]="!user.actif"
                      [class.text-red-800]="!user.actif">
                  {{ user.actif ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span class="font-medium">Email:</span>
                  <div class="text-gray-900">{{ user.email }}</div>
                </div>
                <div>
                  <span class="font-medium">Rôle:</span>
                  <div class="text-gray-900">{{ getRoleDisplayName(user.role) }}</div>
                </div>
              </div>

              <div *ngIf="user.structure" class="text-sm text-gray-600 mb-3">
                <span class="font-medium">Structure:</span>
                <div class="text-gray-900">{{ user.structure }}</div>
              </div>
              
              <div class="flex justify-end space-x-2">
                <button
                  type="button"
                  (click)="openEditModal(user)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                <button
                  type="button"
                  (click)="user.actif ? confirmDeactivation(user) : confirmActivation(user)"
                  [class.text-red-600]="user.actif"
                  [class.bg-red-50]="user.actif"
                  [class.hover:bg-red-100]="user.actif"
                  [class.text-green-600]="!user.actif"
                  [class.bg-green-50]="!user.actif"
                  [class.hover:bg-green-100]="!user.actif"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg *ngIf="user.actif" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                  </svg>
                  <svg *ngIf="!user.actif" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ user.actif ? 'Désactiver' : 'Activer' }}
                </button>
                <button
                  type="button"
                  (click)="confirmDelete(user)"
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
        <div *ngIf="users.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun utilisateur trouvé</h3>
          <p class="mt-2 text-sm text-gray-500">
            Aucun utilisateur ne correspond aux critères de recherche.
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div *ngIf="isModalOpen" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="closeModal($event)">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all animate-modal-content" 
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-900">
                  {{ modalMode === 'edit' ? 'Modifier Utilisateur' : 'Nouvel Utilisateur' }}
                </h3>
                <p class="mt-1 text-sm text-gray-600">
                  {{ modalMode === 'edit' ? 'Modifiez les informations de cet utilisateur' : 'Créez un nouveau compte utilisateur' }}
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
            <app-user-form
              [user]="selectedUser"
              (save)="onUserSaved($event)"
              (cancel)="closeModal()">
            </app-user-form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteConfirm" 
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
                  Êtes-vous sûr de vouloir supprimer l'utilisateur "{{ userToDelete?.prenom }} {{ userToDelete?.nom }}" ? Cette action ne peut pas être annulée.
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
              (click)="deleteUser()"
              [disabled]="deleting"
              class="px-4 py-2 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Activation Confirmation Modal -->
    <div *ngIf="showActivationConfirm" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="cancelActivation()">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl transform transition-all max-w-md w-full animate-modal-content" 
             (click)="$event.stopPropagation()">
          <div class="px-6 py-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Confirmer l'activation</h3>
                <p class="mt-2 text-sm text-gray-600">
                  Êtes-vous sûr de vouloir activer le compte de "{{ userToActivate?.prenom }} {{ userToActivate?.nom }}" ?
                </p>
                <div class="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p class="text-xs text-green-700">
                    <strong>Effet :</strong> L'utilisateur pourra se connecter et accéder aux fonctionnalités selon son rôle {{ getRoleDisplayName(userToActivate?.role || 'Observateur') }}.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button
              type="button"
              (click)="cancelActivation()"
              class="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200">
              Annuler
            </button>
            <button
              type="button"
              (click)="activateUser()"
              [disabled]="statusChanging"
              class="px-4 py-2 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {{ statusChanging ? 'Activation...' : 'Activer le compte' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deactivation Confirmation Modal -->
    <div *ngIf="showDeactivationConfirm" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="cancelDeactivation()">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl transform transition-all max-w-md w-full animate-modal-content" 
             (click)="$event.stopPropagation()">
          <div class="px-6 py-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Confirmer la désactivation</h3>
                <p class="mt-2 text-sm text-gray-600">
                  Êtes-vous sûr de vouloir désactiver le compte de "{{ userToDeactivate?.prenom }} {{ userToDeactivate?.nom }}" ?
                </p>
                <div class="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p class="text-xs text-red-700">
                    <strong>Attention :</strong> L'utilisateur ne pourra plus se connecter jusqu'à réactivation du compte. Ses sessions actives seront maintenues.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button
              type="button"
              (click)="cancelDeactivation()"
              class="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200">
              Annuler
            </button>
            <button
              type="button"
              (click)="deactivateUser()"
              [disabled]="statusChanging"
              class="px-4 py-2 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {{ statusChanging ? 'Désactivation...' : 'Désactiver le compte' }}
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
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  stats: UserStats | null = null;
  loading = false;
  deleting = false;
  statusChanging = false;

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Modal states
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedUser: User | null = null;
  
  // Delete confirmation
  showDeleteConfirm = false;
  userToDelete: User | null = null;

  // Activation/Deactivation confirmation
  showActivationConfirm = false;
  showDeactivationConfirm = false;
  userToActivate: User | null = null;
  userToDeactivate: User | null = null;

  // Filters
  filters: any = {}; // extended to include provinces & communes dynamically

  // zone filter options
  provincesOptions: string[] = [];
  communesOptions: string[] = [];

  // floating panel states and search inputs
  showProvincePanel = false;
  showCommunePanel = false;
  provinceSearch = '';
  communeSearch = '';

  // Subscriptions
  private subs: Subscription[] = [];

  // view child refs for panels & toggles so we can detect outside clicks properly
  @ViewChild('provincePanel', { read: ElementRef }) provincePanelRef!: ElementRef;
  @ViewChild('communePanel', { read: ElementRef }) communePanelRef!: ElementRef;
  @ViewChild('provinceToggle', { read: ElementRef }) provinceToggleRef!: ElementRef;
  @ViewChild('communeToggle', { read: ElementRef }) communeToggleRef!: ElementRef;

  constructor(private userService: UserService, private zoneService: ZoneService) {}

  ngOnInit() {
    this.loadZoneOptions();
    // ensure arrays exist to avoid template errors
    if (!this.filters.provinces) this.filters.provinces = [];
    if (!this.filters.communes) this.filters.communes = [];

    this.loadUsers();
    this.loadStats();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // Host listener that only closes panels when clicking outside the related panel/toggle elements.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Province panel
    if (this.showProvincePanel) {
      const insidePanel = this.provincePanelRef?.nativeElement?.contains(target);
      const insideToggle = this.provinceToggleRef?.nativeElement?.contains(target);
      if (!insidePanel && !insideToggle) {
        this.showProvincePanel = false;
      }
    }

    // Commune panel
    if (this.showCommunePanel) {
      const insidePanel = this.communePanelRef?.nativeElement?.contains(target);
      const insideToggle = this.communeToggleRef?.nativeElement?.contains(target);
      if (!insidePanel && !insideToggle) {
        this.showCommunePanel = false;
      }
    }
  }

  private loadZoneOptions() {
    const sub = this.zoneService.getAll().subscribe({
      next: (resp) => {
        if (resp && resp.success && Array.isArray((resp as any).data)) {
          const zones = (resp as any).data;
          const provincesSet = new Set<string>();
          const communesSet = new Set<string>();
          zones.forEach((z: any) => {
            if (z.province) provincesSet.add(z.province);
            if (z.commune) communesSet.add(z.commune);
          });
          this.provincesOptions = Array.from(provincesSet).sort((a, b) => a.localeCompare(b, 'fr'));
          this.communesOptions = Array.from(communesSet).sort((a, b) => a.localeCompare(b, 'fr'));
        }
      },
      error: (err) => {
        console.warn('Unable to load zone options for filters', err);
      }
    });
    this.subs.push(sub);
  }

  // computed filtered lists for panels
  get filteredProvinces(): string[] {
    const q = (this.provinceSearch || '').trim().toLowerCase();
    if (!q) return this.provincesOptions;
    return this.provincesOptions.filter(p => p.toLowerCase().includes(q));
  }

  get filteredCommunes(): string[] {
    const q = (this.communeSearch || '').trim().toLowerCase();
    if (!q) return this.communesOptions;
    return this.communesOptions.filter(c => c.toLowerCase().includes(q));
  }

  // toggles for opening/closing panels (stop event propagation already handled in template)
  toggleProvincePanel(ev: Event) {
    ev.stopPropagation();
    this.showProvincePanel = !this.showProvincePanel;
    if (this.showProvincePanel) {
      this.showCommunePanel = false;
    }
  }

  closeProvincePanel() {
    this.showProvincePanel = false;
  }

  toggleCommunePanel(ev: Event) {
    ev.stopPropagation();
    this.showCommunePanel = !this.showCommunePanel;
    if (this.showCommunePanel) {
      this.showProvincePanel = false;
    }
  }

  closeCommunePanel() {
    this.showCommunePanel = false;
  }

  // filter selection helpers used by panels
  isFilterSelected(field: 'provinces' | 'communes', value: string): boolean {
    const arr = this.filters[field] || [];
    return arr.indexOf(value) !== -1;
  }

  toggleFilterSelection(field: 'provinces' | 'communes', value: string) {
    if (!this.filters[field]) this.filters[field] = [];
    const arr: string[] = this.filters[field];
    const idx = arr.indexOf(value);
    if (idx === -1) {
      arr.push(value);
    } else {
      arr.splice(idx, 1);
    }
    // assign back to trigger change detection
    this.filters[field] = arr.slice();
    // immediately apply filter
    this.loadUsers();
  }

  selectAllProvincesFilter() {
    this.filters.provinces = this.provincesOptions.slice();
    this.loadUsers();
  }

  clearProvincesFilter() {
    this.filters.provinces = [];
    this.loadUsers();
  }

  selectAllCommunesFilter() {
    this.filters.communes = this.communesOptions.slice();
    this.loadUsers();
  }

  clearCommunesFilter() {
    this.filters.communes = [];
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    const sub = this.userService.getAll(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data || [];
        } else {
          this.showError(response.message || 'Erreur lors du chargement des utilisateurs');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showError('Erreur lors du chargement des utilisateurs');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  loadStats() {
    const sub = this.userService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
    this.subs.push(sub);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.role ||
      this.filters.actif !== undefined ||
      (this.filters.provinces && this.filters.provinces.length) ||
      (this.filters.communes && this.filters.communes.length)
    );
  }

  clearFilters() {
    this.filters = {};
    this.filters.provinces = [];
    this.filters.communes = [];
    this.loadUsers();
    this.showSuccess('Filtres effacés avec succès');
  }

  getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      'Admin': 'Administrateur',
      'Coordinateur': 'Coordinateur',
      'Opérateur': 'Opérateur',
      'Observateur': 'Observateur'
    };
    return roleNames[role] || role;
  }

  openCreateModal() {
    this.selectedUser = null;
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(user: User) {
    this.selectedUser = { ...user };
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  closeModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.isModalOpen = false;
      this.selectedUser = null;
      this.modalMode = 'create';
    } else if (!event) {
      this.isModalOpen = false;
      this.selectedUser = null;
      this.modalMode = 'create';
    }
  }

  // Delete confirmation methods
  confirmDelete(user: User) {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.userToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteUser() {
    if (!this.userToDelete) return;

    this.deleting = true;
    const sub = this.userService.delete(this.userToDelete.id_utilisateur).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
          this.loadStats();
          this.showSuccess(`Utilisateur "${this.userToDelete!.prenom} ${this.userToDelete!.nom}" supprimé avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.showError('Erreur lors de la suppression de l\'utilisateur');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  // Activation confirmation methods
  confirmActivation(user: User) {
    this.userToActivate = user;
    this.showActivationConfirm = true;
  }

  cancelActivation() {
    this.userToActivate = null;
    this.showActivationConfirm = false;
  }

  activateUser() {
    if (!this.userToActivate) return;

    this.statusChanging = true;
    const sub = this.userService.activate(this.userToActivate.id_utilisateur).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
          this.loadStats();
          this.showSuccess(`Compte de "${this.userToActivate!.prenom} ${this.userToActivate!.nom}" activé avec succès`);
          this.cancelActivation();
        } else {
          this.showError(response.message || 'Erreur lors de l\'activation');
        }
        this.statusChanging = false;
      },
      error: (error) => {
        console.error('Error activating user:', error);
        this.showError('Erreur lors de l\'activation du compte');
        this.statusChanging = false;
      }
    });
    this.subs.push(sub);
  }

  // Deactivation confirmation methods
  confirmDeactivation(user: User) {
    this.userToDeactivate = user;
    this.showDeactivationConfirm = true;
  }

  cancelDeactivation() {
    this.userToDeactivate = null;
    this.showDeactivationConfirm = false;
  }

  deactivateUser() {
    if (!this.userToDeactivate) return;

    this.statusChanging = true;
    const sub = this.userService.deactivate(this.userToDeactivate.id_utilisateur).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
          this.loadStats();
          this.showSuccess(`Compte de "${this.userToDeactivate!.prenom} ${this.userToDeactivate!.nom}" désactivé avec succès`);
          this.cancelDeactivation();
        } else {
          this.showError(response.message || 'Erreur lors de la désactivation');
        }
        this.statusChanging = false;
      },
      error: (error) => {
        console.error('Error deactivating user:', error);
        this.showError('Erreur lors de la désactivation du compte');
        this.statusChanging = false;
      }
    });
    this.subs.push(sub);
  }

  onUserSaved(user: User) {
    this.loadUsers();
    this.loadStats();
    
    if (this.modalMode === 'create') {
      this.showSuccess(`Utilisateur "${user.prenom} ${user.nom}" créé avec succès`);
    } else {
      this.showSuccess(`Utilisateur "${user.prenom} ${user.nom}" modifié avec succès`);
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

  // utility
  trackByValue(_: number, value: string) {
    return value;
  }
}
