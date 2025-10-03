import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DocumentService, DocumentFilters, DocumentStats, UploadProgress, EntityOption } from '../services/document.service';
import { AccessControlService } from '../services/access-control.service';
import { Document as DocumentModel, CreateDocumentRequest } from '../models/document.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProjetService } from '../services/projet.service';
import { actionService } from '../services/action.service';
import { IndicateurService } from '../services/indicateur.service';
import { ZoneService } from '../services/zone.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header Section -->
    <div class="bg-gray-100 shadow-none border-none">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gestion des Documents</h1>
            <p class="mt-1 text-sm text-gray-600">
              Upload, prévisualisation, téléchargement et gestion des documents du système
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              (click)="openUploadModal()"
              *ngIf="canUpload"
              class="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-indigo-600 text-xs sm:text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              Upload Document
            </button>
            <!-- 'Nettoyage' button removed as requested -->
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-100">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8" *ngIf="stats">
        <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div class="p-3 lg:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-3 h-3 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Total Documents</div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Taille Totale</div>
                <div class="text-sm lg:text-lg font-bold text-green-600">{{ stats.totalSizeMB }} MB</div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Types Entités</div>
                <div class="text-sm lg:text-lg font-bold text-purple-600">{{ getEntityTypesCount() }}</div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21a4 4 0 004-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4"/>
                  </svg>
                </div>
              </div>
              <div class="ml-3 lg:ml-5 w-0 flex-1">
                <div class="text-xs lg:text-sm font-medium text-gray-500 truncate">Types Documents</div>
                <div class="text-sm lg:text-lg font-bold text-orange-600">{{ getDocumentTypesCount() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Filtres</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <!-- Entity Type Filter -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Type d'Entité</label>
              <div class="relative">
                <select
                  [(ngModel)]="filters.type_entite"
                  (change)="onFilterChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option [ngValue]="undefined">Tous les types</option>
                  <option *ngFor="let entityType of documentService.getEntityTypes()" [value]="entityType">
                    {{ documentService.getEntityTypeDisplayName(entityType) }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Type de Document dropdown -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Type de Document</label>
              <div class="relative">
                <select
                  [(ngModel)]="selectedDocumentType"
                  (change)="onDocumentTypeChange()"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400 appearance-none bg-white">
                  <option value="">Tous les types</option>
                  <option value="general">Général</option>
                  <option value="rapport">Rapport</option>
                  <option value="contract">Contract</option>
                  <option value="facture">Facture</option>
                  <option value="plan">Plan</option>
                  <option value="photo">Photo</option>
                  <option value="etude">Etude</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
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
          <p class="mt-4 text-sm text-gray-500">Chargement des documents...</p>
        </div>
      </div>

      <!-- Documents Grid -->
      <div *ngIf="!loading" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <!-- Desktop View -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Upload</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploadé par</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let doc of documents; trackBy: trackByDocumentId" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 truncate overflow-hidden whitespace-nowrap max-w-[250px]" [title]="doc.nom_original">
                        {{ doc.nom_original }}
                      </div>
                      <div class="text-sm text-gray-500">ID: {{ doc.id_document }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ documentService.getDocumentTypeDisplayName(doc.type_document) }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ documentService.getEntityTypeDisplayName(doc.type_entite) }}</div>
                  <div class="text-xs text-gray-500">#{{ doc.id_entite }}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(doc.date_upload) }}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ doc.added_by_name || 'Système' }}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      type="button"
                      (click)="previewDocument(doc)"
                      *ngIf="documentService.canPreview(doc.nom_original)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="downloadDocument(doc)"
                      class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="confirmDelete(doc)"
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
            <div *ngFor="let doc of documents; trackBy: trackByDocumentId" class="p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <div class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-3 flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 break-words max-w-full">{{ doc.nom_original }}</div>
                    <div class="text-xs text-gray-500">{{ formatDate(doc.date_upload) }}</div>
                  </div>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ documentService.getDocumentTypeDisplayName(doc.type_document) }}
                </span>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span class="font-medium">Type Entité:</span>
                  <div class="text-gray-900">{{ documentService.getEntityTypeDisplayName(doc.type_entite) }} #{{ doc.id_entite }}</div>
                </div>
                <div>
                  <span class="font-medium">Uploadé par:</span>
                  <div class="text-gray-900">{{ doc.added_by_name || 'Système' }}</div>
                </div>
              </div>
              
              <div class="flex justify-end space-x-2">
                <button
                  type="button"
                  (click)="previewDocument(doc)"
                  *ngIf="documentService.canPreview(doc.nom_original)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-green-600 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Aperçu
                </button>
                <button
                  type="button"
                  (click)="downloadDocument(doc)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                Télécharger
                </button>
                <button
                  type="button"
                  (click)="confirmDelete(doc)"
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
        <div *ngIf="documents.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Aucun document trouvé</h3>
          <p class="mt-2 text-sm text-gray-500">
            Aucun document ne correspond aux critères de recherche.
          </p>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div *ngIf="showUploadModal" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/30 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="closeUploadModal($event)">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-modal-content" 
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900">Upload Document</h3>
              <button
                type="button"
                (click)="closeUploadModal()"
                class="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Modal Body -->
          <div class="px-6 py-6">
            <form (submit)="uploadDocument($event)" class="space-y-4">
              <!-- File Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors"
                     [class.border-indigo-400]="dragOver"
                     (dragover)="onDragOver($event)"
                     (dragleave)="onDragLeave($event)"
                     (drop)="onDrop($event)">
                  <div class="space-y-1 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="flex text-sm text-gray-600">
                      <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Choisir un fichier</span>
                        <input id="file-upload" name="file-upload" type="file" class="sr-only" 
                               (change)="onFileSelected($event)"
                               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv">
                      </label>
                      <p class="pl-1">ou glisser-déposer</p>
                    </div>
                    <p class="text-xs text-gray-500">PDF, DOC, XLS, Images, CSV jusqu'à 10MB</p>
                    <p class="text-xs text-gray-400">Le type de document sera détecté automatiquement</p>
                  </div>
                </div>
                
                <!-- Selected File Info -->
                <div *ngIf="selectedFile" class="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <span class="text-sm text-gray-900 truncate">{{ selectedFile.name }}</span>
                    </div>
                    <button type="button" (click)="removeSelectedFile()" class="text-red-500 hover:text-red-700">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ documentService.formatFileSize(selectedFile.size) }}
                  </div>
                </div>
              </div>
			  
			  <!-- Type Document (new dropdown) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type de Document</label>
                <select [(ngModel)]="uploadData.type_document" name="type_document"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="general">General</option>
                  <option value="rapport">Rapport</option>
                  <option value="contract">Contract</option>
                  <option value="facture">Facture</option>
                  <option value="plan">Plan</option>
                  <option value="photo">Photo</option>
                  <option value="etude">Etude</option>
                </select>
              </div>

              <!-- Type Entité -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type d'Entité</label>
                <select [(ngModel)]="uploadData.type_entite" name="type_entite" required
                        (change)="onEntityTypeChange()"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Sélectionner un type</option>
                  <option *ngFor="let entityType of documentService.getEntityTypes()" [value]="entityType">
                    {{ documentService.getEntityTypeDisplayName(entityType) }}
                  </option>
                </select>
              </div>

              <!-- Entity Selection -->
              <div *ngIf="uploadData.type_entite && availableEntities[uploadData.type_entite]">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ documentService.getEntityTypeDisplayName(uploadData.type_entite) }}
                </label>
                <select [(ngModel)]="uploadData.id_entite" name="id_entite" required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="0">Sélectionner {{ documentService.getEntityTypeDisplayName(uploadData.type_entite) }}</option>
                  <option *ngFor="let entity of availableEntities[uploadData.type_entite]" [value]="entity.id">
                    {{ entity.label }}
                  </option>
                </select>
              </div>

              <!-- Upload Progress -->
              <div *ngIf="uploadProgress" class="mt-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Upload en cours...</span>
                  <span>{{ uploadProgress.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                       [style.width.%]="uploadProgress.progress"></div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  (click)="closeUploadModal()"
                  [disabled]="uploading"
                  class="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  Annuler
                </button>
                <button
                  type="submit"
                  [disabled]="!selectedFile || !uploadData.type_entite || !uploadData.id_entite || uploading"
                  class="px-4 py-2 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {{ uploading ? 'Upload...' : 'Upload' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Preview Modal -->
    <div *ngIf="showPreviewModal" 
         class="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm bg-black/50 animate-modal-overlay" 
         role="dialog" 
         aria-modal="true"
         (click)="closePreviewModal($event)">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all animate-modal-content" 
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900">
                Aperçu: {{ previewingDocument?.nom_original }}
              </h3>
              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  (click)="downloadDocument(previewingDocument!)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Télécharger
                </button>
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
          <div class="p-6">
            <div class="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
              <div *ngIf="loadingPreview" class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p class="text-sm text-gray-500">Chargement de l'aperçu...</p>
              </div>
              
              <!-- PDF Preview -->
              <iframe 
                *ngIf="previewUrl && !loadingPreview && isPdfFile()"
                [src]="previewUrl" 
                class="w-full h-full rounded border-none"
                frameborder="0">
              </iframe>
              
              <!-- Image Preview -->
              <img 
                *ngIf="previewUrl && !loadingPreview && isImageFile()"
                [src]="previewUrl" 
                [alt]="previewingDocument?.nom_original || ''"
                class="max-w-full max-h-full object-contain rounded">
              
              <!-- Text Preview -->
              <pre 
                *ngIf="previewContent && !loadingPreview && isTextFile()"
                class="w-full h-full p-4 text-sm bg-white rounded border overflow-auto whitespace-pre-wrap">{{ previewContent }}</pre>
              
              <!-- Unsupported File Type -->
              <div *ngIf="!loadingPreview && !previewUrl && !previewContent" class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="mt-2 text-sm text-gray-500">
                  L'aperçu n'est pas disponible pour ce type de fichier
                </p>
                <button
                  type="button"
                  (click)="downloadDocument(previewingDocument!)"
                  class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Télécharger pour voir le contenu
                </button>
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
                  Êtes-vous sûr de vouloir supprimer le document "{{ documentToDelete?.nom_original }}" ? Cette action ne peut pas être annulée.
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
              (click)="deleteDocument()"
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
export class DocumentComponent implements OnInit, OnDestroy {
  documents: DocumentModel[] = [];
  stats: DocumentStats | null = null;
  
  loading = false;
  uploading = false;
  deleting = false;
  loadingPreview = false;

  // Filters
  filters: DocumentFilters = {};
  // new UI state for the replaced filter
  selectedDocumentType: string = '';

  // Upload modal
  showUploadModal = false;
  selectedFile: File | null = null;
  // include type_document so the modal can set it and it will be sent to the server if the service forwards it
  uploadData: Omit<CreateDocumentRequest, 'chemin_fichier' | 'nom_original'> = {
    id_entite: 0,
    type_entite: '',
    type_document: 'general'
  };
  uploadProgress: UploadProgress | null = null;
  dragOver = false;
  availableEntities: { [key: string]: EntityOption[] } = {};

  // Preview modal
  showPreviewModal = false;
  previewingDocument: DocumentModel | null = null;
  previewUrl: SafeResourceUrl | null = null;
  previewContent: string | null = null;

  // Delete confirmation
  showDeleteConfirm = false;
  documentToDelete: DocumentModel | null = null;

  // Notification messages
  successMessage = '';
  errorMessage = '';

  // Permissions
  canUpload = false;
  canDelete = false;

  // Subscriptions
  private subs: Subscription[] = [];

  constructor(
    public documentService: DocumentService,
    public accessControl: AccessControlService,
    private sanitizer: DomSanitizer,
    private projetService: ProjetService,
    private actionService: actionService,
    private indicateurService: IndicateurService,
	private zoneService: ZoneService,
	private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.loadDocuments();
    this.loadStats();
    this.loadEntityOptions();
	this.initializeFromQueryParams();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    // Clean up blob URLs
    if (this.previewUrl) {
      this.cleanupPreviewUrl();
    }
  }
  
  
  initializeFromQueryParams() {
  // Get query parameters
     const queryParams = this.route.snapshot.queryParams;
  
  // Apply filters from query parameters
     if (queryParams['type_entite']) {
        this.filters.type_entite = queryParams['type_entite'];
     }
  
     if (queryParams['id_entite']) {
        this.filters.id_entite = parseInt(queryParams['id_entite'], 10);
     }
  
     if (queryParams['type_document']) {
        this.selectedDocumentType = queryParams['type_document'];
       (this.filters as any).type_document = queryParams['type_document'];
     }
  
  // Load documents with filters applied
     this.loadDocuments();
     this.loadStats();
    }

  checkPermissions() {
    this.canUpload = this.accessControl.canUploadDocuments;
    this.canDelete = this.accessControl.canAccess('documents', 'delete');
  }

  // Track by function for better performance
  trackByDocumentId(index: number, item: DocumentModel): number {
    return item.id_document;
  }

  loadDocuments() {
    this.loading = true;
    const sub = this.documentService.getAll(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.documents = response.data || [];
        } else {
          this.showError(response.message || 'Erreur lors du chargement des documents');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.showError('Erreur lors du chargement des documents');
        this.loading = false;
      }
    });
    this.subs.push(sub);
  }

  loadStats() {
    const sub = this.documentService.getStats().subscribe({
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

    loadEntityOptions() {
    // Fetch projets, actions, indicateurs and zones
    const projets$ = this.projetService.getAll().pipe(
      map(response => response.success ? response.data : []),
      catchError(() => of([]))
    );
    
    const actions$ = this.actionService.getAll().pipe(
      map(response => response.success ? response.data : []),
      catchError(() => of([]))
    );
    
    const indicateurs$ = this.indicateurService.getAll().pipe(
      map(response => response.success ? response.data : []),
      catchError(() => of([]))
    );

    const zones$ = this.zoneService.getAll().pipe(
      map(response => response.success ? response.data : []),
      catchError(() => of([]))
    );

    // Get remaining entity types from document service
    const docOptions$ = this.documentService.getAllEntityOptions().pipe(
      catchError(() => of({}))
    );

    const sub = forkJoin([projets$, actions$, indicateurs$, docOptions$, zones$]).subscribe({
      next: ([projets, actions, indicateurs, docOptions, zones]) => {
        const entities: { [key: string]: EntityOption[] } = {};

        // Build map id_zone -> commune name (tolerant to multiple field names)
        const zonesMap: { [id: number]: string } = {};
        (zones || []).forEach((z: any) => {
          if (z && z.id_zone != null) {
            zonesMap[z.id_zone] = z.nom_commune || z.commune || z.province || '';
          }
        });

        // projets - show "commune - title"
        entities['projet'] = (projets || []).map((projet: any) => {
          const commune = projet && projet.id_zone ? (zonesMap[projet.id_zone] ? `${zonesMap[projet.id_zone]} - ` : '') : '';
          return {
            id: projet.id_projet ?? projet.id,
            label: `${commune}${projet.titre || projet.titre_projet || projet.intitule || `Projet #${projet.id_projet ?? projet.id}`}`,
            type: 'projet'
          };
        });

        // actions - show "commune - title"
        entities['action'] = (actions || []).map((action: any) => {
          const commune = action && action.id_zone ? (zonesMap[action.id_zone] ? `${zonesMap[action.id_zone]} - ` : '') : '';
          return {
            id: action.id_action ?? action.id,
            label: `${commune}${action.titre || action.libelle || action.nom || `Action #${action.id_action ?? action.id}`}`,
            type: 'action'
          };
        });

        // Try to build ouvrages from docOptions. If backend exposes ouvrages via documentService options use them, else attempt to reuse actions list as fallback.
        const ouvragesFromDocOptions = (docOptions && (docOptions as any).ouvrage) ? (docOptions as any).ouvrage : [];
        const ouvragesSource = (ouvragesFromDocOptions && ouvragesFromDocOptions.length > 0) ? ouvragesFromDocOptions : (actions || []);
        entities['ouvrage'] = (ouvragesSource || []).map((ouvrage: any) => {
          const commune = ouvrage && ouvrage.id_zone ? (zonesMap[ouvrage.id_zone] ? `${zonesMap[ouvrage.id_zone]} - ` : '') : '';
          const main = ouvrage.designation || ouvrage.type_ouvrage || ouvrage.titre || ouvrage.libelle || `Ouvrage #${ouvrage.id_ouvrage ?? ouvrage.id}`;
          return {
            id: ouvrage.id_ouvrage ?? ouvrage.id,
            label: `${commune}${main}`,
            type: 'ouvrage'
          };
        });

        // Indicateurs - keep nom_indicateur (optionally include unit if available)
        entities['indicateur'] = (indicateurs || []).map((indicateur: any) => ({
          id: indicateur.id_indicateur ?? indicateur.id,
          label: indicateur.nom_indicateur || indicateur.nom || `Indicateur #${indicateur.id_indicateur ?? indicateur.id}`,
          type: 'indicateur'
        }));

        // Add remaining entity types from document service as fallback
        Object.keys(docOptions || {}).forEach(type => {
          if (!entities[type]) {
            const options = docOptions as { [key: string]: EntityOption[] };
            const arr = options[type] || [];
            entities[type] = arr.map((opt: EntityOption) => {
              const safeLabel = (opt && opt.label) ? opt.label : `${this.documentService.getEntityTypeDisplayName(opt?.type || type)} #${opt?.id ?? ''}`;
              return { ...opt, label: safeLabel };
            });
          }
        });

        this.availableEntities = entities;
      },
      error: (error) => {
        console.error('Error loading entity options:', error);
      }
    });
    this.subs.push(sub);
  }

  onFilterChange() {
  // ensure filters object contains selectedDocumentType when set
  if (this.selectedDocumentType) {
    (this.filters as any).type_document = this.selectedDocumentType;
  } else {
    // remove key if empty
    if ((this.filters as any).type_document) {
      delete (this.filters as any).type_document;
    }
  }
  
  // Update URL query parameters
  this.updateQueryParams();
  
  this.loadDocuments();
  }
  
  
  updateQueryParams() {
  const queryParams: any = {};
  
  if (this.filters.type_entite) {
    queryParams.type_entite = this.filters.type_entite;
  }
  
  if (this.filters.id_entite) {
    queryParams.id_entite = this.filters.id_entite.toString();
  }
  
  if (this.selectedDocumentType) {
    queryParams.type_document = this.selectedDocumentType;
  }
  
  // Update URL without reloading the page
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : null,
    queryParamsHandling: 'replace'
  });
  }

  onDocumentTypeChange() {
    // called when dropdown changes
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.type_entite || this.filters.id_entite || (this.filters as any).type_document);
  }

  clearFilters() {
    this.filters = {};
    this.selectedDocumentType = '';
	
	// Clear URL query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: null,
      queryParamsHandling: 'replace'
    });
  
    this.loadDocuments();
    this.showSuccess('Filtres effacés avec succès');
  }

  getEntityTypesCount(): number {
    return this.stats && this.stats.byEntityType ? Object.keys(this.stats.byEntityType).length : 0;
  }

  getDocumentTypesCount(): number {
    return this.stats && this.stats.byDocumentType ? Object.keys(this.stats.byDocumentType).length : 0;
  }

  // Upload modal methods
  openUploadModal() {
    this.showUploadModal = true;
    this.resetUploadForm();
  }

  closeUploadModal(event?: Event) {
    if (event && event.target === event.currentTarget) {
      this.showUploadModal = false;
      this.resetUploadForm();
    } else if (!event) {
      this.showUploadModal = false;
      this.resetUploadForm();
    }
  }

  resetUploadForm() {
    this.selectedFile = null;
    this.uploadData = {
      id_entite: 0,
      type_entite: '',
      type_document: 'general'
    };
    this.uploadProgress = null;
    this.dragOver = false;
  }

  onEntityTypeChange() {
    this.uploadData.id_entite = 0; // Reset entity selection when type changes
  }

  // File selection methods
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File) {
    const validation = this.documentService.validateFile(file);
    if (!validation.valid) {
      this.showError(validation.error!);
      return;
    }
    
    this.selectedFile = file;
  }

  removeSelectedFile() {
    this.selectedFile = null;
  }

  uploadDocument(event: Event) {
    event.preventDefault();
    
    if (!this.selectedFile) {
      this.showError('Veuillez sélectionner un fichier');
      return;
    }

    this.uploading = true;
    this.uploadProgress = { progress: 0, loaded: 0, total: 0 };

    const sub = this.documentService.upload(this.selectedFile, this.uploadData).subscribe({
      next: (event) => {
        if (event.type === 'progress') {
          this.uploadProgress = event.progress;
        } else if (event.type === 'response') {
          if (event.response.success) {
            this.showSuccess('Document uploadé avec succès');
            this.loadDocuments();
            this.loadStats();
            this.closeUploadModal();
          }   else {
            this.showError(event.response.message || 'Erreur lors de l\'upload');
          }
          this.uploading = false;
        }
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.showError('Erreur lors de l\'upload du document');
        this.uploading = false;
      }
    });
    this.subs.push(sub);
  }

  // Preview methods
  previewDocument(doc: DocumentModel) {
    this.previewingDocument = doc;
    this.showPreviewModal = true;
    this.loadingPreview = true;
    this.previewUrl = null;
    this.previewContent = null;

    const sub = this.documentService.getFilePreview(doc.id_document).subscribe({
      next: (blob) => {
        if (this.isTextFile()) {
          // For text files, convert blob to text
          const reader = new FileReader();
          reader.onload = () => {
            this.previewContent = reader.result as string;
            this.loadingPreview = false;
          };
          reader.readAsText(blob);
        } else {
          // For other files, create object URL
          const url = window.URL.createObjectURL(blob);
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
               this.loadingPreview = false;
        }
      },
      error: (error) => {
        console.error('Error loading preview:', error);
        this.showError('Erreur lors du chargement de l\'aperçu');
        this.loadingPreview = false;
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
    this.previewingDocument = null;
    this.loadingPreview = false;
    this.previewContent = null;
    this.cleanupPreviewUrl();
  }

  cleanupPreviewUrl() {
    if (this.previewUrl) {
      const url = (this.previewUrl as any).changingThisBreaksApplicationSecurity;
      if (url && url.startsWith('blob:')) {
        window.URL.revokeObjectURL(url);
      }
      this.previewUrl = null;
    }
  }

  // File type check methods - now using current previewing document
  isPdfFile(): boolean {
    if (!this.previewingDocument?.nom_original) return false;
    return this.previewingDocument.nom_original.toLowerCase().endsWith('.pdf');
  }

  isImageFile(): boolean {
    if (!this.previewingDocument?.nom_original) return false;
    const extension = this.previewingDocument.nom_original.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '');
  }

  isTextFile(): boolean {
    if (!this.previewingDocument?.nom_original) return false;
    return this.previewingDocument.nom_original.toLowerCase().endsWith('.txt');
  }

  // Download document
  downloadDocument(doc: DocumentModel) {
    const sub = this.documentService.download(doc.id_document).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = doc.nom_original;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showSuccess('Téléchargement démarré');
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.showError('Erreur lors du téléchargement');
      }
    });
    this.subs.push(sub);
  }

  // Delete confirmation methods
  confirmDelete(doc: DocumentModel) {
    this.documentToDelete = doc;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.documentToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteDocument() {
    if (!this.documentToDelete) return;

    this.deleting = true;
    const sub = this.documentService.delete(this.documentToDelete.id_document).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDocuments();
          this.loadStats();
          this.showSuccess(`Document "${this.documentToDelete!.nom_original}" supprimé avec succès`);
          this.cancelDelete();
        } else {
          this.showError(response.message || 'Erreur lors de la suppression');
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Error deleting document:', error);
        this.showError('Erreur lors de la suppression du document');
        this.deleting = false;
      }
    });
    this.subs.push(sub);
  }

  // Utility methods
  formatDate(date?: Date | string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
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