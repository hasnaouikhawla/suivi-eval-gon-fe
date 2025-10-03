import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { actionService, ProgressUpdateRequest } from '../services/action.service';
import { Action } from '../models/action.model';
import { DocumentService, UploadProgress } from '../services/document.service';
import { Document as DocumentModel } from '../models/document.model';
import { Router } from '@angular/router';

type ProgressFormModel = {
  quantite_realisee: number | null;
};

@Component({
  selector: 'app-action-progress-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white border-2 border-indigo-200 rounded-xl shadow-sm overflow-hidden">
      <!-- Form Header -->
      <div class="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-3 border-b border-indigo-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h4l3 8 4-16 3 8h4"/>
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-base font-semibold text-indigo-900">Mettre à jour le progrès</h3>
              <p class="text-xs text-indigo-700">{{ action?.type_action }}</p>
            </div>
          </div>
          <button
            type="button"
            (click)="onCancel()"
            class="rounded-lg p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            title="Fermer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" #progressForm="ngForm" class="p-4">
        <!-- Action Information Display (Compact) -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span class="font-medium text-blue-800">Projet:</span>
              <div class="text-blue-700 truncate">{{ action?.projet_titre || 'N/A' }}</div>
            </div>
            <div>
              <span class="font-medium text-blue-800">Statut:</span>
              <div class="text-blue-700">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      [class.bg-green-100]="action?.statut === 'Terminée'"
                      [class.text-green-800]="action?.statut === 'Terminée'"
                      [class.bg-blue-100]="action?.statut === 'En cours'"
                      [class.text-blue-800]="action?.statut === 'En cours'"
                      [class.bg-yellow-100]="action?.statut === 'Planifiée'"
                      [class.text-yellow-800]="action?.statut === 'Planifiée'"
                      [class.bg-gray-100]="!['Terminée', 'En cours', 'Planifiée'].includes(action?.statut || '')"
                      [class.text-gray-800]="!['Terminée', 'En cours', 'Planifiée'].includes(action?.statut || '')">
                  {{ action?.statut }}
                </span>
              </div>
            </div>
            <div>
              <span class="font-medium text-blue-800">Quantité prévue:</span>
              <div class="text-blue-700">{{ action?.quantite_prevue ?? '-' }} {{ action?.unite_mesure }}</div>
            </div>
            <div>
              <span class="font-medium text-blue-800">Quantité actuelle:</span>
              <div class="text-blue-700">{{ action?.quantite_realisee || 0 }} {{ action?.unite_mesure }}</div>
            </div>
          </div>
        </div>

        <!-- Main Form Content (Side by Side) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column: Quantité Réalisée -->
          <div>
            <label for="quantite_realisee" class="block text-sm font-semibold text-gray-900 mb-2">
              Nouvelle Quantité Réalisée
              <span class="text-red-500 ml-1">*</span>
            </label>
            <div class="relative">
              <input
                type="number"
                id="quantite_realisee"
                name="quantite_realisee"
                [(ngModel)]="formData.quantite_realisee"
                #quantiteRealisee="ngModel"
                required
                min="0"
                [max]="action?.quantite_prevue ?? null"
                step="0.01"
                class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                       placeholder-gray-400 
                       focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                       hover:border-gray-400"
                [class.border-red-300]="quantiteRealisee.invalid && quantiteRealisee.touched"
                [class.border-green-300]="quantiteRealisee.valid && quantiteRealisee.touched"
                [class.border-gray-300]="quantiteRealisee.untouched"
                [placeholder]="'Ex: ' + (action?.quantite_prevue ?? '100')">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <span class="text-sm text-gray-500">{{ action?.unite_mesure }}</span>
              </div>
            </div>
            <div *ngIf="quantiteRealisee.invalid && quantiteRealisee.touched" class="mt-1 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              La quantité réalisée est obligatoire
            </div>
            <div *ngIf="formData.quantite_realisee !== null && action?.quantite_prevue !== undefined && formData.quantite_realisee > (action?.quantite_prevue ?? 0)" 
                 class="mt-1 text-sm text-amber-600 flex items-center">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              La quantité réalisée dépasse la quantité prévue
            </div>
          </div>

          <!-- Right Column: Progress Summary -->
          <div *ngIf="action?.quantite_prevue as qp">
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              Résumé du Progrès
            </label>
            <div *ngIf="formData.quantite_realisee !== null && qp > 0" class="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-4 border border-gray-200 h-full">
              <div class="grid grid-cols-1 gap-3">
                <div class="bg-white p-3 rounded-lg border border-indigo-100">
                  <div class="text-xs font-medium text-gray-500">Taux de Réalisation</div>
                  <div class="text-xl font-bold text-indigo-600">{{ getCompletionRate() }}%</div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div class="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
                         [style.width.%]="Math.min(getCompletionRate(), 100)"></div>
                  </div>
                </div>
                <div class="bg-white p-3 rounded-lg border border-orange-100" *ngIf="qp !== undefined">
                  <div class="text-xs font-medium text-gray-500">Quantité Restante</div>
                  <div class="text-lg font-bold text-orange-600">
                    {{ Math.max(0, qp - (formData.quantite_realisee != null ? formData.quantite_realisee : 0)) }}
                  </div>
                  <div class="text-xs text-gray-500">sur {{ qp }} {{ action?.unite_mesure }} prévues</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Section (Compact) -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Existing Documents (if any) -->
          <div *ngIf="action?.id_action && (existingDocuments.length > 0 || loadingDocuments)">
            <label class="block text-sm font-medium text-gray-900 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Documents associés ({{ existingDocuments.length }})
            </label>

            <div *ngIf="loadingDocuments" class="border border-gray-200 rounded-lg p-3 text-center bg-gray-50">
              <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                <span class="text-xs text-gray-500">Chargement...</span>
              </div>
            </div>

            <div *ngIf="!loadingDocuments && existingDocuments.length > 0" class="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
              <div *ngFor="let doc of existingDocuments" 
                   class="border border-gray-200 rounded-lg p-2 bg-white hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2 flex-1 min-w-0">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-medium text-gray-900 truncate">{{ doc.nom_original }}</div>
                      <div class="text-xs text-gray-500">
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {{ documentService.getDocumentTypeDisplayName(doc.type_document) }}
                        </span>
                        <span class="mx-1">•</span>
                        <span>{{ formatDate(doc.date_upload) }}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="downloadDocument(doc)"
                    class="inline-flex items-center p-1.5 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    title="Télécharger">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div *ngIf="!loadingDocuments && existingDocuments.length === 0" class="border border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
              <svg class="mx-auto h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="mt-1 text-xs text-gray-500">Aucun document associé</p>
            </div>
          </div>

          <!-- Document Upload (Compact) -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              Document Justificatif
              <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
            </label>

            <div class="border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200"
                 [class.border-gray-300]="!isDragOver"
                 [class.hover:border-gray-400]="!isDragOver"
                 [class.border-indigo-500]="isDragOver"
                 [class.bg-indigo-50]="isDragOver"
                 [class.bg-gray-50]="!isDragOver"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)">

              <div *ngIf="!selectedFile && !uploadProgress" class="space-y-2">
                <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <div>
                  <button type="button" (click)="fileInput.click()" class="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                    Choisir un fichier
                  </button>
                  <span class="text-gray-500 text-sm"> ou glisser ici</span>
                </div>
                <p class="text-xs text-gray-500">PDF, Word, Excel, Image (max 10MB)</p>
              </div>

              <div *ngIf="selectedFile && !uploadProgress" class="space-y-2">
                <div class="flex items-center justify-center space-x-2">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <div class="text-left">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ selectedFile.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</div>
                  </div>
                </div>
                <div class="flex justify-center space-x-2">
                  <button type="button" (click)="fileInput.click()" class="text-xs text-indigo-600 hover:text-indigo-500 font-medium">Changer</button>
                  <span class="text-gray-300">|</span>
                  <button type="button" (click)="removeFile()" class="text-xs text-red-600 hover:text-red-500 font-medium">Supprimer</button>
                </div>
              </div>

              <div *ngIf="uploadProgress" class="space-y-2">
                <svg class="mx-auto h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <div>
                  <div class="text-sm font-medium text-gray-900">Téléchargement...</div>
                  <div class="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" [style.width.%]="uploadProgress.progress"></div>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{{ uploadProgress.progress }}%</div>
                </div>
              </div>
            </div>

            <!-- Hidden file input -->
            <input #fileInput type="file" class="hidden"
                   accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                   (change)="onFileSelected($event)">

            <!-- File upload error -->
            <div *ngIf="fileError" class="mt-2 text-sm text-red-600 flex items-center p-2 bg-red-50 border border-red-200 rounded-lg">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              {{ fileError }}
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 animate-fadeIn">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div class="ml-2">
              <h3 class="text-sm font-semibold text-red-800">Une erreur s'est produite</h3>
              <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-4 mt-4 border-t border-gray-200">
          <button
            type="button"
            (click)="onCancel()"
            class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white 
                   hover:bg-gray-50 hover:border-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400
                   transition-all duration-200">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Annuler
          </button>
          <button
            type="submit"
            [disabled]="!isFormValid() || saving || uploadProgress"
            class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white 
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
            [class.bg-indigo-600]="isFormValid() && !saving && !uploadProgress"
            [class.hover:bg-indigo-700]="isFormValid() && !saving && !uploadProgress"
            [class.focus:ring-2]="isFormValid() && !saving && !uploadProgress"
            [class.focus:ring-indigo-200]="isFormValid() && !saving && !uploadProgress"
            [class.focus:outline-none]="isFormValid() && !saving && !uploadProgress"
            [class.bg-gray-400]="!isFormValid() || saving || uploadProgress">
            <svg *ngIf="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg *ngIf="!saving" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span *ngIf="saving">Enregistrement...</span>
            <span *ngIf="!saving">Mettre à jour</span>
          </button>
        </div>
      </form>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    </style>
  `
})
export class ActionProgressFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() action: Action | null = null;
  @Output() save = new EventEmitter<Action>();
  @Output() cancel = new EventEmitter<void>();

  formData: ProgressFormModel = {
    quantite_realisee: null
  };

  saving = false;
  errorMessage = '';

  // Document upload properties
  selectedFile: File | null = null;
  uploadProgress: UploadProgress | null = null;
  uploadedDocumentId: number | null = null;
  isDragOver = false;
  fileError = '';

  // Existing documents properties
  existingDocuments: DocumentModel[] = [];
  loadingDocuments = false;

  // Expose Math for template
  Math = Math;

  private subs: Subscription[] = [];

  constructor(
    private actionService: actionService,
    public documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['action']) {
      this.initializeForm();
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  isFormValid(): boolean {
    return !!(
      this.formData.quantite_realisee !== null &&
      this.formData.quantite_realisee !== undefined &&
      this.formData.quantite_realisee >= 0
    );
  }

  getCompletionRate(): number {
    if (!this.action?.quantite_prevue || this.action.quantite_prevue === 0 || this.formData.quantite_realisee === null) return 0;
    // safe because we checked above
    return Math.round((this.formData.quantite_realisee! / this.action.quantite_prevue!) * 100);
  }

  private initializeForm() {
    // Reset file & docs state
    this.selectedFile = null;
    this.uploadProgress = null;
    this.uploadedDocumentId = null;
    this.fileError = '';
    this.isDragOver = false;
    this.existingDocuments = [];
    this.loadingDocuments = false;

    if (this.action) {
      this.formData = {
        quantite_realisee: this.action.quantite_realisee ?? null
      };
      // load existing documents for this action
      this.loadExistingDocuments();
    } else {
      this.formData = {
        quantite_realisee: null
      };
    }
  }

  onSubmit() {
    if (this.saving || !this.isFormValid() || !this.action) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      const payload: ProgressUpdateRequest = {
        quantite_realisee: Number(this.formData.quantite_realisee)
      };

      const sub = this.actionService.updateProgress(this.action.id_action, payload).subscribe({
        next: async (response: any) => {
          if (response.success) {
            // If there's a file to upload, upload it after updating progress (same behaviour as creation form)
            if (this.selectedFile) {
              try {
                await this.uploadDocument(this.action!.id_action);
                // Success with document upload
                this.save.emit(response.data);
              } catch (uploadError) {
                console.error('Document upload error:', uploadError);
                // Progress updated but document upload failed
                this.errorMessage = 'Progrès mis à jour mais erreur lors du téléchargement du document';
                this.save.emit(response.data);
              }
            } else {
              // Success without document
              this.save.emit(response.data);
            }
          } else {
            this.errorMessage = response.message || 'Erreur lors de la mise à jour du progrès';
          }
          this.saving = false;
        },
        error: (error: any) => {
          console.error('API error:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du progrès';
          this.saving = false;
        }
      });
      this.subs.push(sub);
    } catch (error) {
      console.error('Form submission error:', error);
      this.errorMessage = 'Erreur lors de la préparation des données';
      this.saving = false;
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  // --- Document upload handlers (same behaviour as action creation form) ---
  onFileSelected(event: any) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private handleFileSelection(file: File) {
    this.fileError = '';

    // Validate file (uses same documentService.validateFile as creation form)
    const validation = this.documentService.validateFile(file);
    if (!validation.valid) {
      this.fileError = validation.error || 'Fichier invalide';
      return;
    }

    this.selectedFile = file;
  }

  removeFile() {
    this.selectedFile = null;
    this.fileError = '';
    this.uploadProgress = null;
    this.uploadedDocumentId = null;
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  // Upload document after updating progress - same implementation as creation form (type_document = 'general')
  private uploadDocument(actionId: number): Promise<void> {
    if (!this.selectedFile) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const documentData = {
        id_entite: actionId,
        type_entite: 'action',
        type_document: 'general' // same type as creation form to ensure consistent deposit handling
      };

      this.documentService.upload(this.selectedFile!, documentData).subscribe({
        next: (event) => {
          if (event.type === 'progress') {
            this.uploadProgress = event.progress;
          } else if (event.type === 'response') {
            if (event.response.success) {
              this.uploadedDocumentId = event.response.data.id_document;
              this.uploadProgress = null;
              resolve();
            } else {
              reject(new Error(event.response.message || 'Erreur lors du téléchargement'));
            }
          }
        },
        error: (error) => {
          this.uploadProgress = null;
          reject(error);
        }
      });
    });
  }

  // Load existing documents for this action (if any)
  private loadExistingDocuments() {
    if (!this.action?.id_action) return;

    this.loadingDocuments = true;
    const sub = this.documentService.getByEntity('action', this.action.id_action).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.existingDocuments = response.data || [];
        } else {
          console.error('Error loading existing documents:', response.message);
          this.existingDocuments = [];
        }
        this.loadingDocuments = false;
      },
      error: (error) => {
        console.error('Error loading existing documents:', error);
        this.existingDocuments = [];
        this.loadingDocuments = false;
      }
    });
    this.subs.push(sub);
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
      },
      error: (error) => {
        console.error('Error downloading document:', error);
      }
    });
    this.subs.push(sub);
  }

  // Helper to format dates for document list (public so template can call it)
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR');
  }
}
