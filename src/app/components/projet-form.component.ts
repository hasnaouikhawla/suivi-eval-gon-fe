import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjetService } from '../services/projet.service';
import { Projet, CreateProjetRequest, ProjetStatus } from '../models/projet.model';
import { DocumentService, UploadProgress } from '../services/document.service';
import { Document as DocumentModel } from '../models/document.model';
import { Router } from '@angular/router';
import { SuiviBudgetService } from '../services/suivi-budget.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type FormModel = {
  n_marche: string;
  entreprise: string;
  titre: string;
  date_debut: string;
  date_fin: string;
  statut: ProjetStatus;
  observations: string;

  // New fields for initial budget creation
  budget_prevu: number | null;
  montant_paye: number | null;

  // Responsable (optional) - select from users
  responsable: number | null;
};

@Component({
  selector: 'app-projet-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #projetForm="ngForm" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
	    <!-- Titre (Required) -->
        <div class="lg:col-span-2">
          <label for="titre" class="block text-sm font-semibold text-gray-900 mb-2">
            Titre du projet
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="text"
              id="titre"
              name="titre"
              [(ngModel)]="formData.titre"
              #titre="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
              [class.border-red-300]="titre.invalid && titre.touched"
              [class.border-green-300]="titre.valid && titre.touched"
              [class.border-gray-300]="titre.untouched"
              placeholder="Entrez un titre descriptif pour le projet">
            <div *ngIf="titre.valid && titre.touched" class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="titre.invalid && titre.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le titre est obligatoire
          </div>
        </div>
		
        <!-- Numéro de marché (Required) -->
        <div>
          <label for="n_marche" class="block text-sm font-semibold text-gray-900 mb-2">
            Numéro de marché
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="text"
              id="n_marche"
              name="n_marche"
              [(ngModel)]="formData.n_marche"
              #nMarche="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
              [class.border-red-300]="nMarche.invalid && nMarche.touched"
              [class.border-green-300]="nMarche.valid && nMarche.touched"
              [class.border-gray-300]="nMarche.untouched"
              placeholder="Ex: MARCHE-2025-001">
            <div *ngIf="nMarche.valid && nMarche.touched" class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="nMarche.invalid && nMarche.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le numéro de marché est requis
          </div>
        </div>

        <!-- Entreprise (Required) -->
        <div>
          <label for="entreprise" class="block text-sm font-semibold text-gray-900 mb-2">
            Entreprise
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="text"
              id="entreprise"
              name="entreprise"
              [(ngModel)]="formData.entreprise"
              #entreprise="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
              [class.border-red-300]="entreprise.invalid && entreprise.touched"
              [class.border-green-300]="entreprise.valid && entreprise.touched"
              [class.border-gray-300]="entreprise.untouched"
              placeholder="Nom de l'entreprise">
            <div *ngIf="entreprise.valid && entreprise.touched" class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="entreprise.invalid && entreprise.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            L'entreprise est requise
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
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
                     appearance-none bg-white"
              [class.border-red-300]="statut.invalid && statut.touched"
              [class.border-green-300]="statut.valid && statut.touched"
              [class.border-gray-300]="statut.untouched">
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

        <!-- Responsable (Required) -->
        <div>
          <label for="responsable" class="block text-sm font-semibold text-gray-900 mb-2">
            Responsable
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="responsable"
              name="responsable"
              [(ngModel)]="formData.responsable"
              #responsable="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="responsable.invalid && responsable.touched"
              [class.border-green-300]="responsable.valid && responsable.touched"
              [class.border-gray-300]="responsable.untouched">
              <option *ngFor="let u of users" [ngValue]="u.id_utilisateur">
                {{ u.prenom }} {{ u.nom }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="responsable.invalid && responsable.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le responsable est requis
          </div>
        </div>
		
		<!-- Budget Prévu (Required when creating) -->
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
              [required]="!isEdit"
              min="0"
              step="0.01"
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     placeholder-gray-400 
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400"
              [class.border-red-300]="budgetPrevu.invalid && budgetPrevu.touched"
              [class.border-green-300]="budgetPrevu.valid && budgetPrevu.touched"
              [class.border-gray-300]="budgetPrevu.untouched"
              placeholder="Ex: 100000">
            <div *ngIf="budgetPrevu.valid && budgetPrevu.touched" class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="!isEdit && budgetPrevu.invalid && budgetPrevu.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le budget prévu est requis lors de la création et doit être supérieur à 0
          </div>
        </div>

        <!-- Montant Payé (Optional) -->
        <div *ngIf="!isEdit">
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
              placeholder="Ex: 50000">
          </div>
          <div *ngIf="formData.montant_paye && formData.budget_prevu && formData.montant_paye > formData.budget_prevu" 
               class="mt-2 text-sm text-red-600">
            Le montant payé ne peut pas dépasser le budget prévu
          </div>
        </div>

        <!-- Date de début (Required) -->
        <div>
          <label for="date_debut" class="block text-sm font-semibold text-gray-900 mb-2">
            Date de début
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="date"
              id="date_debut"
              name="date_debut"
              [(ngModel)]="formData.date_debut"
              #dateDebut="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
              [class.border-red-300]="dateDebut.invalid && dateDebut.touched"
              [class.border-green-300]="dateDebut.valid && dateDebut.touched"
              [class.border-gray-300]="dateDebut.untouched">
            <div *ngIf="dateDebut.valid && dateDebut.touched" class="absolute inset-y-0 right-8 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="dateDebut.invalid && dateDebut.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            La date de début est obligatoire
          </div>
        </div>

        <!-- Date de fin (Required) -->
        <div>
          <label for="date_fin" class="block text-sm font-semibold text-gray-900 mb-2">
            Date de fin
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input
              type="date"
              id="date_fin"
              name="date_fin"
              [(ngModel)]="formData.date_fin"
              #dateFin="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400
                     disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
              [class.border-red-300]="dateFin.invalid && dateFin.touched"
              [class.border-green-300]="dateFin.valid && dateFin.touched"
              [class.border-gray-300]="dateFin.untouched">
            <div *ngIf="dateFin.valid && dateFin.touched" class="absolute inset-y-0 right-8 flex items-center pr-3">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="dateFin.invalid && dateFin.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            La date de fin est obligatoire
          </div>
          <!-- Date validation warning -->
          <div *ngIf="formData.date_debut && formData.date_fin && !isDateRangeValid()" class="mt-2 text-sm text-amber-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            La date de fin doit être postérieure à la date de début
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
              placeholder="Ajoutez des observations, notes ou commentaires sur ce projet..."></textarea>
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
            <p class="mt-2 text-sm text-gray-500">Aucun document associé à ce projet</p>
          </div>
        </div>

        <!-- Document Upload (Optional) - MULTIPLE FILES -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Documents associés
            <span class="text-gray-500 text-xs ml-1">(optionnel - vous pouvez sélectionner plusieurs fichiers)</span>
          </label>
          
          <!-- File Upload Area -->
          <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-200"
               [class.border-indigo-500]="isDragOver"
               [class.bg-indigo-50]="isDragOver"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)">
            
            <!-- No files selected state -->
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

            <!-- Files selected (ready to upload) -->
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

            <!-- Upload progress state (per-file) -->
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

          <!-- Hidden file input (multiple) -->
          <input #fileInput
                 type="file"
                 class="hidden"
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

      <!-- Form buttons -->
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
          <span *ngIf="!saving && isEdit">Mettre à jour le projet</span>
          <span *ngIf="!saving && !isEdit">Créer le projet</span>
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
      
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    </style>
  `
})
export class ProjetFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projet: Projet | null = null;
  @Output() save = new EventEmitter<Projet>();
  @Output() cancel = new EventEmitter<void>();

  formData: FormModel = {
    n_marche: '',
    entreprise: '',
    titre: '',
    date_debut: '',
    date_fin: '',
    statut: 'Planifié',
    observations: '',
    budget_prevu: null,
    montant_paye: null,
    responsable: null
  };

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

  // Users for responsable dropdown
  users: User[] = [];

  // Preview modal state
  showPreviewModal = false;
  previewingDocument: DocumentModel | null = null;
  previewUrl: SafeResourceUrl | null = null;
  previewContent: string | null = null;
  loadingPreview = false;

  private subs: Subscription[] = [];

  constructor(
    private projetService: ProjetService,
    private suiviBudgetService: SuiviBudgetService,
    public documentService: DocumentService,
    private router: Router,
    private userService: UserService,
	private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    console.log('ProjetFormComponent ngOnInit called with projet:', this.projet);
    this.initializeForm();
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ProjetFormComponent ngOnChanges called:', changes);
    if (changes['projet']) {
      this.initializeForm();
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  isFormValid(): boolean {
    const coreValid = !!(
      this.formData.n_marche &&
      this.formData.n_marche.trim() &&
      this.formData.entreprise &&
      this.formData.entreprise.trim() &&
      this.formData.titre &&
      this.formData.titre.trim() &&
      this.formData.date_debut &&
      this.formData.date_fin &&
      this.formData.statut &&
      this.formData.responsable !== null &&
      this.isDateRangeValid()
    );

    // Budget_prev must be provided when creating (not when editing)
    const budgetValid = this.isEdit ? true : !!(this.formData.budget_prevu && this.formData.budget_prevu > 0);

    // montant_paye must not be negative and not greater than budget_prevu if both provided
    // with this block:
let payeValid = true;
// Only enforce montant_paye <= budget_prevu when creating (not when editing)
if (!this.isEdit && this.formData.montant_paye !== null && this.formData.montant_paye !== undefined) {
  if (this.formData.montant_paye < 0) payeValid = false;
  if (this.formData.budget_prevu !== null && this.formData.budget_prevu !== undefined) {
    if (this.formData.montant_paye > this.formData.budget_prevu) payeValid = false;
  }
}

    return coreValid && budgetValid && payeValid;
  }

  isDateRangeValid(): boolean {
    if (!this.formData.date_debut || !this.formData.date_fin) {
      return true; // Let required validation handle empty dates
    }
    return new Date(this.formData.date_fin) > new Date(this.formData.date_debut);
  }

  private initializeForm() {
    console.log('Initializing form with projet:', this.projet);
    
    // Reset file/document state
    this.selectedFiles = [];
    this.uploadProgressMap = {};
    this.uploadedDocumentIds = [];
    this.fileError = '';
    this.isDragOver = false;
    this.existingDocuments = [];
    this.loadingDocuments = false;

    if (this.projet && this.projet.id_projet) {
      console.log('Setting up form for editing projet ID:', this.projet.id_projet);
      this.isEdit = true;
      
      this.formData = {
        n_marche: this.projet.n_marche || '',
        entreprise: this.projet.entreprise || '',
        titre: this.projet.titre || '',
        date_debut: this.formatDateForInput(this.projet.date_debut),
        date_fin: this.formatDateForInput(this.projet.date_fin),
        statut: this.projet.statut || 'Planifié',
        observations: this.projet.observations || '',
        budget_prevu: null,
        montant_paye: null,
        responsable: this.projet.responsable ?? null
      };
      
	  // Load projet-level budget (suivi) and populate budget fields when editing.
      const subBudget = this.suiviBudgetService.getByProjet(this.projet!.id_projet).subscribe({
  next: (resp: any) => {
    if (resp && resp.success && resp.data) {
      const budgets = Array.isArray(resp.data) ? resp.data : [resp.data];
      if (budgets.length > 0) {
        // Prefer a project-level suivi budget when backend returns mixed entries.
        // If none found, fall back to the first returned entry.
        const projectBudget = budgets.find((bb: any) => bb.type_budget === 'projet') || budgets[0];
        this.formData.budget_prevu = (projectBudget.budget_prevu ?? projectBudget.budget) ?? null;
        this.formData.montant_paye = (projectBudget.montant_paye ?? projectBudget.montant_paye_total ?? projectBudget.montant_paye_cumule) ?? null;
      }
    }
  },
  error: (err) => {
    console.error('Failed to load projet budget', err);
  }
});
      this.subs.push(subBudget);
	  
      console.log('Form data set to:', this.formData);

      // load existing documents for this projet
      this.loadExistingDocuments();
    } else {
      console.log('Setting up form for new projet');
      this.isEdit = false;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.formData = {
        n_marche: '',
        entreprise: '',
        titre: '',
        date_debut: this.formatDateForInput(today),
        date_fin: this.formatDateForInput(tomorrow),
        statut: 'Planifié',
        observations: '',
        budget_prevu: null,
        montant_paye: null,
        responsable: null
      };
      
      console.log('Default form data set to:', this.formData);
    }
  }

  private formatDateForInput(date: Date | string | null | undefined): string {
    if (!date) date = new Date();
    let parsedDate: Date;
    if (typeof date === 'string') parsedDate = new Date(date);
    else parsedDate = date;
    if (isNaN(parsedDate.getTime())) parsedDate = new Date();
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
  if (this.saving || !this.isFormValid()) return;

  console.log('Form submission - isEdit:', this.isEdit, 'formData:', this.formData);

  this.saving = true;
  this.errorMessage = '';

  try {
    const payload: CreateProjetRequest = {
      n_marche: this.formData.n_marche.trim(),
      entreprise: this.formData.entreprise.trim(),
      titre: this.formData.titre.trim(),
      id_zone: 0, // Always set to 0 for all projects
      date_debut: new Date(this.formData.date_debut),
      date_fin: new Date(this.formData.date_fin),
      statut: this.formData.statut as ProjetStatus,
      id_cadre: undefined, // Remove cadre logique - let backend set to null
      observations: this.formData.observations?.trim() || '',
      responsable: this.formData.responsable !== null && this.formData.responsable !== undefined
        ? Number(this.formData.responsable)
        : undefined
    };

    console.log('Sending payload:', payload);

    const operation = this.isEdit && this.projet
      ? this.projetService.update(this.projet.id_projet, payload)
      : this.projetService.create(payload);

    const sub = operation.subscribe({
      next: async (response) => {
        console.log('API response received:', response);
        if (response.success) {
          const createdProjet = response.data;
          
          // Handle budget operations
if (this.isEdit) {
  // When editing, update ALL existing suivi budget entries for this project
  // When editing, update ONLY project-level budget entries for this project
if (this.formData.budget_prevu !== null && this.formData.budget_prevu !== undefined) {
  try {
    const budgetResponse = await this.suiviBudgetService.getByProjet(createdProjet.id_projet).toPromise();
    if (budgetResponse?.success && budgetResponse.data && budgetResponse.data.length > 0) {
      // Update ONLY project-level budget entries (filter out action-level budgets)
      const projectBudgets = budgetResponse.data.filter(budget => budget.type_budget === 'projet');
      for (const budgetEntry of projectBudgets) {
        const updatePayload = {
          budget_prevu: this.formData.budget_prevu,
          // Keep existing montant_paye
          observations: this.formData.observations || budgetEntry.observations || undefined
        };
        await this.suiviBudgetService.update(budgetEntry.id_budget, updatePayload).toPromise();
      }
    } else if (this.formData.budget_prevu > 0) {
      // Create new project-level budget entry if none exists
      const budgetPayload = {
        type_budget: 'projet' as const,
        id_projet: createdProjet.id_projet,
        budget_prevu: this.formData.budget_prevu,
        montant_paye: this.formData.montant_paye || 0,
        date_entree: new Date().toISOString().slice(0, 10),
        observations: this.formData.observations || undefined
      };
      await this.suiviBudgetService.create(budgetPayload).toPromise();
    }
  } catch (err) {
    console.error('Error updating suivi budgets:', err);
    this.errorMessage = 'Projet modifié mais erreur lors de la mise à jour des budgets';
  }
}
} else {
  // When creating, create new suivi budget if budget_prevu provided
  if (this.formData.budget_prevu !== null && this.formData.budget_prevu !== undefined && this.formData.budget_prevu > 0) {
    try {
      const budgetPayload = {
        type_budget: 'projet' as const,
        id_projet: createdProjet.id_projet,
        budget_prevu: this.formData.budget_prevu,
        montant_paye: this.formData.montant_paye || 0,
        date_entree: new Date().toISOString().slice(0, 10),
        observations: this.formData.observations || undefined
      };
      await this.suiviBudgetService.create(budgetPayload).toPromise();
    } catch (err) {
      console.error('Error creating suivi budget:', err);
      this.errorMessage = 'Projet enregistré mais erreur lors de la création du suivi budget';
    }
  }
}


          // Handle file uploads if any
          if (this.selectedFiles.length > 0) {
            try {
              await this.uploadDocument(response.data.id_projet);
              // Success with document upload
              this.save.emit(response.data);
            } catch (uploadError) {
              console.error('Document upload error:', uploadError);
              // projet saved but document upload failed
              this.errorMessage = 'Projet enregistré mais erreur lors du téléchargement du document';
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

  // File upload handlers (support multiple)
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
      // accumulate first error
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
    
    // Handle both Date objects and string dates
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('fr-FR');
  }

  // Upload multiple documents after saving projet
  private uploadDocument(projetId: number): Promise<void> {
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
              id_entite: projetId,
              type_entite: 'projet',
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
    if (!this.projet?.id_projet) return;
    
    this.loadingDocuments = true;
    const sub = this.documentService.getByEntity('projet', this.projet.id_projet).subscribe({
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

  // Load users for responsable dropdown
  private loadUsers() {
    const s = this.userService.getAll().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.users = res.data || [];

          // If creating a new projet and no responsable selected yet,
          // default the dropdown to the currently logged-in user.
          if (!this.isEdit && (this.formData.responsable === null || this.formData.responsable === undefined)) {
            const current = this.authService.getCurrentUser();
            if (current && typeof current.id_utilisateur !== 'undefined') {
              this.formData.responsable = Number(current.id_utilisateur);
            }
          }

        } else {
          this.users = [];
          console.warn('Users API responded with non-success:', res?.message);
        }
      },
      error: (err) => {
        this.users = [];
        console.error('Failed to load users:', err);
      }
    });
    this.subs.push(s);
  }

  // View documents page with filter
  viewDocumentsPage() {
    if (!this.projet?.id_projet) return;

    this.router.navigate(['/documents'], {
      queryParams: {
        type_entite: 'projet',
        id_entite: this.projet.id_projet
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