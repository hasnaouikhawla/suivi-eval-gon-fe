import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { JournalService, JournalFilters, SearchFilters, DashboardData } from '../services/journal.service';
import { UserService } from '../services/user.service';
import { JournalEntry } from '../models/journal.model';
import { User } from '../models/user.model';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `


    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Dashboard Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8" *ngIf="dashboardData">
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-3 lg:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-3 h-3 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Total Activités</div>
                <div class="text-sm lg:text-lg font-bold text-blue-600">{{ dashboardData.total_activites }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-3 lg:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 lg:w-8 lg:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-3 h-3 lg:w-5 lg:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Moyenne/Jour</div>
                <div class="text-sm lg:text-lg font-bold text-green-600">{{ dashboardData.moyenne_quotidienne }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-3 lg:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 lg:w-8 lg:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg class="w-3 h-3 lg:w-5 lg:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Utilisateurs</div>
                <div class="text-sm lg:text-lg font-bold text-purple-600">{{ getUniqueActiveUsersCount() }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-3 lg:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 lg:w-8 lg:h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg class="w-3 h-3 lg:w-5 lg:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Période</div>
                <div class="text-sm lg:text-lg font-bold text-orange-600">{{ dashboardData.periode_jours }} jours</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Recherche et Filtres</h3>
          
          <!-- Search Bar -->
          <div class="mb-4 lg:mb-6">
            <label for="search" class="block text-sm font-semibold text-gray-900 mb-2">Recherche</label>
            <div class="relative">
              <input
                type="text"
                id="search"
                [(ngModel)]="searchTerm"
                (keyup.enter)="searchActivities()"
                placeholder="Rechercher dans les activités, descriptions, utilisateurs..."
                class="block w-full px-4 py-3 pl-10 lg:pl-12 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                       focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                       hover:border-gray-400">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 lg:pl-4 pointer-events-none">
                <svg class="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <button
                type="button"
                (click)="searchActivities()"
                class="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg class="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600 hover:text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <!-- Activity Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Action</label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.activite"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option value="">Toutes les actions</option>
                  <option *ngFor="let activity of availableActivities" [value]="activity">{{ getActivityDisplayName(activity) }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Target Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Cible</label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.cible"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option value="">Toutes les cibles</option>
                  <option *ngFor="let target of availableTargets" [value]="target">{{ getTargetDisplayName(target) }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- User Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Utilisateur</label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.id_utilisateur"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option value="">Tous les utilisateurs</option>
                  <option *ngFor="let user of users" [value]="user.id_utilisateur">{{ user.prenom }} {{ user.nom }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Date Start Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Date Début</label>
              <input
                type="date"
                [(ngModel)]="filters.date_debut"
                (input)="onFilterChange()"
                class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                       focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                       hover:border-gray-400">
            </div>

            <!-- Date End Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Date Fin (incluse)</label>
              <input
                type="date"
                [(ngModel)]="filters.date_fin"
                (input)="onFilterChange()"
                [min]="filters.date_debut"
                class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                       focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                       hover:border-gray-400">
            </div>
          </div>

          <!-- Clear Filters Button -->
          <div class="mt-4 lg:mt-6 flex justify-end">
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
          <p class="mt-4 text-sm text-gray-500">Chargement des activités...</p>
        </div>
      </div>

      <!-- Journal Entries Table -->
      <div *ngIf="!loading" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <!-- Desktop View -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Heure</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cible</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <ng-container *ngFor="let entry of journalEntries; trackBy: trackByJournalId">
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDateTime(entry.date_activite) }}</div>
                    <div class="text-xs text-gray-500">{{ formatTime(entry.date_activite) }}</div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-8 w-8 flex-shrink-0">
                        <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span class="text-xs font-medium text-indigo-600">
                            {{ getUserInitials(entry) }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ getUserFullName(entry) }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [class]="getActivityBadgeClass(entry.activite)">
                      {{ getActivityDisplayName(entry.activite) }}
                    </span>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ getTargetDisplayName(entry.cible) }}</div>
                    <div class="text-xs text-gray-500" *ngIf="entry.id_cible">#{{ entry.id_cible }}</div>
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      (click)="toggleRowExpansion(entry.id_journal)"
                      class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      {{ isRowExpanded(entry.id_journal) ? 'Masquer' : 'Détails' }}
                    </button>
                  </td>
                </tr>
                <!-- Expanded Row -->
                <tr *ngIf="isRowExpanded(entry.id_journal)" class="bg-gray-50">
                  <td colspan="5" class="px-6 py-4">
                    <div class="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 class="text-sm font-semibold text-gray-900 mb-3">Détails de l'activité</h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div class="text-xs font-medium text-gray-500 mb-1">Description complète</div>
                          <div class="text-sm text-gray-900 break-words">{{ entry.description }}</div>
                        </div>
                        <div>
                          <div class="text-xs font-medium text-gray-500 mb-1">Adresse IP</div>
                          <div class="text-sm text-gray-900">{{ entry.ip_utilisateur || 'Non disponible' }}</div>
                        </div>
                        <div class="md:col-span-2">
                          <div class="text-xs font-medium text-gray-500 mb-1">Navigateur</div>
                          <div class="text-sm text-gray-900 break-words">{{ entry.navigateur || 'Non disponible' }}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>

        <!-- Mobile View -->
        <div class="lg:hidden">
          <div class="divide-y divide-gray-200">
            <ng-container *ngFor="let entry of journalEntries; trackBy: trackByJournalId">
              <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center">
                    <div class="h-8 w-8 flex-shrink-0">
                      <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span class="text-xs font-medium text-indigo-600">
                          {{ getUserInitials(entry) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ getUserFullName(entry) }}</div>
                      <div class="text-xs text-gray-500">{{ formatDateTime(entry.date_activite) }} {{ formatTime(entry.date_activite) }}</div>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getActivityBadgeClass(entry.activite)">
                      {{ getActivityDisplayName(entry.activite) }}
                  </span>
                </div>
                
                <div class="mt-2">
                  <div class="text-xs text-gray-500">
                    <span class="font-medium">Cible:</span> {{ getTargetDisplayName(entry.cible) }}
                    <span *ngIf="entry.id_cible">#{{ entry.id_cible }}</span>
                  </div>
                </div>

                <div class="mt-3 flex justify-end">
                  <button
                    type="button"
                    (click)="toggleRowExpansion(entry.id_journal)"
                    class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    {{ isRowExpanded(entry.id_journal) ? 'Masquer détails' : 'Voir détails' }}
                  </button>
                </div>

                <!-- Expanded Details for Mobile -->
                <div *ngIf="isRowExpanded(entry.id_journal)" class="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 class="text-sm font-semibold text-gray-900 mb-2">Détails</h4>
                  <div class="space-y-2">
                    <div>
                      <div class="text-xs font-medium text-gray-500">Description:</div>
                      <div class="text-sm text-gray-900 break-words">{{ entry.description }}</div>
                    </div>
                    <div>
                      <div class="text-xs font-medium text-gray-500">IP:</div>
                      <div class="text-sm text-gray-900">{{ entry.ip_utilisateur || 'Non disponible' }}</div>
                    </div>
                    <div>
                      <div class="text-xs font-medium text-gray-500">Navigateur:</div>
                      <div class="text-sm text-gray-900 break-words">{{ entry.navigateur || 'Non disponible' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="journalEntries.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucune activité trouvée</h3>
          <p class="mt-2 text-sm text-gray-500">
            Aucune entrée du journal ne correspond aux critères de recherche.
          </p>
        </div>

        <!-- Pagination -->
        <div *ngIf="journalEntries.length > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                type="button"
                (click)="previousPage()"
                [disabled]="currentPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Précédent
              </button>
              <button
                type="button"
                (click)="nextPage()"
                [disabled]="!hasMorePages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Suivant
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Affichage de <span class="font-medium">{{ getDisplayStart() }}</span> à <span class="font-medium">{{ getDisplayEnd() }}</span>
                  <span *ngIf="totalEntries"> sur <span class="font-medium">{{ totalEntries }}</span> résultats</span>
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    type="button"
                    (click)="previousPage()"
                    [disabled]="currentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {{ currentPage }}
                  </span>
                  <button
                    type="button"
                    (click)="nextPage()"
                    [disabled]="!hasMorePages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cleanup Confirmation Modal -->
    <div *ngIf="showCleanupConfirm" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="cancelCleanup()">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl transform transition-all max-w-md w-full animate-modal-content" 
             (click)="$event.stopPropagation()">
          <div class="px-6 py-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Confirmer le nettoyage</h3>
                <p class="mt-2 text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer les entrées du journal de plus de {{ cleanupRetentionDays }} jours ? Cette action est irréversible.
                </p>
                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rétention (jours)</label>
                  <input
                    type="number"
                    [(ngModel)]="cleanupRetentionDays"
                    min="30"
                    max="3650"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                </div>
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button
              type="button"
              (click)="cancelCleanup()"
              class="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200">
              Annuler
            </button>
            <button
              type="button"
              (click)="cleanupOldEntries()"
              [disabled]="cleaning"
              class="px-4 py-2 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
              {{ cleaning ? 'Nettoyage...' : 'Nettoyer' }}
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
export class JournalComponent implements OnInit, OnDestroy {
  journalEntries: JournalEntry[] = [];
  users: User[] = [];
  dashboardData: DashboardData | null = null;
  availableActivities: string[] = [];
  availableTargets: string[] = [];
  
  loading = false;
  cleaning = false;

  // Search and filters
  searchTerm = '';
  filters: JournalFilters = {
    limit: 50,
    offset: 0
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 50;
  totalEntries = 0;
  hasMorePages = false;

  // Cleanup modal
  showCleanupConfirm = false;
  cleanupRetentionDays = 365;

  // Row expansion
  expandedRows = new Set<number>();

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Subscriptions
  private subs: Subscription[] = [];

  constructor(
    private journalService: JournalService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadJournalEntries();
    this.loadUsers();
    this.loadAvailableActivities();
    this.loadAvailableTargets();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // Track by function for better performance
  trackByJournalId(index: number, item: JournalEntry): number {
    return item.id_journal;
  }
  
  getUniqueActiveUsersCount(): number {
    if (!this.dashboardData?.utilisateurs_actifs) return 0;
    return this.dashboardData.utilisateurs_actifs.length;
  }

  // Row expansion methods
  toggleRowExpansion(journalId: number) {
    if (this.expandedRows.has(journalId)) {
      this.expandedRows.delete(journalId);
    } else {
      this.expandedRows.add(journalId);
    }
  }

  isRowExpanded(journalId: number): boolean {
    return this.expandedRows.has(journalId);
  }

  loadDashboardData() {
    const sub = this.journalService.getDashboardData(7).subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardData = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
    this.subs.push(sub);
  }

  loadJournalEntries() {
    this.loading = true;
    this.filters.offset = (this.currentPage - 1) * this.itemsPerPage;
    
    const sub = this.journalService.getAll(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.journalEntries = response.data || [];
          this.hasMorePages = this.journalEntries.length === this.itemsPerPage;
          // Clear expanded rows when loading new data
          this.expandedRows.clear();
        } else {
          this.showError(response.message || 'Erreur lors du chargement du journal');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading journal entries:', error);
        this.showError('Erreur lors du chargement du journal');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  // New method to handle filter changes
  onFilterChange() {
    this.currentPage = 1; // Reset to first page when filtering
    this.loadJournalEntries();
  }

  loadUsers() {
    const sub = this.userService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
    this.subs.push(sub);
  }

  loadAvailableActivities() {
    // journal.service currently exposes getprojetsList() which returns the predefined activity codes.
    const sub = this.journalService.getprojetsList().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableActivities = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading activities:', error);
      }
    });
    this.subs.push(sub);
  }

  loadAvailableTargets() {
    const sub = this.journalService.getTargetsList().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableTargets = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading targets:', error);
      }
    });
    this.subs.push(sub);
  }

  searchActivities() {
    if (!this.searchTerm || this.searchTerm.trim().length < 2) {
      this.loadJournalEntries();
      return;
    }

    this.loading = true;
    const searchFilters: SearchFilters = {
      q: this.searchTerm.trim(),
      limit: this.itemsPerPage
    };

    if (this.filters.activite) searchFilters.activite = this.filters.activite;
    if (this.filters.cible) searchFilters.cible = this.filters.cible;
    if (this.filters.id_utilisateur) searchFilters.id_utilisateur = this.filters.id_utilisateur;

    const sub = this.journalService.searchActivities(searchFilters).subscribe({
      next: (response) => {
        if (response.success) {
          this.journalEntries = response.data || [];
          this.hasMorePages = false; // Search doesn't support pagination
          this.currentPage = 1;
          this.expandedRows.clear();
        } else {
          this.showError(response.message || 'Erreur lors de la recherche');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching activities:', error);
        this.showError('Erreur lors de la recherche');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.activite ||
      this.filters.cible ||
      this.filters.id_utilisateur ||
      this.filters.date_debut ||
      this.filters.date_fin ||
      this.searchTerm
    );
  }

  clearFilters() {
    this.filters = {
      limit: 50,
      offset: 0
    };
    this.searchTerm = '';
    this.currentPage = 1;
    this.expandedRows.clear();
    this.loadJournalEntries();
    this.showSuccess('Filtres effacés avec succès');
  }

  // Pagination methods
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadJournalEntries();
    }
  }

  nextPage() {
    if (this.hasMorePages) {
      this.currentPage++;
      this.loadJournalEntries();
    }
  }

  getDisplayStart(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.getDisplayStart() + this.journalEntries.length - 1);
  }

  // Activity and target display methods (renamed from "action" to "activity" to match model)
  getActivityDisplayName(activity: string): string {
    const activityNames: Record<string, string> = {
      'CREATE': 'Création',
      'UPDATE': 'Modification',
      'DELETE': 'Suppression',
      'VIEW': 'Consultation',
      'LOGIN': 'Connexion',
      'LOGOUT': 'Déconnexion',
      'LOGIN_FAILED': 'Connexion échouée',
      'PASSWORD_CHANGE': 'Mot de passe',
      'EXPORT': 'Export',
      'MAINTENANCE': 'Maintenance'
    };
    return activityNames[activity] || activity;
  }

  getTargetDisplayName(target: string): string {
    const targetNames: Record<string, string> = {
      'utilisateur': 'Utilisateur',
      'zone': 'Zone',
      'projet': 'Projet',
      'action': 'action',
      'indicateur': 'Indicateur',
      'suivi_indicateur': 'Suivi Indicateur',
      'plan_annuel': 'Plan Annuel',
      'suivi_budget': 'Suivi Budget',
      'document': 'Document',
      'AUTH': 'Authentification',
      'JOURNAL': 'Journal'
    };
    return targetNames[target] || target;
  }

  getActivityBadgeClass(activity: string): string {
    const classes: Record<string, string> = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'VIEW': 'bg-gray-100 text-gray-800',
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'LOGIN_FAILED': 'bg-red-100 text-red-800',
      'PASSWORD_CHANGE': 'bg-yellow-100 text-yellow-800',
      'EXPORT': 'bg-purple-100 text-purple-800',
      'MAINTENANCE': 'bg-orange-100 text-orange-800'
    };
    return classes[activity] || 'bg-gray-100 text-gray-800';
  }

  // User display methods
  getUserInitials(entry: JournalEntry): string {
    if (entry.prenom_utilisateur && entry.nom_utilisateur) {
      return entry.prenom_utilisateur.charAt(0) + entry.nom_utilisateur.charAt(0);
    }
    return 'SY'; // System
  }

  getUserFullName(entry: JournalEntry): string {
    if (entry.prenom_utilisateur && entry.nom_utilisateur) {
      return `${entry.prenom_utilisateur} ${entry.nom_utilisateur}`;
    }
    return 'Système';
  }

  // Date formatting methods
  formatDateTime(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatTime(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('fr-FR');
  }

  // Modal and action methods
  openCleanupModal() {
    this.showCleanupConfirm = true;
  }

  cancelCleanup() {
    this.showCleanupConfirm = false;
    this.cleanupRetentionDays = 365;
  }

  cleanupOldEntries() {
    this.cleaning = true;
    const sub = this.journalService.cleanOldEntries(this.cleanupRetentionDays).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess(response.message || 'Nettoyage effectué avec succès');
          this.loadJournalEntries();
          this.loadDashboardData();
          this.cancelCleanup();
        } else {
          this.showError(response.message || 'Erreur lors du nettoyage');
        }
        this.cleaning = false;
      },
      error: (error) => {
        console.error('Error during cleanup:', error);
        this.showError('Erreur lors du nettoyage');
        this.cleaning = false;
      }
    });
    this.subs.push(sub);
  }

  generateReport() {
    const sub = this.journalService.generateActivityReport({
      date_debut: this.filters.date_debut,
      date_fin: this.filters.date_fin,
      id_utilisateur: this.filters.id_utilisateur
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Rapport généré avec succès');
          // Here you could open a modal to display the report or download it
          console.log('Activity Report:', response.data);
        } else {
          this.showError(response.message || 'Erreur lors de la génération du rapport');
        }
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.showError('Erreur lors de la génération du rapport');
      }
    });
    this.subs.push(sub);
  }

  exportData() {
    const sub = this.journalService.exportJournalData('csv', {
      date_debut: this.filters.date_debut,
      date_fin: this.filters.date_fin
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess(`Export réussi: ${response.data.recordCount} entrées exportées`);
        } else {
          this.showError(response.message || 'Erreur lors de l\'export');
        }
      },
      error: (error) => {
        console.error('Error exporting data:', error);
        this.showError('Erreur lors de l\'export');
      }
    });
    this.subs.push(sub);
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