import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicateurService } from '../services/indicateur.service';
import { CadreLogiqueService } from '../services/cadre-logique.service';
import { Indicateur, CreateIndicateurRequest, IndicateurStatus } from '../models/indicateur.model';
import { CadreLogique } from '../models/cadre-logique.model';
import { DocumentService, UploadProgress } from '../services/document.service';
import { Document as DocumentModel } from '../models/document.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type FormModel = {
  nom_indicateur: string;
  cadre_logique_id: number | null;
  valeur_cible: number | null;
  valeur_realisee: number | null;
  source: string;
  statut: IndicateurStatus | null;
};

@Component({
  selector: 'app-indicateur-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #indicateurForm="ngForm" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Nom Indicateur (Required) -->
        <div class="lg:col-span-2">
          <label for="nom_indicateur" class="block text-sm font-semibold text-gray-900 mb-2">
            Nom de l'Indicateur
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="text"
              id="nom_indicateur"
              name="nom_indicateur"
              [(ngModel)]="formData.nom_indicateur"
              #nomIndicateur="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
              [class.border-red-300]="nomIndicateur.invalid && nomIndicateur.touched"
              [class.border-green-300]="nomIndicateur.valid && nomIndicateur.touched"
              [class.border-gray-300]="nomIndicateur.untouched"
              placeholder="Ex: Nombre de kilomètres de pistes rurales réhabilitées">
            <div *ngIf="nomIndicateur.valid && nomIndicateur.touched" class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="nomIndicateur.invalid && nomIndicateur.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le nom de l'indicateur est obligatoire
          </div>
        </div>

        <!-- Cadre Logique (Required dropdown) -->
        <div>
          <label for="cadre_logique_id" class="block text-sm font-semibold text-gray-900 mb-2">
            Cadre Logique
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="cadre_logique_id"
              name="cadre_logique_id"
              [(ngModel)]="formData.cadre_logique_id"
              #cadreSelect="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white">
              <option value="" disabled>Choisir un cadre logique</option>
              <option *ngFor="let cadre of cadreLogiques" [value]="cadre.id_cadre">
                {{ cadre.intitule }} ({{ cadre.niveau }})
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="cadreSelect.invalid && cadreSelect.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le cadre logique est obligatoire
          </div>
        </div>

        <!-- Source -->
        <div>
          <label for="source" class="block text-sm font-semibold text-gray-900 mb-2">
            Source
          </label>
          <div class="relative">
            <select
              id="source"
              name="source"
              [(ngModel)]="formData.source"
              class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white">
              <option value="Interne">Interne</option>
              <option value="Externe">Externe</option>
              <option value="Mixte">Mixte</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Valeur Cible (Required) -->
        <div>
          <label for="valeur_cible" class="block text-sm font-semibold text-gray-900 mb-2">
            Valeur Cible
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            id="valeur_cible"
            name="valeur_cible"
            [(ngModel)]="formData.valeur_cible"
            #valeurCible="ngModel"
            required
            min="0"
            step="0.01"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="valeurCible.invalid && valeurCible.touched"
            [class.border-green-300]="valeurCible.valid && valeurCible.touched"
            [class.border-gray-300]="valeurCible.untouched"
            placeholder="Ex: 100">
          <div *ngIf="valeurCible.invalid && valeurCible.touched" class="mt-2 text-sm text-red-600">
            La valeur cible est obligatoire
          </div>
        </div>

        <!-- Valeur Réalisée -->
        <div>
          <label for="valeur_realisee" class="block text-sm font-semibold text-gray-900 mb-2">
            Valeur Réalisée
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <input
            type="number"
            id="valeur_realisee"
            name="valeur_realisee"
            [(ngModel)]="formData.valeur_realisee"
            min="0"
            step="0.01"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            placeholder="Ex: 75">
        </div>

        <!-- Statut (Optional) -->
        <div class="lg:col-span-2">
          <label for="statut" class="block text-sm font-semibold text-gray-900 mb-2">
            Statut
            <span class="text-gray-500 text-xs ml-1">(optionnel - calculé automatiquement si non spécifié)</span>
          </label>
          <div class="relative">
            <select
              id="statut"
              name="statut"
              [(ngModel)]="formData.statut"
              class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white">
              <option value="">Calculé automatiquement selon la progression</option>
              <option value="Atteint">🟢 Atteint</option>
              <option value="Modéré">🟠 Modéré</option>
              <option value="Retard">🔴 En retard</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500">
            Si aucun statut n'est sélectionné, il sera calculé automatiquement :
            <span class="font-medium">100%+ = Atteint, 50-99% = Modéré, &lt;50% = En retard</span>
          </p>
        </div>
      </div>

      <!-- Progress Preview -->
      <div *ngIf="formData.valeur_cible && formData.valeur_realisee !== null" class="bg-gray-50 rounded-xl p-4">
        <h4 class="text-sm font-semibold text-gray-900 mb-2">Aperçu du Progrès</h4>
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <div class="bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-300"
                [class.bg-green-500]="getProgressPercentage() >= 100"
                [class.bg-blue-500]="getProgressPercentage() >= 75 && getProgressPercentage() < 100"
                [class.bg-yellow-500]="getProgressPercentage() >= 50 && getProgressPercentage() < 75"
                [class.bg-red-500]="getProgressPercentage() < 50"
                [style.width.%]="Math.min(getProgressPercentage(), 100)">
              </div>
            </div>
          </div>
          <span class="text-sm font-semibold text-gray-700">
            {{ getProgressPercentage().toFixed(1) }}%
          </span>
        </div>
        <div *ngIf="!formData.statut" class="mt-2">
          <p class="text-xs text-gray-600">
            Statut automatique: <span class="font-medium">{{ getAutoCalculatedStatus() }}</span>
          </p>
        </div>
      </div>

      <!-- Existing Documents (Edit Mode Only) -->
      <div *ngIf="isEdit && (existingDocuments.length > 0 || loadingDocuments)" class="bg-white rounded-xl p-4 border border-gray-200">
        <label class="block text-sm font-semibold text-gray-900 mb-3">Documents associés <span class="text-gray-500 text-xs ml-1">({{ existingDocuments.length }})</span></label>

        <div *ngIf="loadingDocuments" class="py-4 text-center">
          <div class="inline-flex items-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
            <span class="text-sm text-gray-500">Chargement des documents...</span>
          </div>
        </div>

        <div *ngIf="!loadingDocuments && existingDocuments.length > 0" class="space-y-3">
          <div *ngFor="let doc of existingDocuments" class="border border-gray-200 rounded-xl p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-gray-900 truncate">{{ doc.nom_original }}</div>
                  <div class="text-sm text-gray-500">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ documentService.getDocumentTypeDisplayName(doc.type_document) }}
                    </span>
                    <span class="mx-2">•</span>
                    <span>{{ formatDate(doc.date_upload) }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  *ngIf="documentService.canPreview(doc.nom_original)"
                  type="button"
                  (click)="previewDocument(doc)"
                  class="inline-flex items-center p-2 border border-transparent rounded-lg text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  title="Aperçu">
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="text-center pt-2">
            <button
              type="button"
              (click)="viewDocumentsPage()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              Voir tous les documents dans la page documents
            </button>
          </div>
        </div>

        <div *ngIf="!loadingDocuments && existingDocuments.length === 0" class="py-6 text-center text-sm text-gray-500">
          Aucun document associé à cet indicateur
        </div>
      </div>

      <!-- Document Upload (Optional) - MULTIPLE FILES -->
      <div class="lg:col-span-2">
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          Documents associés
          <span class="text-gray-500 text-xs ml-1">(optionnel - vous pouvez sélectionner plusieurs fichiers)</span>
        </label>

        <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-200"
             [class.border-indigo-500]="isDragOver"
             [class.bg-indigo-50]="isDragOver"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)">

          <div *ngIf="selectedFiles.length === 0 && !hasAnyUploadInProgress()" class="space-y-3">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <div>
              <button type="button" (click)="fileInput.click()" class="text-indigo-600 hover:text-indigo-500 font-medium">
                Choisir des fichiers
              </button>
              <span class="text-gray-500"> ou glisser-déposer ici</span>
            </div>
            <p class="text-xs text-gray-500">PDF, Word, Excel, Image (max 10MB chacun)</p>
          </div>

          <div *ngIf="selectedFiles.length > 0 && !hasAnyUploadInProgress()" class="space-y-3">
            <div class="flex items-center justify-center space-x-3">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div class="text-left w-full max-w-2xl">
                <div class="font-medium text-gray-900 mb-2">
                  Fichiers sélectionnés ({{ selectedFiles.length }})
                  <button type="button" (click)="fileInput.click()" class="ml-4 text-sm text-indigo-600 hover:text-indigo-500">Choisir des fichiers</button>
                </div>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li *ngFor="let f of selectedFiles" class="flex items-center justify-between">
                    <div class="truncate">{{ f.name }} • {{ formatFileSize(f.size) }}</div>
                    <div class="flex items-center space-x-2">
                      <button type="button" (click)="removeFile(f)" class="text-sm text-red-600 hover:text-red-500">Supprimer</button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div *ngIf="hasAnyUploadInProgress()" class="space-y-3">
            <div *ngFor="let f of selectedFiles" class="text-left max-w-2xl mx-auto">
              <div class="flex justify-between items-center text-sm mb-1">
                <div class="truncate">{{ f.name }}</div>
                <div class="text-xs text-gray-600">
                  {{ uploadProgressMap[f.name].progress || 0 }}%
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                     [style.width.%]="uploadProgressMap[f.name].progress || 0"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hidden file input (multiple) -->
        <input #fileInput type="file" class="hidden"
               multiple
               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
               (change)="onFileSelected($event)">

        <!-- File upload error -->
        <div *ngIf="fileError" class="mt-2 text-sm text-red-600 flex items-center">
          <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          {{ fileError }}
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="rounded-xl bg-red-50 border-2 border-red-200 p-4 animate-fadeIn">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-semibold text-red-800">Une erreur s'est produite</h3>
            <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0 pt-8 border-t-2 border-gray-100">
        <button
          type="button"
          (click)="onCancel()"
          class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white 
                 hover:bg-gray-50 hover:border-gray-400 
                 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400
                 active:bg-gray-100 
                 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
          Annuler
        </button>
        <button
          type="submit"
          [disabled]="!isFormValid() || saving || hasAnyUploadInProgress()"
          class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-transparent rounded-xl text-sm font-semibold text-white 
                 transition-all duration-200 ease-in-out transform
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
          [class.bg-indigo-600]="isFormValid() && !saving && !hasAnyUploadInProgress()"
          [class.hover:bg-indigo-700]="isFormValid() && !saving && !hasAnyUploadInProgress()"
          [class.focus:ring-4]="isFormValid() && !saving && !hasAnyUploadInProgress()"
          [class.focus:ring-indigo-200]="isFormValid() && !saving && !hasAnyUploadInProgress()"
          [class.focus:outline-none]="isFormValid() && !saving && !hasAnyUploadInProgress()"
          [class.bg-gray-400]="!isFormValid() || saving || hasAnyUploadInProgress()">
          <svg *ngIf="saving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span *ngIf="saving">Enregistrement...</span>
          <span *ngIf="!saving && isEdit">Mettre à jour l'indicateur</span>
          <span *ngIf="!saving && !isEdit">Créer l'indicateur</span>
        </button>
      </div>
    </form>

    <!-- Preview Modal -->
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
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

    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

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

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
      .animate-modal-overlay {
        animation: modal-overlay 0.2s ease-out;
      }
      .animate-modal-content {
        animation: modal-content 0.3s ease-out;
      }
    </style>
  `
})
export class IndicateurFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() indicateur: Indicateur | null = null;
  @Output() save = new EventEmitter<Indicateur>();
  @Output() cancel = new EventEmitter<void>();

  Math = Math; // Expose Math to template

  formData: FormModel = {
    nom_indicateur: '',
    cadre_logique_id: null,
    valeur_cible: null,
    valeur_realisee: null,
    source: 'Interne',
    statut: null
  };

  cadreLogiques: CadreLogique[] = [];
  saving = false;
  errorMessage = '';
  isEdit = false;

  // Document upload properties (support multiple files)
  selectedFiles: File[] = [];
  uploadProgressMap: { [fileName: string]: UploadProgress } = {};
  uploadedDocumentIds: number[] = [];
  isDragOver = false;
  fileError = '';

  // Existing documents properties
  existingDocuments: DocumentModel[] = [];
  loadingDocuments = false;

  // Preview modal state
  showPreviewModal = false;
  previewingDocument: DocumentModel | null = null;
  previewUrl: SafeResourceUrl | null = null;
  previewContent: string | null = null;
  loadingPreview = false;

  private subs: Subscription[] = [];

  constructor(
    private indicateurService: IndicateurService,
    private cadreLogiqueService: CadreLogiqueService,
    public documentService: DocumentService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadCadreLogiques();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['indicateur']) {
      this.initializeForm();
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.cleanupPreviewUrl();
  }

  private loadCadreLogiques() {
    this.cadreLogiqueService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.cadreLogiques = response.data || [];
        } else {
          console.warn('Unable to load cadre logiques:', response.message);
        }
      },
      error: (err) => {
        console.error('Error loading cadre logiques:', err);
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.formData.nom_indicateur &&
      this.formData.nom_indicateur.trim() &&
      this.formData.valeur_cible &&
      this.formData.valeur_cible > 0 &&
      this.formData.cadre_logique_id !== null &&
      this.formData.cadre_logique_id !== undefined
    );
  }

  getProgressPercentage(): number {
    if (this.formData.valeur_cible === null || this.formData.valeur_cible === undefined) return 0;
    if (this.formData.valeur_realisee === null || this.formData.valeur_realisee === undefined) return 0;
    if (this.formData.valeur_cible === 0) return 0;
    return (this.formData.valeur_realisee / this.formData.valeur_cible) * 100;
  }

  getAutoCalculatedStatus(): string {
    if (!this.formData.valeur_cible || this.formData.valeur_cible === 0) return 'Modéré';

    const progress = this.getProgressPercentage();

    if (progress >= 100) return 'Atteint';
    if (progress >= 50) return 'Modéré';
    return 'En retard';
  }

  private initializeForm() {
    // reset document state
    this.selectedFiles = [];
    this.uploadProgressMap = {};
    this.uploadedDocumentIds = [];
    this.fileError = '';
    this.isDragOver = false;
    this.existingDocuments = [];
    this.loadingDocuments = false;

    if (this.indicateur && this.indicateur.id_indicateur) {
      this.isEdit = true;
      this.formData = {
        nom_indicateur: this.indicateur.nom_indicateur || '',
        cadre_logique_id: this.indicateur.cadre_logique_id ?? null,
        valeur_cible: this.indicateur.valeur_cible ?? null,
        valeur_realisee: this.indicateur.valeur_realisee ?? null,
        source: this.indicateur.source || 'Interne',
        statut: this.indicateur.statut || null
      };

      // load existing documents for this indicateur
      this.loadExistingDocuments();
    } else {
      this.isEdit = false;
      this.formData = {
        nom_indicateur: '',
        cadre_logique_id: null,
        valeur_cible: null,
        valeur_realisee: null,
        source: 'Interne',
        statut: null
      };
    }
  }

  onSubmit() {
    if (this.saving || !this.isFormValid()) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      const payload: CreateIndicateurRequest = {
        nom_indicateur: this.formData.nom_indicateur.trim(),
        cadre_logique_id: Number(this.formData.cadre_logique_id),
        valeur_cible: Number(this.formData.valeur_cible),
        valeur_realisee: this.formData.valeur_realisee !== null && this.formData.valeur_realisee !== undefined
          ? Number(this.formData.valeur_realisee)
          : undefined,
        source: this.formData.source
      };

      // Only include status if user selected one
      if (this.formData.statut) {
        payload.statut = this.formData.statut;
      }

      const operation = this.isEdit && this.indicateur
        ? this.indicateurService.update(this.indicateur.id_indicateur, payload)
        : this.indicateurService.create(payload);

      const sub = operation.subscribe({
        next: async (response) => {
          if (response.success) {
            // If there are files to upload, upload them after saving the indicateur
            if (this.selectedFiles.length > 0) {
              try {
                await this.uploadDocument(response.data.id_indicateur);
                // Success with document upload
                this.save.emit(response.data);
              } catch (uploadError) {
                console.error('Document upload error:', uploadError);
                // Indicateur saved but document upload failed
                this.errorMessage = 'Indicateur enregistré mais erreur lors du téléchargement du document';
                this.save.emit(response.data);
              }
            } else {
              // Success without document
              this.save.emit(response.data);
            }
          } else {
            this.errorMessage = response.message || 'Erreur lors de l\'enregistrement';
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('API error:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de l\'enregistrement';
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

  // --- Document upload / existing documents logic ---

  // File upload handlers (multiple)
  onFileSelected(event: any) {
    const files: FileList | null = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => this.handleFileSelection(file));
    }
    // reset input value so selecting same files again triggers change
    if (event.target) event.target.value = '';
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
      Array.from(files).forEach(file => this.handleFileSelection(file));
    }
  }

  private handleFileSelection(file: File) {
    this.fileError = '';

    // Validate file
    const validation = this.documentService.validateFile(file);
    if (!validation.valid) {
      this.fileError = validation.error || 'Fichier invalide';
      return;
    }

    // Avoid duplicates (same name + size)
    const exists = this.selectedFiles.some(f => f.name === file.name && f.size === file.size);
    if (!exists) {
      this.selectedFiles.push(file);
    }
  }

  removeFile(file: File) {
    this.selectedFiles = this.selectedFiles.filter(f => !(f.name === file.name && f.size === file.size));
    delete this.uploadProgressMap[file.name];
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('fr-FR');
  }

  // Upload multiple documents after saving indicateur
  private uploadDocument(indicateurId: number): Promise<void> {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      return Promise.resolve();
    }

    return new Promise(async (resolve, reject) => {
      try {
        for (const file of this.selectedFiles) {
          // initialize progress
          this.uploadProgressMap[file.name] = { progress: 0, loaded: 0, total: 0 };
          await new Promise<void>((res, rej) => {
            const documentData = {
              id_entite: indicateurId,
              type_entite: 'indicateur',
              type_document: 'general'
            };

            const sub = this.documentService.upload(file, documentData).subscribe({
              next: (event) => {
                if (event.type === 'progress') {
                  // store per-file progress
                  this.uploadProgressMap[file.name] = event.progress;
                } else if (event.type === 'response') {
                  if (event.response.success) {
                    this.uploadedDocumentIds.push(event.response.data.id_document);
                    // clear progress entry for that file
                    delete this.uploadProgressMap[file.name];
                    res();
                  } else {
                    delete this.uploadProgressMap[file.name];
                    rej(new Error(event.response.message || 'Erreur lors du téléchargement'));
                  }
                }
              },
              error: (error) => {
                delete this.uploadProgressMap[file.name];
                rej(error);
              }
            });
            // keep track of subscription for cleanup on destroy
            this.subs.push(sub);
          });
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Helper to check if any upload is in progress
  hasAnyUploadInProgress(): boolean {
    return Object.keys(this.uploadProgressMap).length > 0;
  }

  // Load existing documents for edit mode
  private loadExistingDocuments() {
    if (!this.indicateur?.id_indicateur) return;

    this.loadingDocuments = true;
    const sub = this.documentService.getByEntity('indicateur', this.indicateur.id_indicateur).subscribe({
      next: (response) => {
        if (response.success) {
          this.existingDocuments = response.data || [];
        } else {
          console.error('Error loading existing documents:', response.message);
        }
        this.loadingDocuments = false;
      },
      error: (error) => {
        console.error('Error loading existing documents:', error);
        this.loadingDocuments = false;
      }
    });
    this.subs.push(sub);
  }

  // View documents page with filter
  viewDocumentsPage() {
    if (!this.indicateur?.id_indicateur) return;

    this.router.navigate(['/documents'], {
      queryParams: {
        type_entite: 'indicateur',
        id_entite: this.indicateur.id_indicateur
      }
    });
  }

  // Download document
  downloadDocument(doc: DocumentModel | null) {
    if (!doc) return;
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
        this.showError('Erreur lors du téléchargement');
      }
    });
    this.subs.push(sub);
  }

  // Preview document (same behavior as DocumentComponent preview modal)
  previewDocument(doc: DocumentModel) {
    if (!doc || !doc.id_document) return;
    this.previewingDocument = doc;
    this.showPreviewModal = true;
    this.loadingPreview = true;
    this.previewUrl = null;
    this.previewContent = null;

    const sub = this.documentService.getFilePreview(doc.id_document).subscribe({
      next: (blob) => {
        if (this.isTextFile(doc)) {
          const reader = new FileReader();
          reader.onload = () => {
            this.previewContent = reader.result as string;
            this.loadingPreview = false;
          };
          reader.onerror = () => {
            this.showError('Erreur lors de la lecture du fichier texte');
            this.loadingPreview = false;
          };
          reader.readAsText(blob);
        } else {
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

  // File type checks for preview (accept doc.nom_original or provided doc)
  isPdfFile(doc?: DocumentModel): boolean {
    const name = doc?.nom_original || this.previewingDocument?.nom_original;
    if (!name) return false;
    return name.toLowerCase().endsWith('.pdf');
  }

  isImageFile(doc?: DocumentModel): boolean {
    const name = doc?.nom_original || this.previewingDocument?.nom_original;
    if (!name) return false;
    const extension = name.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '');
  }

  isTextFile(doc?: DocumentModel): boolean {
    const name = doc?.nom_original || this.previewingDocument?.nom_original;
    if (!name) return false;
    return name.toLowerCase().endsWith('.txt');
  }

  // Small helper to show error messages (keeps parity with other components)
  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      if (this.errorMessage === message) {
        this.errorMessage = '';
      }
    }, 5000);
  }
}