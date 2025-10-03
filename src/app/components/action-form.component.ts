import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { actionService } from '../services/action.service';
import { Zone } from '../models/zone.model';
import { ZoneService } from '../services/zone.service';
import { Projet } from '../models/projet.model';
import { ProjetService } from '../services/projet.service';
import { Action, CreateActionRequest, ActionStatus } from '../models/action.model';
import { DocumentService, UploadProgress } from '../services/document.service';
import { Document as DocumentModel } from '../models/document.model';
import { Router } from '@angular/router';
import { SuiviBudgetService } from '../services/suivi-budget.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type FormModel = {
  id_projet: number | null;
  id_zone: number | null;
  // optional manual zone dropdown fields
  province?: string;
  commune?: string;
  perimetre?: string;
  type_action: string;
  type_volet: 'CES' | 'CEP';
  quantite_prevue: number | null;
  quantite_realisee: number | null;
  unite_mesure: string;
  cout_unitaire: number | null;
  // Budget fields for creating suivi budget (only in create mode)
  budget_prevu: number | null;
  montant_paye: number | null;
  date_debut: string;
  date_fin: string;
  statut: ActionStatus;
  observations: string;
};

@Component({
  selector: 'app-action-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #actionForm="ngForm" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Projet (Required) -->
        <div>
          <label for="id_projet" class="block text-sm font-semibold text-gray-900 mb-2">
            Projet
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="id_projet"
              name="id_projet"
              [(ngModel)]="formData.id_projet"
              #idprojet="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                     appearance-none bg-white"
              [class.border-red-300]="idprojet.invalid && idprojet.touched"
              [class.border-green-300]="idprojet.valid && idprojet.touched"
              [class.border-gray-300]="idprojet.untouched">
              <option [ngValue]="null">Sélectionner un projet...</option>
              <option *ngFor="let p of projets" [ngValue]="p.id_projet">
                {{ p.titre }} {{ p.id_projet ? ('— #' + p.id_projet) : '' }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="idprojet.invalid && idprojet.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le projet est obligatoire
          </div>
        </div>

        <!-- Province dropdown (optional) -->
        <div>
          <label for="province" class="block text-sm font-semibold text-gray-900 mb-2">
            Province (optionnel)
          </label>
          <div class="relative">
            <select
               id="province"
               name="province"
               [(ngModel)]="formData.province"
               (ngModelChange)="onProvinceChange($event)"
               class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
               focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
               hover:border-gray-400 appearance-none bg-white">
              <option [ngValue]="undefined">Sélectionner une province...</option>
              <option *ngFor="let p of provinces" [value]="p">{{ p }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Commune dropdown (optional) -->
        <div>
          <label for="commune" class="block text-sm font-semibold text-gray-900 mb-2">
            Commune (optionnel)
          </label>
          <div class="relative">
            <select
              id="commune"
              name="commune"
              [(ngModel)]="formData.commune"
              class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white">
              <option [ngValue]="undefined">Sélectionner une commune...</option>
              <option *ngFor="let c of communes" [value]="c">{{ c }}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Perimetre text input (optional) -->
        <div>
          <label for="perimetre" class="block text-sm font-semibold text-gray-900 mb-2">
            Périmètre (optionnel)
          </label>
          <input
            type="text"
            id="perimetre"
            name="perimetre"
            [(ngModel)]="formData.perimetre"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none hover:border-gray-400"
            placeholder="Ex: Bouregreg">
        </div>

        <!-- Type action (Required) -->
        <div>
          <label for="type_action" class="block text-sm font-semibold text-gray-900 mb-2">
            Type d'action
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="type_action"
            name="type_action"
            [(ngModel)]="formData.type_action"
            #typeaction="ngModel"
            required
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="typeaction.invalid && typeaction.touched"
            [class.border-green-300]="typeaction.valid && typeaction.touched"
            [class.border-gray-300]="typeaction.untouched"
            placeholder="Ex: Piste rurale">
          <div *ngIf="typeaction.invalid && typeaction.touched" class="mt-2 text-sm text-red-600">
            Le type d'action est obligatoire
          </div>
        </div>

        <!-- Type Volet (Required) -->
        <div>
          <label for="type_volet" class="block text-sm font-semibold text-gray-900 mb-2">
            Type de Volet
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="type_volet"
              name="type_volet"
              [(ngModel)]="formData.type_volet"
              #typeVolet="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="typeVolet.invalid && typeVolet.touched"
              [class.border-green-300]="typeVolet.valid && typeVolet.touched"
              [class.border-gray-300]="typeVolet.untouched">
              <option value="CES">CES - Conservation des Eaux et des Sols</option>
              <option value="CEP">CEP - Collecte des Eaux Pluviales</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Quantité Prévue (Required) -->
        <div>
          <label for="quantite_prevue" class="block text-sm font-semibold text-gray-900 mb-2">
            Quantité Prévue
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            id="quantite_prevue"
            name="quantite_prevue"
            [(ngModel)]="formData.quantite_prevue"
            #quantitePrevue="ngModel"
            required
            min="0"
            step="0.01"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="quantitePrevue.invalid && quantitePrevue.touched"
            [class.border-green-300]="quantitePrevue.valid && quantitePrevue.touched"
            [class.border-gray-300]="quantitePrevue.untouched"
            placeholder="Ex: 100">
          <div *ngIf="quantitePrevue.invalid && quantitePrevue.touched" class="mt-2 text-sm text-red-600">
            La quantité prévue est obligatoire
          </div>
        </div>

        <!-- Unité de Mesure (Required) -->
        <div>
          <label for="unite_mesure" class="block text-sm font-semibold text-gray-900 mb-2">
            Unité de Mesure
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="unite_mesure"
            name="unite_mesure"
            [(ngModel)]="formData.unite_mesure"
            #uniteMesure="ngModel"
            required
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="uniteMesure.invalid && uniteMesure.touched"
            [class.border-green-300]="uniteMesure.valid && uniteMesure.touched"
            [class.border-gray-300]="uniteMesure.untouched"
            placeholder="Ex: km, m², unité">
          <div *ngIf="uniteMesure.invalid && uniteMesure.touched" class="mt-2 text-sm text-red-600">
            L'unité de mesure est obligatoire
          </div>
        </div>

        <!-- Statut -->
        <div>
          <label for="statut" class="block text-sm font-semibold text-gray-900 mb-2">
            Statut
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="statut"
              name="statut"
              [(ngModel)]="formData.statut"
              #statut="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="statut.invalid && statut.touched"
              [class.border-green-300]="statut.valid && statut.touched"
              [class.border-gray-300]="statut.untouched">
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

        <!-- Coût Unitaire -->
        <div>
          <label for="cout_unitaire" class="block text-sm font-semibold text-gray-900 mb-2">
            Coût Unitaire (DH)
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <input
            type="number"
            id="cout_unitaire"
            name="cout_unitaire"
            [(ngModel)]="formData.cout_unitaire"
            min="0"
            step="0.01"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            placeholder="Ex: 1500.00">
        </div>

        <!-- Budget Prévu (Create mode only) - now required -->
        <div>
          <label for="budget_prevu" class="block text-sm font-semibold text-gray-900 mb-2">
            Budget Prévu (MAD)
            <span class="text-red-500 ml-1" *ngIf="!isEdit">*</span>
            <span class="text-gray-500 text-xs ml-1" *ngIf="isEdit">(modification)</span>
          </label>
          <div class="relative">
            <input
              type="number"
              id="budget_prevu"
              name="budget_prevu"
              [(ngModel)]="formData.budget_prevu"
              #budgetPrevu="ngModel"
              required
              min="0"
              step="0.01"
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400"
              [class.border-red-300]="budgetPrevu.invalid && budgetPrevu.touched"
              [class.border-green-300]="budgetPrevu.valid && budgetPrevu.touched"
              [class.border-gray-300]="budgetPrevu.untouched"
              placeholder="Ex: 150000.00">
          </div>
          <div *ngIf="budgetPrevu.invalid && budgetPrevu.touched" class="mt-2 text-sm text-red-600">
            Le budget prévu est requis lors de la création et doit être supérieur à 0
          </div>
        </div>

        <!-- Montant Payé (Create mode only) -->
        <!-- <div *ngIf="!isEdit">
          <label for="montant_paye" class="block text-sm font-semibold text-gray-900 mb-2">
            Montant Payé (MAD)
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <div class="relative">
            <input
              type="number"
              id="montant_paye"
              name="montant_paye"
              [(ngModel)]="formData.montant_paye"
              min="0"
              step="0.01"
              [max]="formData.budget_prevu || null"
              class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400"
              placeholder="Ex: 75000.00">
          </div>
          <div *ngIf="formData.montant_paye && formData.budget_prevu && formData.montant_paye > formData.budget_prevu" 
               class="mt-2 text-sm text-red-600">
            Le montant payé ne peut pas dépasser le budget prévu
          </div>
        </div> -->

        <!-- Dates -->
        <div>
          <label for="date_debut" class="block text-sm font-semibold text-gray-900 mb-2">
            Date de Début
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <input
            type="date"
            id="date_debut"
            name="date_debut"
            [(ngModel)]="formData.date_debut"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400">
        </div>

        <div>
          <label for="date_fin" class="block text-sm font-semibold text-gray-900 mb-2">
            Date de Fin
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <input
            type="date"
            id="date_fin"
            name="date_fin"
            [(ngModel)]="formData.date_fin"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400">
        </div>

        <!-- Observations -->
        <div class="lg:col-span-2">
          <label for="observations" class="block text-sm font-semibold text-gray-900 mb-2">
            Observations
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <textarea
            id="observations"
            name="observations"
            [(ngModel)]="formData.observations"
            rows="4"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 resize-none
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            placeholder="Ajoutez des observations ou notes sur cette action..."></textarea>
        </div>

        <!-- Existing Documents (Edit Mode Only) -->
        <div *ngIf="isEdit && (existingDocuments.length > 0 || loadingDocuments)" class="lg:col-span-2">
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Documents associés
            <span class="text-gray-500 text-xs ml-1">({{ existingDocuments.length }})</span>
          </label>

          <div *ngIf="loadingDocuments" class="border border-gray-200 rounded-xl p-4 text-center">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
              <span class="text-sm text-gray-500">Chargement des documents...</span>
            </div>
          </div>

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
                  <!-- PREVIEW button (only shown when file type is previewable) -->
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

          <div *ngIf="!loadingDocuments && existingDocuments.length === 0" class="border border-gray-200 rounded-xl p-6 text-center bg-gray-50">
            <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="mt-2 text-sm text-gray-500">Aucun document associé à cette action</p>
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
                <button type="button" 
                        (click)="fileInput.click()"
                        class="text-indigo-600 hover:text-indigo-500 font-medium">
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
                    {{ uploadProgressMap[f.name].progress}}%
                  </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                       [style.width.%]="uploadProgressMap[f.name].progress"></div>
                </div>
              </div>
            </div>
          </div>

          <input #fileInput
                 type="file"
                 class="hidden"
                 multiple
                 accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                 (change)="onFileSelected($event)">

          <div *ngIf="fileError" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            {{ fileError }}
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

      <!-- Form actions -->
      <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0 pt-8 border-t-2 border-gray-100">
        <button
          type="button"
          (click)="onCancel()"
          [disabled]="saving || hasAnyUploadInProgress()"
          class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white 
                 hover:bg-gray-50 hover:border-gray-400 
                 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400
                 active:bg-gray-100 
                 disabled:opacity-50 disabled:cursor-not-allowed
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
          <span *ngIf="!saving && isEdit">Mettre à jour l'action</span>
          <span *ngIf="!saving && !isEdit">Créer l'action</span>
        </button>
      </div>
    </form>

    <!-- Preview Modal (reused behavior from DocumentComponent) -->
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
export class ActionFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() action: Action | null = null;
  @Output() save = new EventEmitter<Action>();
  @Output() cancel = new EventEmitter<void>();
  @Input() preselectedProjetId: number | null = null;

  formData: FormModel = {
    id_projet: null,
    id_zone: null,
    province: undefined,
    commune: undefined,
    perimetre: undefined,
    type_action: '',
    type_volet: 'CES',
    quantite_prevue: null,
    quantite_realisee: null,
    unite_mesure: '',
    cout_unitaire: null,
    budget_prevu: null,
    montant_paye: null,
    date_debut: '',
    date_fin: '',
    statut: 'Planifiée',
    observations: ''
  };

  saving = false;
  errorMessage = '';
  isEdit = false;

  zones: Zone[] = [];
  projets: Projet[] = [];
  
  // Dropdown data for province and commune
  provinces: string[] = [];
  communes: string[] = [];
  private provinceToCommunes: Map<string, Set<string>> = new Map();

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
    private actionSvc: actionService,
    private zoneService: ZoneService,
    private projetService: ProjetService,
    private suiviBudgetService: SuiviBudgetService,
    public documentService: DocumentService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadZones();
    this.loadProjets();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['action']) {
      this.initializeForm();
    }
    // Handle preselected project changes
    if (changes['preselectedProjetId'] && this.preselectedProjetId && !this.isEdit) {
      this.formData.id_projet = this.preselectedProjetId;
      console.log('Project preselected in form:', this.preselectedProjetId);
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    // Clean up preview URL if any
    this.cleanupPreviewUrl();
  }

  isFormValid(): boolean {
    const baseValid = !!(
      this.formData.id_projet &&
      this.formData.id_projet > 0 &&
      this.formData.type_action &&
      this.formData.type_action.trim() &&
      this.formData.type_volet &&
      this.formData.quantite_prevue !== null &&
      this.formData.quantite_prevue !== undefined &&
      this.formData.quantite_prevue > 0 &&
      this.formData.unite_mesure &&
      this.formData.unite_mesure.trim() &&
      this.formData.statut
    );

    // Validation for montant_paye (only in create mode)
    let payeValid = true;
    if (!this.isEdit && this.formData.montant_paye !== null && this.formData.montant_paye !== undefined) {
      if (this.formData.montant_paye < 0) payeValid = false;
      if (this.formData.budget_prevu !== null && this.formData.budget_prevu !== undefined) {
        if (this.formData.montant_paye > this.formData.budget_prevu) payeValid = false;
      }
    }

    // Require budget_prevu when creating a new action
    const budgetPrevuValid = this.isEdit ? true : !!(this.formData.budget_prevu && this.formData.budget_prevu > 0);

    return baseValid && payeValid && budgetPrevuValid;
  }

  // --- File upload handlers (document) ---

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

  // Upload multiple documents after saving action
  private uploadDocument(actionId: number): Promise<void> {
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
              id_entite: actionId,
              type_entite: 'action',
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

  // Load existing documents for edit mode
  private loadExistingDocuments() {
    if (!this.action?.id_action) return;

    this.loadingDocuments = true;
    const sub = this.documentService.getByEntity('action', this.action.id_action).subscribe({
      next: (response) => {
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
        this.loadingDocuments = false;
        this.existingDocuments = [];
      }
    });
    this.subs.push(sub);
  }

  // View documents page with filter
  viewDocumentsPage() {
    if (!this.action?.id_action) return;

    this.router.navigate(['/documents'], {
      queryParams: {
        type_entite: 'action',
        id_entite: this.action.id_action
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

  // Initialize form with input action or defaults
  private initializeForm() {
    // Reset file state
    this.selectedFiles = [];
    this.uploadProgressMap = {};
    this.uploadedDocumentIds = [];
    this.fileError = '';
    this.isDragOver = false;
    this.existingDocuments = [];

    if (this.action && this.action.id_action) {
      this.isEdit = true;
      this.formData = {
        id_projet: this.action.id_projet,
        id_zone: this.action.id_zone || null,
        province: (this.action.id_zone === 0 || this.action.province === 'default') ? 'Région GON' : (this.action.province || undefined),
        commune: (this.action.id_zone === 0 || this.action.commune === 'default') ? 'Région GON' : (this.action.commune || undefined),
        perimetre: (this.action.id_zone === 0 || this.action.perimetre === 'default') ? 'Région GON' : (this.action.perimetre || undefined),
        type_action: this.action.type_action || '',
        type_volet: this.action.type_volet as 'CES'|'CEP',
        quantite_prevue: this.action.quantite_prevue,
        quantite_realisee: this.action.quantite_realisee,
        unite_mesure: this.action.unite_mesure || '',
        cout_unitaire: this.action.cout_unitaire || null,
        budget_prevu: null, // Not used in edit mode
        montant_paye: null, // Not used in edit mode
        date_debut: this.formatDateForInput(this.action.date_debut),
        date_fin: this.formatDateForInput(this.action.date_fin),
        statut: this.action.statut || 'Planifiée',
        observations: this.action.observations || ''
      };
      this.loadExistingDocuments();
	  // Load action-level budget (suivi) and populate budget fields when editing.
      const subBudget = this.suiviBudgetService.getByAction(this.action!.id_action).subscribe({
        next: (resp: any) => {
          if (resp && resp.success && resp.data) {
            const budgets = Array.isArray(resp.data) ? resp.data : [resp.data];
            if (budgets.length > 0) {
              const b = budgets[0]; // choose the appropriate entry (latest / action-level)
              this.formData.budget_prevu = (b.budget_prevu ?? b.budget) ?? null;
              this.formData.montant_paye = (b.montant_paye ?? b.montant_paye_total ?? b.montant_paye_cumule) ?? null;
            }
          }
        },
        error: (err) => {
          console.error('Failed to load action budget', err);
        }
      });
      this.subs.push(subBudget);
    } else {
      this.isEdit = false;
      const todayStr = '';
      this.formData = {
        id_projet: this.preselectedProjetId,
        id_zone: null,
        province: undefined,
        commune: undefined,
        perimetre: undefined,
        type_action: '',
        type_volet: 'CES',
        quantite_prevue: null,
        quantite_realisee: null,
        unite_mesure: '',
        cout_unitaire: null,
        budget_prevu: null,
        montant_paye: null,
        date_debut: todayStr,
        date_fin: '',
        statut: 'Planifiée',
        observations: ''
      };
    }
  }

  private formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) return '';
    let parsedDate: Date;
    if (typeof date === 'string') parsedDate = new Date(date);
    else parsedDate = date;
    if (isNaN(parsedDate.getTime())) return '';
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private loadZones() {
    const s = this.zoneService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.zones = res.data || [];
          this.extractDropdownData();
        } else {
          console.warn('Zones API responded with non-success:', res.message);
          this.zones = [];
        }
      },
      error: (err) => {
        console.error('Failed to load zones:', err);
        this.zones = [];
      }
    });
    this.subs.push(s);
  }

  private loadProjets() {
    const s = this.projetService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.projets = res.data || [];
        } else {
          console.warn('Projets API responded with non-success:', res.message);
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

  // Extract unique provinces and communes from zones data
  private extractDropdownData() {
  const provincesSet = new Set<string>();
  const allCommunesSet = new Set<string>();
  this.provinceToCommunes = new Map<string, Set<string>>();

  this.zones.forEach(zone => {
    const provRaw = zone.province || '';
    const commRaw = zone.commune || '';

    // normalize and skip sentinel "Région GON"
    const prov = (provRaw && provRaw.trim() && provRaw !== 'Région GON') ? provRaw.trim() : null;
    const comm = (commRaw && commRaw.trim() && commRaw !== 'Région GON') ? commRaw.trim() : null;

    if (prov) provincesSet.add(prov);
    if (comm) allCommunesSet.add(comm);

    if (prov && comm) {
      const set = this.provinceToCommunes.get(prov) || new Set<string>();
      set.add(comm);
      this.provinceToCommunes.set(prov, set);
    }
  });

  // sort provinces for display
  this.provinces = Array.from(provincesSet).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));

  // If a province is already selected, populate communes for it, otherwise show all communes
  const selectedProv = this.formData.province;
  if (selectedProv && this.provinceToCommunes.has(selectedProv)) {
    this.communes = Array.from(this.provinceToCommunes.get(selectedProv)!).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  } else {
    this.communes = Array.from(allCommunesSet).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
  }
  } 

  onProvinceChange(province?: string | null) {
  if (!this.provinceToCommunes || this.provinceToCommunes.size === 0) {
    // fallback: reconstruct if necessary
    this.extractDropdownData();
  }

  if (!province || province === '' ) {
    // no province selected => show all communes
    const all = new Set<string>();
    this.provinceToCommunes.forEach(s => s.forEach(c => all.add(c)));
    this.communes = Array.from(all).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    if (this.formData.commune && !this.communes.includes(this.formData.commune)) {
      this.formData.commune = undefined;
    }
    return;
  }

  const set = this.provinceToCommunes.get(province);
  if (set && set.size > 0) {
    this.communes = Array.from(set).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    if (this.formData.commune && !this.communes.includes(this.formData.commune)) {
      this.formData.commune = undefined;
    }
  } else {
    this.communes = [];
    this.formData.commune = undefined;
  }
  }
  
  onSubmit() {
    if (this.saving || !this.isFormValid()) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      // Helper to actually send the action create/update once we have the resolved id_zone
      const proceedWithResolvedZone = (resolvedZoneId: number) => {
        const payload: CreateActionRequest = {
          id_projet: Number(this.formData.id_projet),
          id_zone: resolvedZoneId,
          type_action: this.formData.type_action.trim(),
          type_volet: this.formData.type_volet,
          quantite_prevue: Number(this.formData.quantite_prevue),
          quantite_realisee: this.formData.quantite_realisee !== null && this.formData.quantite_realisee !== undefined ? Number(this.formData.quantite_realisee) : undefined,
          unite_mesure: this.formData.unite_mesure.trim(),
          cout_unitaire: this.formData.cout_unitaire !== null && this.formData.cout_unitaire !== undefined ? Number(this.formData.cout_unitaire) : undefined,
          date_debut: this.formData.date_debut ? this.formData.date_debut : undefined,
          date_fin: this.formData.date_fin ? this.formData.date_fin : undefined,
          statut: this.formData.statut,
          observations: this.formData.observations?.trim() || undefined
        };

        const operation = this.isEdit && this.action
          ? this.actionSvc.update(this.action.id_action, payload)
          : this.actionSvc.create(payload);

        const sub = operation.subscribe({
          next: async (response) => {
            if (response.success) {
              const createdAction = response.data;
              
              // If creating a new action and budget_prevu provided, create an action-level suivi budget
              // Handle budget operations
          if (this.isEdit) {
            // When editing, update ALL existing suivi budget entries for this action
            if (this.formData.budget_prevu !== null && this.formData.budget_prevu !== undefined) {
              try {
                const budgetResponse = await this.suiviBudgetService.getByAction(createdAction.id_action).toPromise();
                if (budgetResponse?.success && budgetResponse.data && budgetResponse.data.length > 0) {
                  // Update ALL budget entries related to this action
                  for (const budgetEntry of budgetResponse.data) {
                    const updatePayload = {
                      budget_prevu: this.formData.budget_prevu,
                      // Keep existing montant_paye
                      observations: this.formData.observations || budgetEntry.observations || undefined
                    };
                    await this.suiviBudgetService.update(budgetEntry.id_budget, updatePayload).toPromise();
                  }
                } else if (this.formData.budget_prevu > 0) {
                  // Create new budget entry if none exists
                  const budgetPayload = {
                    type_budget: 'action' as const,
                    id_action: createdAction.id_action,
                    budget_prevu: this.formData.budget_prevu,
                    montant_paye: this.formData.montant_paye || 0,
                    date_entree: new Date().toISOString().slice(0, 10),
                    observations: this.formData.observations || undefined
                  };
                  await this.suiviBudgetService.create(budgetPayload).toPromise();
                }
              } catch (err) {
                console.error('Error updating suivi budgets:', err);
                this.errorMessage = 'Action modifiée mais erreur lors de la mise à jour des budgets';
              }
            }
          } else {
            // When creating, create new suivi budget if budget_prevu provided
              if (this.formData.budget_prevu !== null && this.formData.budget_prevu !== undefined && this.formData.budget_prevu > 0) {
                try {
                  const budgetPayload = {
                    type_budget: 'action' as const,
                    id_action: createdAction.id_action,
                    budget_prevu: this.formData.budget_prevu!,
                    montant_paye: this.formData.montant_paye || 0,
					date_entree: new Date().toISOString().slice(0, 10),
                    observations: this.formData.observations || undefined
                  };
                  this.suiviBudgetService.create(budgetPayload).subscribe({
                    next: (bresp: any) => {
                      if (!bresp.success) {
                        console.warn('Suivi budget creation returned unsuccessful response:', bresp);
                        // non-blocking message
                        this.errorMessage = 'Action enregistrée mais erreur lors de la création du suivi budget';
                      }
                    },
                    error: (err) => {
                      console.error('Error creating suivi budget:', err);
                      // non-blocking message
                      this.errorMessage = 'Action enregistrée mais erreur lors de la création du suivi budget';
                    }
                  });
                } catch (err) {
                  console.error('Exception creating suivi budget:', err);
                  this.errorMessage = 'Action enregistrée mais erreur lors de la création du suivi budget';
                }
              }
            }

              // If there are files to upload, upload them after saving the action
              if (this.selectedFiles.length > 0) {
                try {
                  await this.uploadDocument(response.data.id_action);
                  // Success with document upload
                  this.save.emit(response.data);
                } catch (uploadError) {
                  console.error('Document upload error:', uploadError);
                  // action saved but document upload failed
                  this.errorMessage = 'Action enregistrée mais erreur lors du téléchargement du document';
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
            // Try to surface server message
            this.errorMessage = error.error?.message || error.message || 'Erreur lors de l\'enregistrement';
            this.saving = false;
          }
        });
        this.subs.push(sub);
      };

      // Decide how to resolve id_zone:
      // - if an existing id_zone was selected (>0) use it
      // - else if any manual zone fields were provided, create a new zone first and use its id
      // - otherwise fall back to 0 (or project's zone behavior on the server)
      const selectedZoneId = this.formData.id_zone && this.formData.id_zone > 0 ? Number(this.formData.id_zone) : null;
      const hasManualZone = (this.formData.province && this.formData.province.trim()) ||
                            (this.formData.commune && this.formData.commune.trim()) ||
                            (this.formData.perimetre && this.formData.perimetre.trim());

      // If the user provided manual zone values, prefer creating/finding that zone first
      if (hasManualZone) {
        // Create zone from provided dropdown/text fields, then proceed with its id_zone
        const zonePayload: Partial<Zone> = {
          commune: this.formData.commune ? this.formData.commune.trim() : 'default',
          province: this.formData.province ? this.formData.province.trim() : 'default',
          perimetre: this.formData.perimetre ? this.formData.perimetre.trim() : 'default'
        };

        const sub = this.zoneService.findOrCreate(zonePayload as any).subscribe({
          next: (resp: any) => {
            if (resp && resp.success && resp.data && typeof resp.data.id_zone !== 'undefined') {
              const newZoneId = Number(resp.data.id_zone);
              proceedWithResolvedZone(newZoneId);
            } else {
              // If zone creation didn't return an id, fail gracefully and do not create the action
              console.error('Zone creation did not return id:', resp);
              this.errorMessage = 'Erreur lors de la création de la zone';
              this.saving = false;
            }
          },
          error: (err) => {
            console.error('Failed to create zone:', err);
            this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de la création de la zone';
            this.saving = false;
          }
        });
        this.subs.push(sub);
        return;
      }

      // If no manual zone provided, use selected existing zone if present
      if (selectedZoneId) {
        proceedWithResolvedZone(selectedZoneId);
        return;
      }

      // No zone selected and no manual fields => use 0 (server will decide default based on project)
      proceedWithResolvedZone(0);

    } catch (error) {
      console.error('Form submission error:', error);
      this.errorMessage = 'Erreur lors de la préparation des données';
      this.saving = false;
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  // Helper to check if any upload is in progress
  hasAnyUploadInProgress(): boolean {
    return Object.keys(this.uploadProgressMap).length > 0;
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