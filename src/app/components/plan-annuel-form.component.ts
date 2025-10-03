import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanAnnuelService } from '../services/plan-annuel.service';
import { ProjetService } from '../services/projet.service';
import { PlanAnnuel, CreatePlanAnnuelRequest } from '../models/plan-annuel.model';
import { Projet } from '../models/projet.model';
import { DocumentService, UploadProgress } from '../services/document.service';
import { Document as DocumentModel } from '../models/document.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

type FormModel = {
  intitule: string;
  id_projets: number[];
  annee: number | null;
  responsable_id: number | null;
  echeance_debut: string;
  echeance_fin: string;
  observations: string;
};

@Component({
  selector: 'app-plan-annuel-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #planForm="ngForm" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Intitulé (Required) - First field -->
        <div class="lg:col-span-2">
          <label for="intitule" class="block text-sm font-semibold text-gray-900 mb-2">
            Intitulé du plan
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="text"
              id="intitule"
              name="intitule"
              [(ngModel)]="formData.intitule"
              #intitule="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
              [class.border-red-300]="intitule.invalid && intitule.touched"
              [class.border-green-300]="intitule.valid && intitule.touched"
              [class.border-gray-300]="intitule.untouched"
              placeholder="Entrez l'intitulé du plan annuel...">
            <div *ngIf="intitule.valid && intitule.touched" class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="intitule.invalid && intitule.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            L'intitulé est obligatoire
          </div>
        </div>

        <!-- projets Selection (Required) -->
        <div class="lg:col-span-2">
          <label for="id_projets" class="block text-sm font-semibold text-gray-900 mb-2">
            Actions
            <span class="text-red-500 ml-1">*</span>
          </label>
          
          <!-- Actions Selection Container -->
          <div class="border-2 border-gray-300 rounded-xl p-4 space-y-3 max-h-64 overflow-y-auto"
               [class.border-red-300]="(!formData.id_projets || formData.id_projets.length === 0) && projetsMulti.touched"
               [class.border-green-300]="formData.id_projets && formData.id_projets.length > 0 && projetsMulti.touched"
               [class.border-gray-300]="projetsMulti.untouched">
            
            <div class="text-sm text-gray-600 mb-3">
              Sélectionnez une ou plusieurs actions pour ce plan ({{ formData.id_projets.length || 0 }} sélectionnée(s))
            </div>
            
            <!-- Search input for actions -->
            <div class="relative mb-3">
              <input
                type="text"
                [(ngModel)]="projetsSearchTerm"
                name="projetsSearch"
                placeholder="Rechercher une action..."
                class="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>
            
            <!-- actions checkboxes -->
            <div class="space-y-2" *ngIf="getFilteredProjets().length > 0; else noprojets">
              <div *ngFor="let projet of getFilteredProjets()" 
                   class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  [id]="'projet_' + projet.id_projet"
                  [value]="projet.id_projet"
                  [checked]="isProjetSelected(projet.id_projet)"
                  (change)="onProjetToggle(projet.id_projet, $event)"
                  class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label [for]="'projet_' + projet.id_projet" class="flex-1 cursor-pointer">
                  <div class="text-sm font-medium text-gray-900">{{ projet.titre }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    <span>Zone: {{ projet.commune || 'Zone ' + projet.id_zone }}</span>
                    <span class="mx-2">•</span>
                    <span [class]="getProjetStatusClass(projet.statut)"
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full">
                      {{ projet.statut }}
                    </span>
                  </div>
                  <div *ngIf="projet.observations" class="text-xs text-gray-500 mt-1">
                    {{ projet.observations | slice:0:80 }}{{ projet.observations && projet.observations.length > 80 ? '...' : '' }}
                  </div>
                </label>
              </div>
            </div>
            
            <ng-template #noprojets>
              <div class="text-center py-4 text-gray-500">
                <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <div class="text-sm">Aucune projet trouvée</div>
              </div>
            </ng-template>
          </div>
          
          <!-- Hidden field for form validation -->
          <input type="hidden" 
                 name="projetsMulti" 
                 #projetsMulti="ngModel"
                 [ngModel]="(formData.id_projets && formData.id_projets.length > 0) ? 'valid' : ''"
                 required>
          
          <div *ngIf="(!formData.id_projets || formData.id_projets.length === 0) && projetsMulti.touched" 
               class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Sélectionnez au moins une projet
          </div>
        </div>

        <!-- Année (Required) -->
        <div>
          <label for="annee" class="block text-sm font-semibold text-gray-900 mb-2">
            Année
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="annee"
              name="annee"
              [(ngModel)]="formData.annee"
              #anneeField="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="anneeField.invalid && anneeField.touched"
              [class.border-green-300]="anneeField.valid && anneeField.touched"
              [class.border-gray-300]="anneeField.untouched">
              <option [ngValue]="null">Sélectionner une année...</option>
              <option *ngFor="let year of availableYears" [ngValue]="year">{{ year }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="anneeField.invalid && anneeField.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            L'année est obligatoire
          </div>
        </div>

        <!-- Responsable (Required) -->
        <div>
          <label for="responsable_id" class="block text-sm font-semibold text-gray-900 mb-2">
            Responsable
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="responsable_id"
              name="responsable_id"
              [(ngModel)]="formData.responsable_id"
              #responsableField="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="responsableField.invalid && responsableField.touched"
              [class.border-green-300]="responsableField.valid && responsableField.touched"
              [class.border-gray-300]="responsableField.untouched">
              <option [ngValue]="null">Sélectionner un responsable...</option>
              <option *ngFor="let user of users" [ngValue]="user.id_utilisateur">
                {{ getUserDisplay(user) }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="responsableField.invalid && responsableField.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le responsable est obligatoire
          </div>
        </div>

        <!-- Échéance Début (Required) -->
        <div>
          <label for="echeance_debut" class="block text-sm font-semibold text-gray-900 mb-2">
            Date de début
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="date"
              id="echeance_debut"
              name="echeance_debut"
              [(ngModel)]="formData.echeance_debut"
              #echeanceDebutField="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400"
              [class.border-red-300]="echeanceDebutField.invalid && echeanceDebutField.touched"
              [class.border-green-300]="echeanceDebutField.valid && echeanceDebutField.touched"
              [class.border-gray-300]="echeanceDebutField.untouched">
            <div *ngIf="echeanceDebutField.valid && echeanceDebutField.touched" class="absolute inset-y-0 right-8 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="echeanceDebutField.invalid && echeanceDebutField.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            La date de début est obligatoire
          </div>
        </div>

        <!-- Échéance Fin (Required) -->
        <div>
          <label for="echeance_fin" class="block text-sm font-semibold text-gray-900 mb-2">
            Date de fin
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="date"
              id="echeance_fin"
              name="echeance_fin"
              [(ngModel)]="formData.echeance_fin"
              #echeanceFinField="ngModel"
              required
              [min]="formData.echeance_debut"
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400"
              [class.border-red-300]="echeanceFinField.invalid && echeanceFinField.touched"
              [class.border-green-300]="echeanceFinField.valid && echeanceFinField.touched"
              [class.border-gray-300]="echeanceFinField.untouched">
            <div *ngIf="echeanceFinField.valid && echeanceFinField.touched" class="absolute inset-y-0 right-8 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="echeanceFinField.invalid && echeanceFinField.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            La date de fin est obligatoire et doit être après la date de début
          </div>
        </div>

        <!-- Observations (Optional) -->
        <div class="lg:col-span-2">
          <label for="observations" class="block text-sm font-semibold text-gray-900 mb-2">
            Observations
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <div class="relative">
            <textarea
              id="observations"
              name="observations"
              [(ngModel)]="formData.observations"
              rows="4"
              class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 resize-none
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
              placeholder="Ajoutez des observations, notes ou commentaires sur ce plan..."></textarea>
          </div>
        </div>

        <!-- Existing Documents (Edit Mode Only) -->
        <div *ngIf="isEdit && (existingDocuments.length > 0 || loadingDocuments)" class="lg:col-span-2">
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Documents associés
            <span class="text-gray-500 text-xs ml-1">({{ existingDocuments.length }})</span>
          </label>

          <!-- Loading state -->
          <div *ngIf="loadingDocuments" class="border border-gray-200 rounded-xl p-4 text-center">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
              <span class="text-sm text-gray-500">Chargement des documents...</span>
            </div>
          </div>

          <!-- Documents list -->
          <div *ngIf="!loadingDocuments && existingDocuments.length > 0" class="space-y-3">
            <div *ngFor="let doc of existingDocuments" 
                 class="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
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
                    type="button"
                    (click)="downloadDocument(doc)"
                    class="inline-flex items-center p-2 border border-transparent rounded-lg text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- View all documents button -->
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

          <!-- No documents message -->
          <div *ngIf="!loadingDocuments && existingDocuments.length === 0" class="border border-gray-200 rounded-xl p-6 text-center bg-gray-50">
            <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="mt-2 text-sm text-gray-500">Aucun document associé à ce plan</p>
          </div>
        </div>

        <!-- Document Upload (Optional) -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Document associé
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>

          <!-- File Upload Area -->
          <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-200"
               [class.border-indigo-500]="isDragOver"
               [class.bg-indigo-50]="isDragOver"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)">

            <!-- No file selected state -->
            <div *ngIf="!selectedFile && !uploadProgress" class="space-y-3">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <div>
                <button type="button" 
                        (click)="fileInput.click()"
                        class="text-indigo-600 hover:text-indigo-500 font-medium">
                  Choisir un fichier
                </button>
                <span class="text-gray-500"> ou glisser-déposer ici</span>
              </div>
              <p class="text-xs text-gray-500">PDF, Word, Excel, Image (max 10MB)</p>
            </div>

            <!-- File selected state -->
            <div *ngIf="selectedFile && !uploadProgress" class="space-y-3">
              <div class="flex items-center justify-center space-x-3">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <div class="text-left">
                  <div class="font-medium text-gray-900">{{ selectedFile.name }}</div>
                  <div class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</div>
                </div>
              </div>
              <div class="flex justify-center space-x-2">
                <button type="button" 
                        (click)="fileInput.click()"
                        class="text-sm text-indigo-600 hover:text-indigo-500">
                  Changer
                </button>
                <span class="text-gray-300">|</span>
                <button type="button" 
                        (click)="removeFile()"
                        class="text-sm text-red-600 hover:text-red-500">
                  Supprimer
                </button>
              </div>
            </div>

            <!-- Upload progress state -->
            <div *ngIf="uploadProgress" class="space-y-3">
              <svg class="mx-auto h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <div>
                <div class="text-sm font-medium text-gray-900">Téléchargement en cours...</div>
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                       [style.width.%]="uploadProgress.progress"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">{{ uploadProgress.progress }}%</div>
              </div>
            </div>
          </div>

          <!-- Hidden file input -->
          <input #fileInput
                 type="file"
                 class="hidden"
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
      </div>

      <!-- Planning Summary -->
      <div *ngIf="formData.echeance_debut && formData.echeance_fin && formData.annee && formData.responsable_id" 
           class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          Résumé du Plan
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
            <div class="text-sm font-medium text-gray-500">Année</div>
            <div class="text-xl font-bold text-indigo-600">{{ formData.annee }}</div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
            <div class="text-sm font-medium text-gray-500">projets</div>
            <div class="text-xl font-bold text-blue-600">{{ formData.id_projets.length || 0 }}</div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
            <div class="text-sm font-medium text-gray-500">Durée</div>
            <div class="text-xl font-bold text-purple-600">{{ getPlanDuration() }} jours</div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
            <div class="text-sm font-medium text-gray-500">Responsable</div>
            <div class="text-sm font-bold text-green-600 truncate">{{ getResponsableDisplay() }}</div>
          </div>
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

      <!-- Form projets -->
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
          [disabled]="!isFormValid() || saving || uploadProgress"
          class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-transparent rounded-xl text-sm font-semibold text-white 
                 transition-all duration-200 ease-in-out transform
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
          [class.bg-indigo-600]="isFormValid() && !saving && !uploadProgress"
          [class.hover:bg-indigo-700]="isFormValid() && !saving && !uploadProgress"
          [class.focus:ring-4]="isFormValid() && !saving && !uploadProgress"
          [class.focus:ring-indigo-200]="isFormValid() && !saving && !uploadProgress"
          [class.focus:outline-none]="isFormValid() && !saving && !uploadProgress"
          [class.bg-gray-400]="!isFormValid() || saving || uploadProgress">
          <svg *ngIf="saving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span *ngIf="saving">Enregistrement...</span>
          <span *ngIf="!saving && isEdit">Mettre à jour le plan</span>
          <span *ngIf="!saving && !isEdit">Créer le plan</span>
        </button>
      </div>
    </form>

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
export class PlanAnnuelFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() planAnnuel: PlanAnnuel | null = null;
  @Output() save = new EventEmitter<PlanAnnuel>();
  @Output() cancel = new EventEmitter<void>();

  formData: FormModel = {
    intitule: '',
    id_projets: [],
    annee: null,
    responsable_id: null,
    echeance_debut: '',
    echeance_fin: '',
    observations: ''
  };

  projets: Projet[] = [];
  users: User[] = [];
  availableYears: number[] = [];
  projetsSearchTerm = '';
  saving = false;
  errorMessage = '';
  isEdit = false;

  // Document upload properties
  selectedFile: File | null = null;
  uploadProgress: UploadProgress | null = null;
  uploadedDocumentId: number | null = null;
  isDragOver = false;
  fileError = '';

  // Existing documents properties
  existingDocuments: DocumentModel[] = [];
  loadingDocuments = false;

  private subs: Subscription[] = [];

  constructor(
    private planAnnuelService: PlanAnnuelService,
    private projetService: ProjetService,
    private userService: UserService,
    public documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadProjets();
    this.loadUsers();
    this.initializeAvailableYears();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['planAnnuel']) {
      this.initializeForm();
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  isFormValid(): boolean {
    return !!(
      this.formData.intitule &&
      this.formData.intitule.trim() &&
      this.formData.id_projets &&
      this.formData.id_projets.length > 0 &&
      this.formData.annee &&
      this.formData.responsable_id &&
      this.formData.echeance_debut &&
      this.formData.echeance_fin &&
      new Date(this.formData.echeance_debut) <= new Date(this.formData.echeance_fin)
    );
  }

  getPlanDuration(): number {
    if (!this.formData.echeance_debut || !this.formData.echeance_fin) return 0;
    const debut = new Date(this.formData.echeance_debut);
    const fin = new Date(this.formData.echeance_fin);
    const diffTime = fin.getTime() - debut.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getResponsableDisplay(): string {
    if (!this.formData.responsable_id) return 'Non défini';
    const user = this.users.find(u => u.id_utilisateur === this.formData.responsable_id);
    return user ? this.getUserDisplay(user) : 'Non trouvé';
  }

  private initializeForm() {
    // Reset document state
    this.selectedFile = null;
    this.uploadProgress = null;
    this.uploadedDocumentId = null;
    this.fileError = '';
    this.isDragOver = false;
    this.existingDocuments = [];
    this.loadingDocuments = false;

    if (this.planAnnuel && this.planAnnuel.id_plan) {
      this.isEdit = true;
      const anyP = this.planAnnuel as any;
      
      this.formData = {
        intitule: this.planAnnuel.intitule || '',
        id_projets: Array.isArray(anyP.id_projets) ? [...anyP.id_projets] : [],
        annee: this.planAnnuel.annee || null,
        responsable_id: typeof this.planAnnuel.responsable === 'number' ? this.planAnnuel.responsable : null,
        echeance_debut: this.formatDateForInput(this.planAnnuel.echeance_debut),
        echeance_fin: this.formatDateForInput(this.planAnnuel.echeance_fin),
        observations: this.planAnnuel.observations || ''
      };
      
      // Load existing documents for this plan
      this.loadExistingDocuments();
    } else {
      this.isEdit = false;
      const currentYear = new Date().getFullYear();
      
      this.formData = {
        intitule: '',
        id_projets: [],
        annee: currentYear,
        responsable_id: null,
        echeance_debut: '',
        echeance_fin: '',
        observations: ''
      };
    }
  }

  private formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  private initializeAvailableYears() {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    
    // Add years from current-2 to current+5
    for (let year = currentYear - 2; year <= currentYear + 5; year++) {
      this.availableYears.push(year);
    }
  }

  private loadProjets() {
    const sub = this.projetService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.projets = response.data || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading projets:', error);
      }
    });
    this.subs.push(sub);
  }

  private loadUsers() {
    const sub = this.userService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.users = response.data || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
    this.subs.push(sub);
  }

  getUserDisplay(user: User): string {
    const anyU = user as any;
    if (anyU.prenom || anyU.nom) {
      return `${anyU.prenom ?? ''} ${anyU.nom ?? ''}`.trim();
    }
    return anyU.login ?? anyU.email ?? `#${anyU.id_utilisateur ?? 'user'}`;
  }

  // projets selection methods
  getFilteredProjets(): Projet[] {
    if (!this.projetsSearchTerm || !this.projetsSearchTerm.trim()) {
      return this.projets;
    }
    
    const term = this.projetsSearchTerm.toLowerCase();
    return this.projets.filter(projet => 
      (projet.titre || '').toLowerCase().includes(term) ||
      (projet.commune || '').toLowerCase().includes(term) ||
      (projet.observations || '').toLowerCase().includes(term)
    );
  }

  isProjetSelected(projetId: number): boolean {
    return this.formData.id_projets.includes(projetId);
  }

  onProjetToggle(projetId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.formData.id_projets.includes(projetId)) {
        this.formData.id_projets.push(projetId);
      }
    } else {
      this.formData.id_projets = this.formData.id_projets.filter(id => id !== projetId);
    }
  }

  getProjetStatusClass(statut: string): string {
    const classes = {
      'Planifiée': 'bg-amber-100 text-amber-800',
      'En cours': 'bg-blue-100 text-blue-800',
      'Terminée': 'bg-green-100 text-green-800',
      'Suspendue': 'bg-red-100 text-red-800'
    };
    return (classes as any)[statut] || 'bg-gray-100 text-gray-800';
  }

  onSubmit() {
    if (this.saving || !this.isFormValid()) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      const payload: CreatePlanAnnuelRequest = {
        intitule: this.formData.intitule.trim(),
        id_projets: this.formData.id_projets.map(Number),
        annee: this.formData.annee!,
        responsable: this.formData.responsable_id,
        echeance_debut: new Date(this.formData.echeance_debut),
        echeance_fin: new Date(this.formData.echeance_fin),
        observations: this.formData.observations?.trim() || undefined
      };

      const operation = this.isEdit && this.planAnnuel
        ? this.planAnnuelService.update(this.planAnnuel.id_plan, payload)
        : this.planAnnuelService.create(payload);

      const sub = operation.subscribe({
        next: async (response: any) => {
          if (response.success) {
            // If there's a file to upload, upload it after saving the plan
            if (this.selectedFile) {
              try {
                await this.uploadDocument(response.data.id_plan);
                // Success with document upload
                this.save.emit(response.data);
              } catch (uploadError) {
                console.error('Document upload error:', uploadError);
                // Plan saved but document upload failed
                this.errorMessage = 'Plan enregistré mais erreur lors du téléchargement du document';
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
        error: (error: any) => {
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

  // File upload handlers
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

    // Validate file via documentService helper
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

  formatDate(date: Date | string): string {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('fr-FR');
  }

  // Upload document after saving plan
  private uploadDocument(planId: number): Promise<void> {
    if (!this.selectedFile) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const documentData = {
        id_entite: planId,
        type_entite: 'plan_annuel',
        type_document: 'general'
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

  // Load existing documents for edit mode
  private loadExistingDocuments() {
    if (!this.planAnnuel?.id_plan) return;

    this.loadingDocuments = true;
    const sub = this.documentService.getByEntity('plan_annuel', this.planAnnuel.id_plan).subscribe({
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
    if (!this.planAnnuel?.id_plan) return;

    this.router.navigate(['/documents'], {
      queryParams: {
        type_entite: 'plan_annuel',
        id_entite: this.planAnnuel.id_plan
      }
    });
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
}