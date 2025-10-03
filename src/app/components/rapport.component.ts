import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RapportService, RapportFilters, ReportType } from '../services/rapport.service';
import { AccessControlService } from '../services/access-control.service';
import { Rapport, CreateRapportRequest, RapportStats } from '../models/rapport.model';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `


    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8" *ngIf="stats">
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-3 lg:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-3 h-3 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Total Rapports</div>
                <div class="text-sm lg:text-lg font-bold text-blue-600">{{ stats.total }}</div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Types Différents</div>
                <div class="text-sm lg:text-lg font-bold text-green-600">{{ getReportTypesCount() }}</div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 4v8a1 1 0 001 1h6a1 1 0 001-1v-8"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Ce Mois</div>
                <div class="text-sm lg:text-lg font-bold text-purple-600">{{ getCurrentMonthCount() }}</div>
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
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Dernier Rapport</div>
                <div class="text-sm lg:text-lg font-bold text-orange-600">{{ getLastReportTime() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Filtres</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <!-- Report Type Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Type de Rapport</label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.type_rapport"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les types</option>
                  <option *ngFor="let reportType of rapportService.getReportTypesLocal()" [value]="reportType.value">
                    {{ reportType.label }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Period Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Période</label>
              <input
                type="text"
                [(ngModel)]="filters.periode"
                (input)="onFilterChange()"
                placeholder="Ex: 2025, 2025-Q3, 2025-09"
                class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                       focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                       hover:border-gray-400">
            </div>

            <!-- Date Range Filters -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Date Début</label>
              <input
                type="date"
                [(ngModel)]="filters.date_debut"
                (change)="onFilterChange()"
                class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                       focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                       hover:border-gray-400">
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
          <p class="mt-4 text-sm text-gray-500">Chargement des rapports...</p>
        </div>
      </div>

      <!-- Reports Grid -->
      <div *ngIf="!loading" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <!-- Desktop View -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rapport</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé par</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Génération</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let rapport of rapports; trackBy: trackByRapportId" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-lg flex items-center justify-center"
                           [class]="getReportTypeColorClass(rapport.type_rapport)">
                        <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ rapportService.getReportTypeDisplayName(rapport.type_rapport) }}
                      </div>
                      <div class="text-sm text-gray-500">ID: {{ rapport.id_rapport }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getReportTypeBadgeClass(rapport.type_rapport)">
                    {{ rapport.type_rapport }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        [class]="getReportCategoryBadgeClass(rapport.type_rapport)">
                    {{ getReportCategoryLabel(rapport.type_rapport) }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ rapportService.formatPeriodForDisplay(rapport.periode) }}</div>
                  <div class="text-xs text-gray-500" *ngIf="isPeriodInFuture(rapport.periode)">
                    <span class="text-orange-600">⚠ Période future</span>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ getCreatorName(rapport) }}
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(rapport.date_generation) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(rapport.date_generation) }}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      type="button"
                      (click)="previewReport(rapport)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <div class="relative">
                      <button
                        type="button"
                        (click)="toggleDownloadMenu(rapport.id_rapport)"
                        class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </button>
                      <!-- Download Format Menu -->
                      <div *ngIf="showDownloadMenu === rapport.id_rapport" 
                           class="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div class="py-1">
                          <button
                            type="button"
                            (click)="downloadReport(rapport, 'pdf')"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            PDF
                          </button>
                          <button
                            type="button"
                            (click)="downloadReport(rapport, 'excel')"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Excel
                          </button>
                          <button
                            type="button"
                            (click)="downloadReport(rapport, 'csv')"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            CSV
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      (click)="confirmDelete(rapport)"
                      *ngIf="canDelete"
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
            <div *ngFor="let rapport of rapports; trackBy: trackByRapportId" class="p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <div class="h-10 w-10 rounded-lg flex items-center justify-center"
                         [class]="getReportTypeColorClass(rapport.type_rapport)">
                      <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-3 flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">
                      {{ rapportService.getReportTypeDisplayName(rapport.type_rapport) }}
                    </div>
                    <div class="text-xs text-gray-500">{{ formatDate(rapport.date_generation) }}</div>
                  </div>
                </div>
                <div class="flex flex-col space-y-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getReportTypeBadgeClass(rapport.type_rapport)">
                    {{ rapport.type_rapport }}
                  </span>
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                        [class]="getReportCategoryBadgeClass(rapport.type_rapport)">
                    {{ getReportCategoryLabel(rapport.type_rapport) }}
                  </span>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span class="font-medium">Période:</span>
                  <div class="text-gray-900">
                    {{ rapportService.formatPeriodForDisplay(rapport.periode) }}
                    <span class="text-orange-600 text-xs block" *ngIf="isPeriodInFuture(rapport.periode)">⚠ Période future</span>
                  </div>
                </div>
                <div>
                  <span class="font-medium">Créé par:</span>
                  <div class="text-gray-900">{{ getCreatorName(rapport) }}</div>
                </div>
              </div>
              
              <div class="flex justify-end space-x-2">
                <button
                  type="button"
                  (click)="previewReport(rapport)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-green-600 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Aperçu
                </button>
                <button
                  type="button"
                  (click)="downloadReport(rapport, 'pdf')"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  PDF
                </button>
                <button
                  type="button"
                  (click)="confirmDelete(rapport)"
                  *ngIf="canDelete"
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
        <div *ngIf="rapports.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun rapport trouvé</h3>
          <p class="mt-2 text-sm text-gray-500">
            Aucun rapport ne correspond aux critères de recherche.
          </p>
          <button
            type="button"
            (click)="openGenerateModal()"
            *ngIf="canGenerate"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Générer votre premier rapport
          </button>
        </div>
      </div>
    </div>

    <!-- Generate Report Modal -->
    <div *ngIf="showGenerateModal" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="closeGenerateModal($event)">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all animate-modal-content" 
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900">Générer un Rapport</h3>
              <button
                type="button"
                (click)="closeGenerateModal()"
                class="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Modal Body -->
          <div class="px-6 py-6">
            <form (submit)="generateReport($event)" class="space-y-4">
              <!-- Report Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type de Rapport</label>
                <select [(ngModel)]="generateData.type_rapport" name="type_rapport" required
                        (change)="onReportTypeChange()"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Sélectionner un type</option>
                  <optgroup label="Rapports Périodiques">
                    <option *ngFor="let reportType of getPeriodicReportTypes()" [value]="reportType.value">
                      {{ reportType.label }}
                    </option>
                  </optgroup>
                  <optgroup label="Rapports de Contenu">
                    <option *ngFor="let reportType of getContentReportTypes()" [value]="reportType.value">
                      {{ reportType.label }}
                    </option>
                  </optgroup>
                </select>
                <p class="mt-1 text-xs text-gray-500" *ngIf="generateData.type_rapport">
                  {{ getReportTypeDescription(generateData.type_rapport) }}
                </p>
              </div>

              <!-- Period Selection -->
              <div *ngIf="generateData.type_rapport">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Période
                  <span class="text-xs text-gray-500 ml-1">
                    ({{ rapportService.getRecommendedPeriodFormat(generateData.type_rapport) }})
                  </span>
                </label>
                <div class="relative">
                <select [(ngModel)]="generateData.periode" name="periode" required
                     class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                     <option value="">Sélectionner une période</option>

                     <!-- Current period as a highlighted choice -->
                     <optgroup label="Recommandé">
                      <option value="current" class="font-medium text-indigo-600">
                       {{ getCurrentPeriodLabel() }} — (Période actuelle)
                      </option>
                     </optgroup>

                     <!-- Dynamically-built groups: Recent months / Quarters / Semesters / Years depending on selection -->
                     <ng-container *ngFor="let group of getPeriodGroups()">
                     <optgroup [label]="group.label">
                       <option *ngFor="let p of group.options"
                        [value]="p.value"
                        [disabled]="p.disabled">
                        {{ p.label }}{{ p.disabled ? ' — Futur' : '' }}
                       </option>
                     </optgroup>
                     </ng-container>
                </select>
                </div>
                <div class="mt-1 text-xs text-gray-500" *ngIf="generateData.periode && isPeriodInFuture(generateData.periode)">
                  ⚠ Attention: Cette période est dans le futur. Les données peuvent être limitées.
                </div>
              </div>

              <!-- Period Validation -->
              <div *ngIf="generateData.type_rapport && generateData.periode" class="p-3 rounded-lg"
                   [class]="isPeriodValid() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" 
                       [class]="isPeriodValid() ? 'text-green-600' : 'text-red-600'" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path *ngIf="isPeriodValid()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    <path *ngIf="!isPeriodValid()" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  <span class="text-sm" [class]="isPeriodValid() ? 'text-green-800' : 'text-red-800'">
                    {{ getPeriodValidationMessage() }}
                  </span>
                </div>
              </div>

              <!-- Preview Button -->
              <div *ngIf="generateData.type_rapport && generateData.periode && isPeriodValid()" 
                   class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">Aperçu des données</h4>
                    <p class="text-xs text-gray-600">Prévisualiser avant génération</p>
                  </div>
                  <button
                    type="button"
                    (click)="previewReportData()"
                    [disabled]="loadingPreview"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    {{ loadingPreview ? 'Chargement...' : 'Aperçu' }}
                  </button>
                </div>
              </div>

              <!-- Preview Results -->
              <div *ngIf="previewData" class="border border-gray-200 rounded-lg p-4 bg-blue-50 text-sm">
                <h4 class="font-medium text-blue-900 mb-2">Données du rapport:</h4>
                <div class="space-y-1 text-blue-800">
                  <div *ngIf="previewData.resume">
                    <strong>Résumé:</strong>
                    <ul class="list-disc list-inside ml-4 space-y-1">
                      <li *ngFor="let item of getPreviewSummary()">{{ item }}</li>
                    </ul>
                  </div>
                  <div *ngIf="previewData.recommandations && previewData.recommandations.length > 0" class="mt-3">
                    <strong>Recommandations:</strong>
                    <ul class="list-disc list-inside ml-4 space-y-1">
                      <li *ngFor="let rec of previewData.recommandations" 
                          [class]="'text-' + getRecommendationColor(rec.priorite) + '-700'">
                        {{ rec.message }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Generation Progress -->
              <div *ngIf="generating" class="mt-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Génération en cours...</span>
                  <span>{{ generationStep }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300 animate-pulse" 
                       style="width: 60%"></div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  (click)="closeGenerateModal()"
                  [disabled]="generating"
                  class="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  Annuler
                </button>
                <button
                  type="submit"
                  [disabled]="!canGenerate || !generateData.type_rapport || !generateData.periode || !isPeriodValid() || generating"
                  class="px-4 py-2 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {{ generating ? 'Génération...' : 'Générer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div *ngIf="showPreviewModal" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/50 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="closePreviewModal($event)">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl transform transition-all animate-modal-content max-h-[90vh] overflow-hidden" 
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-gray-900">
                  Aperçu: {{ rapportService.getReportTypeDisplayName(previewingRapport?.type_rapport || '') }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ rapportService.formatPeriodForDisplay(previewingRapport?.periode || '') }} •
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-1"
                        [class]="getReportCategoryBadgeClass(previewingRapport?.type_rapport || '')">
                    {{ getReportCategoryLabel(previewingRapport?.type_rapport || '') }}
                  </span>
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="relative">
                  <button
                    type="button"
                    (click)="togglePreviewDownloadMenu()"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Télécharger
                  </button>
                  <div *ngIf="showPreviewDownloadMenu" 
                       class="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div class="py-1">
                      <button
                        type="button"
                        (click)="downloadReport(previewingRapport!, 'pdf')"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        PDF
                      </button>
                      <button
                        type="button"
                        (click)="downloadReport(previewingRapport!, 'excel')"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Excel
                      </button>
                      <button
                        type="button"
                        (click)="downloadReport(previewingRapport!, 'csv')"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        CSV
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="closePreviewModal()"
                  class="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div *ngIf="loadingPreviewData" class="flex justify-center items-center h-64">
              <div class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p class="text-sm text-gray-500">Chargement de l'aperçu...</p>
              </div>
            </div>
            
            <div *ngIf="!loadingPreviewData && previewReportContent" class="space-y-6">
              <!-- Report Summary -->
              <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6" *ngIf="previewReportContent.resume">
                <h4 class="text-xl font-semibold text-gray-900 mb-4">Résumé Exécutif</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div *ngFor="let item of getDetailedPreviewSummary()" class="text-center">
                    <div class="text-3xl font-bold text-indigo-600 mb-1">{{ item.value }}</div>
                    <div class="text-sm text-gray-600 font-medium">{{ item.label }}</div>
                  </div>
                </div>
              </div>

              <!-- Recommendations Section -->
              <div *ngIf="previewReportContent.recommandations && previewReportContent.recommandations.length > 0" 
                   class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  Recommandations
                </h4>
                <div class="space-y-2">
                  <div *ngFor="let rec of previewReportContent.recommandations" 
                       class="flex items-start p-3 rounded-lg"
                       [class]="getRecommendationBgClass(rec.priorite)">
                    <div class="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3"
                         [class]="getRecommendationDotClass(rec.priorite)"></div>
                    <div>
                      <span class="font-medium text-sm"
                            [class]="getRecommendationTextClass(rec.priorite)">
                        {{ rec.priorite.toUpperCase() }}:
                      </span>
                      <span class="text-sm text-gray-700 ml-1">{{ rec.message }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detailed Data Preview -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Actions Section -->
                <div *ngIf="previewReportContent.actions" class="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    Actions ({{ previewReportContent.actions.length }})
                  </h4>
                  <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Intitulé</th>
                          <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                          <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr *ngFor="let action of previewReportContent.actions.slice(0, 5); let i = index"
                            [class]="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                          <td class="px-3 py-2 font-medium">{{ action.intitule || action.titre }}</td>
                          <td class="px-3 py-2">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                  [class]="getStatusBadgeClass(action.statut)">
                              {{ action.statut }}
                            </span>
                          </td>
                          <td class="px-3 py-2">{{ action.province }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div *ngIf="previewReportContent.actions.length > 5" class="text-center py-3 text-sm text-gray-500 bg-gray-50 border-t">
                      ... et {{ previewReportContent.actions.length - 5 }} autres actions
                    </div>
                  </div>
                </div>

                <!-- Financial Section -->
                <div *ngIf="previewReportContent.depenses" class="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    Finances ({{ previewReportContent.depenses.length }})
                  </h4>
                  <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div class="bg-green-50 p-3 rounded">
                        <div class="font-medium text-green-900">Budget Total</div>
                        <div class="text-lg font-bold text-green-700">
                          {{ formatCurrency(previewReportContent.resume?.budget_total_prevu || 0) }}
                        </div>
                      </div>
                      <div class="bg-blue-50 p-3 rounded">
                        <div class="font-medium text-blue-900">Taux Exécution</div>
                        <div class="text-lg font-bold text-blue-700">
                          {{ (previewReportContent.resume?.taux_execution || 0).toFixed(1) }}%
                        </div>
                      </div>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="min-w-full text-xs">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-2 py-1 text-left">Désignation</th>
                            <th class="px-2 py-1 text-right">Budget</th>
                            <th class="px-2 py-1 text-right">Payé</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          <tr *ngFor="let depense of previewReportContent.depenses.slice(0, 3); let i = index"
                              [class]="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                            <td class="px-2 py-1">{{ depense.designation }}</td>
                            <td class="px-2 py-1 text-right">{{ formatCurrency(depense.budget_prevu) }}</td>
                            <td class="px-2 py-1 text-right">{{ formatCurrency(depense.montant_paye) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Indicators Section -->
                <div *ngIf="previewReportContent.indicateurs" class="bg-white border border-gray-200 rounded-lg p-4 lg:col-span-2">
                  <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    Indicateurs ({{ previewReportContent.indicateurs.length }})
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div *ngFor="let indicateur of previewReportContent.indicateurs.slice(0, 4)" 
                         class="bg-gray-50 p-3 rounded-lg">
                      <div class="font-medium text-gray-900 text-sm mb-2">{{ indicateur.nom_indicateur }}</div>
                      <div class="flex items-center justify-between">
                        <div class="text-xs text-gray-600">
                          {{ indicateur.valeur_realisee || 0 }} / {{ indicateur.valeur_cible || 0 }}
                          {{ indicateur.unite_mesure || indicateur.unite }}
                        </div>
                        <div class="text-xs font-medium"
                             [class]="getIndicatorPerformanceClass(indicateur.valeur_realisee, indicateur.valeur_cible)">
                          {{ calculateIndicatorPercentage(indicateur.valeur_realisee, indicateur.valeur_cible) }}%
                        </div>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div class="h-2 rounded-full transition-all duration-300"
						     [class]="getIndicatorProgressBarClass(indicateur.valeur_realisee, indicateur.valeur_cible)"
                             [style.width.%]="Math.min(100, calculateIndicatorPercentage(indicateur.valeur_realisee, indicateur.valeur_cible))">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                  Êtes-vous sûr de vouloir supprimer le rapport "{{ rapportService.getReportTypeDisplayName(rapportToDelete?.type_rapport || '') }} - {{ rapportToDelete?.periode }}" ? Cette action ne peut pas être annulée.
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
              (click)="deleteReport()"
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
export class RapportComponent implements OnInit, OnDestroy {
  rapports: Rapport[] = [];
  stats: any = null;
  
  loading = false;
  generating = false;
  deleting = false;
  loadingPreview = false;
  loadingPreviewData = false;

  // Filters
  filters: RapportFilters = {};

  // Generate modal
  showGenerateModal = false;
  generateData = {
    type_rapport: '',
    periode: ''
  };
  generationStep = '';
  previewData: any = null;

  // Preview modal
  showPreviewModal = false;
  previewingRapport: Rapport | null = null;
  previewReportContent: any = null;

  // Delete confirmation
  showDeleteConfirm = false;
  rapportToDelete: Rapport | null = null;

  // Download menus
  showDownloadMenu: number | null = null;
  showPreviewDownloadMenu = false;

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Permissions
  canGenerate = false;
  canDelete = false;

  // Subscriptions
  private subs: Subscription[] = [];

  constructor(
    public rapportService: RapportService,
    public accessControl: AccessControlService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadReports();
    this.loadStats();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  checkPermissions() {
    this.canGenerate = this.accessControl.canGenerateReports;
    this.canDelete = this.accessControl.canAccess('rapports', 'delete');
  }

  // Track by function for better performance
  trackByRapportId(index: number, item: Rapport): number {
    return item.id_rapport;
  }

  loadReports() {
    this.loading = true;
    const sub = this.rapportService.getAll(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.rapports = response.data || [];
        } else {
          this.showError(response.message || 'Erreur lors du chargement des rapports');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.showError('Erreur lors du chargement des rapports');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  loadStats() {
    const sub = this.rapportService.getStats().subscribe({
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

  onFilterChange() {
    this.loadReports();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.type_rapport || this.filters.periode || this.filters.date_debut);
  }

  clearFilters() {
    this.filters = {};
    this.loadReports();
    this.showSuccess('Filtres effacés avec succès');
  }

  getReportTypesCount(): number {
    return this.stats ? Object.keys(this.stats.by_type || {}).length : 0;
  }

  getCurrentMonthCount(): number {
    if (!this.stats?.by_month) return 0;
    const currentMonth = new Date().toISOString().substring(0, 7);
    return this.stats.by_month[currentMonth] || 0;
  }

  getLastReportTime(): string {
    if (!this.rapports.length) return 'Aucun';
    const lastReport = this.rapports[0]; // Already sorted by date desc
    return this.formatRelativeTime(lastReport.date_generation);
  }

  // Report type categorization methods
  getPeriodicReportTypes(): ReportType[] {
    return this.rapportService.getReportTypesLocal().filter(type => 
      ['mensuel', 'trimestriel', 'semestriel', 'annuel'].includes(type.value)
    );
  }

  getContentReportTypes(): ReportType[] {
    return this.rapportService.getReportTypesLocal().filter(type => 
      ['activite', 'financier', 'indicateurs', 'synthese'].includes(type.value)
    );
  }

  getReportCategoryLabel(reportType: string): string {
    const category = this.rapportService.getReportCategory(reportType);
    return category === 'periodic' ? 'Périodique' : 'Contenu';
  }

  getReportCategoryBadgeClass(reportType: string): string {
    const category = this.rapportService.getReportCategory(reportType);
    return category === 'periodic' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-orange-100 text-orange-800';
  }

  getReportTypeColorClass(reportType: string): string {
    const colorMap: Record<string, string> = {
      'mensuel': 'bg-blue-500',
      'trimestriel': 'bg-green-500',
      'semestriel': 'bg-purple-500',
      'annuel': 'bg-red-500',
      'activite': 'bg-indigo-500',
      'financier': 'bg-yellow-500',
      'indicateurs': 'bg-pink-500',
      'synthese': 'bg-gray-500'
    };
    return colorMap[reportType] || 'bg-gray-400';
  }

  getReportTypeBadgeClass(reportType: string): string {
    const colorMap: Record<string, string> = {
      'mensuel': 'bg-blue-100 text-blue-800',
      'trimestriel': 'bg-green-100 text-green-800',
      'semestriel': 'bg-purple-100 text-purple-800',
      'annuel': 'bg-red-100 text-red-800',
      'activite': 'bg-indigo-100 text-indigo-800',
      'financier': 'bg-yellow-100 text-yellow-800',
      'indicateurs': 'bg-pink-100 text-pink-800',
      'synthese': 'bg-gray-100 text-gray-800'
    };
    return colorMap[reportType] || 'bg-gray-100 text-gray-800';
  }

  getReportTypeDescription(reportType: string): string {
    const descriptions: Record<string, string> = {
      'mensuel': 'Rapport consolidé pour une période mensuelle avec analyse détaillée des performances',
      'trimestriel': 'Rapport trimestriel avec analyse des tendances et comparaisons',
      'semestriel': 'Bilan semestriel avec évaluation mi-parcours et recommandations',
      'annuel': 'Rapport annuel complet avec bilan global et planification future',
      'activite': 'Focus sur les actions, ouvrages et zones d\'intervention',
      'financier': 'Analyse budgétaire, dépenses et taux d\'exécution',
      'indicateurs': 'Performance des indicateurs et suivi des objectifs',
      'synthese': 'Vue d\'ensemble combinant activités, finances et indicateurs'
    };
    return descriptions[reportType] || '';
  }

  // Period management methods
  getCurrentPeriodLabel(): string {
    return this.rapportService.getCurrentPeriodSuggestion(this.generateData.type_rapport);
  }

  isPeriodInFuture(period: string): boolean {
    return this.rapportService.isPeriodInFuture(period);
  }

  isPeriodValid(): boolean {
    if (!this.generateData.type_rapport || !this.generateData.periode) return false;
    
    // Handle "current" special value
    if (this.generateData.periode === 'current') return true;
    
    const validation = this.rapportService.validatePeriod(
      this.generateData.periode, 
      this.generateData.type_rapport
    );
    return validation.valid;
  }

  getPeriodValidationMessage(): string {
    if (!this.generateData.type_rapport || !this.generateData.periode) {
      return 'Sélectionnez un type et une période';
    }
    
    if (this.generateData.periode === 'current') {
      return 'Période actuelle sélectionnée';
    }
    
    const validation = this.rapportService.validatePeriod(
      this.generateData.periode, 
      this.generateData.type_rapport
    );
    return validation.valid ? 'Format de période valide' : validation.error || 'Format invalide';
  }

  // Generate modal methods
  openGenerateModal() {
    this.showGenerateModal = true;
    this.resetGenerateForm();
  }

  closeGenerateModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.showGenerateModal = false;
      this.resetGenerateForm();
    } else if (!event) {
      this.showGenerateModal = false;
      this.resetGenerateForm();
    }
  }

  resetGenerateForm() {
    this.generateData = {
      type_rapport: '',
      periode: ''
    };
    this.previewData = null;
    this.generationStep = '';
  }

  onReportTypeChange() {
    this.generateData.periode = ''; // Reset period when type changes
    this.previewData = null;
  }

  getAvailablePeriods(): string[] {
    if (!this.generateData.type_rapport) return [];
    return this.rapportService.getPeriodOptions(this.generateData.type_rapport);
  }

  previewReportData() {
    if (!this.generateData.type_rapport || !this.generateData.periode) return;

    // Handle "current" period
    let periode = this.generateData.periode;
    if (periode === 'current') {
      periode = this.rapportService.getCurrentPeriodSuggestion(this.generateData.type_rapport);
    }

    this.loadingPreview = true;
    const sub = this.rapportService.previewReport({
      type_rapport: this.generateData.type_rapport,
      periode: periode
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.previewData = response.data;
        } else {
          this.showError(response.message || 'Erreur lors de la prévisualisation');
        }
        this.loadingPreview = false;
      },
      error: (error) => {
        console.error('Error previewing report:', error);
        this.showError('Erreur lors de la prévisualisation');
        this.loadingPreview = false;
      }
    });
    this.subs.push(sub);
  }

  getPreviewSummary(): string[] {
    if (!this.previewData?.resume) return [];
    
    const summary: string[] = [];
    const resume = this.previewData.resume;
    
    if (resume.nombre_actions !== undefined) summary.push(`${resume.nombre_actions} actions`);
    if (resume.nombre_ouvrages !== undefined) summary.push(`${resume.nombre_ouvrages} ouvrages`);
    if (resume.nombre_indicateurs !== undefined) summary.push(`${resume.nombre_indicateurs} indicateurs`);
    if (resume.nombre_depenses !== undefined) summary.push(`${resume.nombre_depenses} dépenses`);
    if (resume.budget_total_prevu !== undefined) {
      summary.push(`Budget: ${this.formatCurrency(resume.budget_total_prevu)}`);
    }
    
    return summary;
  }

  getRecommendationColor(priorite: string): string {
    const colors: Record<string, string> = {
      'critique': 'red',
      'haute': 'orange',
      'moyenne': 'yellow',
      'basse': 'blue'
    };
    return colors[priorite] || 'gray';
  }

  generateReport(event: Event) {
    event.preventDefault();
    
    if (!this.generateData.type_rapport || !this.generateData.periode) {
      this.showError('Veuillez sélectionner le type et la période');
      return;
    }

    if (!this.isPeriodValid()) {
      this.showError('Le format de période n\'est pas valide pour ce type de rapport');
      return;
    }

    // Handle "current" period
    let periode = this.generateData.periode;
    if (periode === 'current') {
      periode = this.rapportService.getCurrentPeriodSuggestion(this.generateData.type_rapport);
    }

    this.generating = true;
    this.generationStep = 'Collecte des données...';

    const sub = this.rapportService.generateReport(
      this.generateData.type_rapport,
      periode
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.generationStep = 'Génération terminée';
          this.showSuccess(`Rapport ${this.rapportService.getReportTypeDisplayName(this.generateData.type_rapport)} généré avec succès`);
          this.loadReports();
          this.loadStats();
          this.closeGenerateModal();
        } else {
          this.showError(response.message || 'Erreur lors de la génération');
        }
        this.generating = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.showError('Erreur lors de la génération du rapport');
        this.generating = false;
      }
    });
    this.subs.push(sub);
  }

  // Preview modal methods
  previewReport(rapport: Rapport) {
    this.previewingRapport = rapport;
    this.showPreviewModal = true;
    this.loadingPreviewData = true;
    this.previewReportContent = null;

    // Load report data for preview
    const sub = this.rapportService.previewReport({
      type_rapport: rapport.type_rapport,
      periode: rapport.periode
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.previewReportContent = response.data;
        } else {
          this.showError(response.message || 'Erreur lors du chargement de l\'aperçu');
        }
        this.loadingPreviewData = false;
      },
      error: (error) => {
        console.error('Error loading preview:', error);
        this.showError('Erreur lors du chargement de l\'aperçu');
        this.loadingPreviewData = false;
      }
    });
    this.subs.push(sub);
  }

  closePreviewModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.cleanupPreview();
    } else if (!event) {
      this.cleanupPreview();
    }
  }

  cleanupPreview() {
    this.showPreviewModal = false;
    this.previewingRapport = null;
    this.previewReportContent = null;
    this.loadingPreviewData = false;
    this.showPreviewDownloadMenu = false;
  }

  getDetailedPreviewSummary(): { label: string; value: string | number }[] {
    if (!this.previewReportContent?.resume) return [];
    
    const resume = this.previewReportContent.resume;
    const summary: { label: string; value: string | number }[] = [];
    
    if (resume.nombre_actions !== undefined) {
      summary.push({ label: 'Actions', value: resume.nombre_actions });
    }
    if (resume.nombre_ouvrages !== undefined) {
      summary.push({ label: 'Ouvrages', value: resume.nombre_ouvrages });
    }
    if (resume.nombre_indicateurs !== undefined) {
      summary.push({ label: 'Indicateurs', value: resume.nombre_indicateurs });
    }
    if (resume.budget_total_prevu !== undefined) {
      summary.push({ 
        label: 'Budget Total', 
        value: this.formatCurrency(resume.budget_total_prevu) 
      });
    }
    if (resume.taux_execution !== undefined) {
      summary.push({ 
        label: 'Taux Exécution', 
        value: `${resume.taux_execution.toFixed(1)}%` 
      });
    }
    if (resume.taux_atteinte_global !== undefined) {
      summary.push({ 
        label: 'Performance', 
        value: `${resume.taux_atteinte_global.toFixed(1)}%` 
      });
    }
    
    return summary;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      'Planifiée': 'bg-gray-100 text-gray-800',
      'En cours': 'bg-blue-100 text-blue-800',
      'Terminée': 'bg-green-100 text-green-800',
      'Suspendue': 'bg-yellow-100 text-yellow-800',
      'Annulée': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getRecommendationBgClass(priorite: string): string {
    const classes: Record<string, string> = {
      'critique': 'bg-red-50 border border-red-200',
      'haute': 'bg-orange-50 border border-orange-200',
      'moyenne': 'bg-yellow-50 border border-yellow-200',
      'basse': 'bg-blue-50 border border-blue-200'
    };
    return classes[priorite] || 'bg-gray-50 border border-gray-200';
  }

  getRecommendationDotClass(priorite: string): string {
    const classes: Record<string, string> = {
      'critique': 'bg-red-500',
      'haute': 'bg-orange-500',
      'moyenne': 'bg-yellow-500',
      'basse': 'bg-blue-500'
    };
    return classes[priorite] || 'bg-gray-500';
  }

  getRecommendationTextClass(priorite: string): string {
    const classes: Record<string, string> = {
      'critique': 'text-red-800',
      'haute': 'text-orange-800',
      'moyenne': 'text-yellow-800',
      'basse': 'text-blue-800'
    };
    return classes[priorite] || 'text-gray-800';
  }

  getIndicatorPerformanceClass(realized: number, target: number): string {
    const percentage = this.calculateIndicatorPercentage(realized, target);
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getIndicatorProgressBarClass(realized: number, target: number): string {
    const percentage = this.calculateIndicatorPercentage(realized, target);
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  calculateIndicatorPercentage(realized: number, target: number): number {
    if (!target || target === 0) return 0;
    return Math.round((realized / target) * 100);
  }

  // Download methods
  toggleDownloadMenu(rapportId: number) {
    this.showDownloadMenu = this.showDownloadMenu === rapportId ? null : rapportId;
  }

  togglePreviewDownloadMenu() {
    this.showPreviewDownloadMenu = !this.showPreviewDownloadMenu;
  }

  downloadReport(rapport: Rapport, format: string) {
    this.showDownloadMenu = null;
    this.showPreviewDownloadMenu = false;

    const sub = this.rapportService.download(rapport.id_rapport, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${rapport.type_rapport}_${rapport.periode}.${format === 'excel' ? 'xlsx' : format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showSuccess(`Téléchargement ${format.toUpperCase()} démarré`);
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        this.showError('Erreur lors du téléchargement');
      }
    });
    this.subs.push(sub);
  }

  // Delete confirmation methods
  confirmDelete(rapport: Rapport) {
    this.rapportToDelete = rapport;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.rapportToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteReport() {
    if (!this.rapportToDelete) return;

    this.deleting = true;
    const sub = this.rapportService.delete(this.rapportToDelete.id_rapport).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadReports();
          this.loadStats();
          this.showSuccess(`Rapport "${this.rapportService.getReportTypeDisplayName(this.rapportToDelete!.type_rapport)} - ${this.rapportToDelete!.periode}" supprimé avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Error deleting report:', error);
        this.showError('Erreur lors de la suppression du rapport');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  // Utility methods
  getCreatorName(rapport: Rapport): string {
    if (rapport.prenom_utilisateur && rapport.nom_utilisateur) {
      return `${rapport.prenom_utilisateur} ${rapport.nom_utilisateur}`;
    }
    return 'Système';
  }
  
  getPeriodGroups(): Array<{ label: string; options: Array<{ value: string; label: string; disabled: boolean }> }> {
  if (!this.generateData.type_rapport) return [];

  const groups: Array<any> = [];

  const markDisabled = (value: string) => {
    // treat "current" as not disabled
    if (value === 'current') return false;
    return this.rapportService.isPeriodInFuture(value);
  };

  // Helper to take unique values and limit results
  const uniq = (arr: string[]) => Array.from(new Set(arr));
  const take = (arr: any[], n: number) => arr.slice(0, n);

  // Source lists (reportService methods already return recent-first arrays)
  const monthlyAll = this.rapportService.getPeriodOptions('mensuel');
  const quarterlyAll = this.rapportService.getPeriodOptions('trimestriel');
  const semesterAll = this.rapportService.getPeriodOptions('semestriel');
  const yearsAll = this.rapportService.getPeriodOptions('annuel');

  // Build friendly option objects
  const toOptions = (arr: string[]) => arr.map(v => ({ value: v, label: this.rapportService.formatPeriodForDisplay(v), disabled: markDisabled(v) }));

  // For activity reports we show a compact, friendly set: current, recent months, years
  if (this.generateData.type_rapport === 'activite') {
    // Recommended / current
    groups.push({
      label: 'Recommandé',
      options: [{ value: 'current', label: `${this.getCurrentPeriodLabel()} — Période actuelle`, disabled: false }]
    });

    // Recent months (limit 12)
    const months = uniq(monthlyAll).slice(0, 12);
    if (months.length) {
      groups.push({ label: 'Mois récents', options: toOptions(months) });
    }

    // Recent years (limit 6)
    const years = uniq(yearsAll).slice(0, 6);
    if (years.length) {
      groups.push({ label: 'Années', options: toOptions(years) });
    }

    // Optional: allow quick "All-time" (as a manual input hint) — keep it as last tiny group
    groups.push({
      label: 'Autres',
      options: [
        { value: 'custom', label: 'Saisir manuellement (ex: 2024, 2024-06, 2024-Q2)', disabled: false }
      ]
    });

    return groups;
  }

  // For strictly periodic reports keep relevant groups first
  if (this.generateData.type_rapport === 'mensuel') {
    groups.push({ label: 'Recommandé', options: [{ value: 'current', label: `${this.getCurrentPeriodLabel()} — Période actuelle`, disabled: false }] });
    groups.push({ label: 'Mois récents', options: toOptions(uniq(monthlyAll).slice(0, 12)) });
    groups.push({ label: 'Années', options: toOptions(uniq(yearsAll).slice(0, 6)) });
    return groups;
  }

  if (this.generateData.type_rapport === 'trimestriel') {
    groups.push({ label: 'Recommandé', options: [{ value: 'current', label: `${this.getCurrentPeriodLabel()} — Période actuelle`, disabled: false }] });
    groups.push({ label: 'Trimestres récents', options: toOptions(uniq(quarterlyAll).slice(0, 8)) });
    groups.push({ label: 'Années', options: toOptions(uniq(yearsAll).slice(0, 6)) });
    return groups;
  }

  if (this.generateData.type_rapport === 'semestriel') {
    groups.push({ label: 'Recommandé', options: [{ value: 'current', label: `${this.getCurrentPeriodLabel()} — Période actuelle`, disabled: false }] });
    groups.push({ label: 'Semestres récents', options: toOptions(uniq(semesterAll).slice(0, 6)) });
    groups.push({ label: 'Années', options: toOptions(uniq(yearsAll).slice(0, 6)) });
    return groups;
  }

  if (this.generateData.type_rapport === 'annuel') {
    groups.push({ label: 'Années', options: toOptions(uniq(yearsAll).slice(0, 10)) });
    return groups;
  }

  // Default (other content reports): show a balanced set but limited counts
  groups.push({ label: 'Recommandé', options: [{ value: 'current', label: `${this.getCurrentPeriodLabel()} — Période actuelle`, disabled: false }] });
  groups.push({ label: 'Mois récents', options: toOptions(uniq(monthlyAll).slice(0, 8)) });
  groups.push({ label: 'Trimestres récents', options: toOptions(uniq(quarterlyAll).slice(0, 6)) });
  groups.push({ label: 'Semestres récents', options: toOptions(uniq(semesterAll).slice(0, 4)) });
  groups.push({ label: 'Années', options: toOptions(uniq(yearsAll).slice(0, 6)) });

  return groups;
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatTime(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('fr-FR');
  }

  formatRelativeTime(date: Date | string): string {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const reportDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `Il y a ${diffInWeeks}sem`;
    
    return this.formatDate(date);
  }

  formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Add Math to component for template access
  Math = Math;

  showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 6000);
  }
}