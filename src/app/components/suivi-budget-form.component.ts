import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuiviBudgetService } from '../services/suivi-budget.service';
import { actionService } from '../services/action.service';
import { ProjetService } from '../services/projet.service';
import { SuiviBudget, CreateBudgetRequest, BudgetSummary } from '../models/suivi-budget.model';
import { Action } from '../models/action.model';
import { Projet } from '../models/projet.model';
import { DocumentService, UploadProgress } from '../services/document.service';
import { Document as DocumentModel } from '../models/document.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type FormModel = {
  type_budget: 'projet' | 'action';
  id_action: number | null;
  id_projet: number | null;
  budget_prevu: number | null;
  montant_paye: number | null;
  observations: string;
};

@Component({
  selector: 'app-suivi-budget-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #budgetForm="ngForm" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Budget Type Selection -->
        <div class="lg:col-span-2">
          <label for="type_budget" class="block text-sm font-semibold text-gray-900 mb-2">
            Type de Budget
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 hover:bg-gray-50"
                   [class.border-indigo-500]="formData.type_budget === 'projet'"
                   [class.bg-indigo-50]="formData.type_budget === 'projet'"
                   [class.border-gray-300]="formData.type_budget !== 'projet'">
              <input type="radio"
                     name="type_budget"
                     value="projet"
                     [(ngModel)]="formData.type_budget"
                     (ngModelChange)="onBudgetTypeChange()"
                     class="sr-only">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 border-2 rounded-full flex items-center justify-center"
                     [class.border-indigo-500]="formData.type_budget === 'projet'"
                     [class.border-gray-300]="formData.type_budget !== 'projet'">
                  <div class="w-2 h-2 bg-indigo-500 rounded-full"
                       [class.opacity-100]="formData.type_budget === 'projet'"
                       [class.opacity-0]="formData.type_budget !== 'projet'"></div>
                </div>
                <div>
                  <div class="font-medium text-gray-900">Budget Projet</div>
                  <div class="text-sm text-gray-500">Budget global au niveau projet</div>
                </div>
              </div>
            </label>

            <label class="relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 hover:bg-gray-50"
                   [class.border-indigo-500]="formData.type_budget === 'action'"
                   [class.bg-indigo-50]="formData.type_budget === 'action'"
                   [class.border-gray-300]="formData.type_budget !== 'action'">
              <input type="radio"
                     name="type_budget"
                     value="action"
                     [(ngModel)]="formData.type_budget"
                     (ngModelChange)="onBudgetTypeChange()"
                     class="sr-only">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 border-2 rounded-full flex items-center justify-center"
                     [class.border-indigo-500]="formData.type_budget === 'action'"
                     [class.border-gray-300]="formData.type_budget !== 'action'">
                  <div class="w-2 h-2 bg-indigo-500 rounded-full"
                       [class.opacity-100]="formData.type_budget === 'action'"
                       [class.opacity-0]="formData.type_budget !== 'action'"></div>
                </div>
                <div>
                  <div class="font-medium text-gray-900">Budget Action</div>
                  <div class="text-sm text-gray-500">Budget spécifique à une action</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Projet Selection (for projet budgets) -->
        <div *ngIf="formData.type_budget === 'projet'" class="lg:col-span-2">
          <label for="id_projet" class="block text-sm font-semibold text-gray-900 mb-2">
            Projet
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="id_projet"
              name="id_projet"
              [(ngModel)]="formData.id_projet"
              (ngModelChange)="onProjetChange($event)"
              #projet="ngModel"
              [required]="formData.type_budget === 'projet'"
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="projet.invalid && projet.touched"
              [class.border-green-300]="projet.valid && projet.touched"
              [class.border-gray-300]="projet.untouched">
              <option value="">Sélectionner un projet</option>
              <option [value]="p.id_projet" *ngFor="let p of projets">
                {{ p.titre }} - {{ p.entreprise }}
                <span *ngIf="p.province"> ({{ transformDisplayValue(p.province) }})</span>
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="projet.invalid && projet.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le projet est obligatoire pour un budget projet
          </div>

          <!-- Projet Details Display -->
          <div *ngIf="getSelectedProjet()" class="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-blue-900">{{ getSelectedProjet()?.titre }}</div>
                <div class="text-sm text-blue-700 mt-1">
                  <div><strong>Entreprise:</strong> {{ getSelectedProjet()?.entreprise }}</div>
                  <div *ngIf="getSelectedProjet()?.n_marche">
                    <strong>N° Marché:</strong> {{ getSelectedProjet()?.n_marche }}
                  </div>
                  <div *ngIf="getSelectedProjet()?.province">
                     <strong>Localisation:</strong> {{ transformDisplayValue(getSelectedProjet()?.province) }}
                  </div>
                  <div *ngIf="getSelectedProjet()?.statut">
                    <strong>Statut:</strong> 
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2"
                          [class.bg-green-100]="getSelectedProjet()?.statut === 'Terminé'"
                          [class.text-green-800]="getSelectedProjet()?.statut === 'Terminé'"
                          [class.bg-blue-100]="getSelectedProjet()?.statut === 'En cours'"
                          [class.text-blue-800]="getSelectedProjet()?.statut === 'En cours'"
                          [class.bg-yellow-100]="getSelectedProjet()?.statut === 'Planifié'"
                          [class.text-yellow-800]="getSelectedProjet()?.statut === 'Planifié'"
                          [class.bg-gray-100]="!['Terminé', 'En cours', 'Planifié'].includes(getSelectedProjet()?.statut || '')"
                          [class.text-gray-800]="!['Terminé', 'En cours', 'Planifié'].includes(getSelectedProjet()?.statut || '')">
                      {{ getSelectedProjet()?.statut }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Selection (for action budgets) -->
        <div *ngIf="formData.type_budget === 'action'" class="lg:col-span-2">
          <label for="id_action" class="block text-sm font-semibold text-gray-900 mb-2">
            Action
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="id_action"
              name="id_action"
              [(ngModel)]="formData.id_action"
              (ngModelChange)="onActionChange($event)"
              #action="ngModel"
              [required]="formData.type_budget === 'action'"
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="action.invalid && action.touched"
              [class.border-green-300]="action.valid && action.touched"
              [class.border-gray-300]="action.untouched">
              <option value="">Sélectionner une action</option>
              <optgroup *ngFor="let group of groupedActions" [label]="group.projet_titre">
                <option [value]="actionItem.id_action" *ngFor="let actionItem of group.actions">
                  {{ actionItem.type_action }} 
                  <span *ngIf="actionItem.quantite_prevue"> ({{ actionItem.quantite_prevue }} {{ actionItem.unite_mesure }})</span>
                </option>
              </optgroup>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="action.invalid && action.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            L'action est obligatoire pour un budget action
          </div>
          
          <!-- Action Details Display -->
          <div *ngIf="getSelectedAction()" class="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-blue-900">{{ getSelectedAction()?.type_action }}</div>
                <div class="text-sm text-blue-700 mt-1">
                  <div><strong>Projet:</strong> {{ getSelectedActionProject() }}</div>
                  <div *ngIf="getSelectedAction()?.quantite_prevue">
                    <strong>Quantité prévue:</strong> {{ getSelectedAction()?.quantite_prevue }} {{ getSelectedAction()?.unite_mesure }}
                  </div>
                  <div *ngIf="getSelectedAction()?.cout_total_prevu">
                    <strong>Coût total prévu:</strong> {{ formatCompactCurrency(getSelectedAction()?.cout_total_prevu || 0) }}
                  </div>
                  <div *ngIf="getSelectedAction()?.statut">
                    <strong>Statut:</strong> 
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2"
                          [class.bg-green-100]="getSelectedAction()?.statut === 'Terminée'"
                          [class.text-green-800]="getSelectedAction()?.statut === 'Terminée'"
                          [class.bg-blue-100]="getSelectedAction()?.statut === 'En cours'"
                          [class.text-blue-800]="getSelectedAction()?.statut === 'En cours'"
                          [class.bg-yellow-100]="getSelectedAction()?.statut === 'Planifiée'"
                          [class.text-yellow-800]="getSelectedAction()?.statut === 'Planifiée'"
                          [class.bg-gray-100]="!['Terminée', 'En cours', 'Planifié'].includes(getSelectedAction()?.statut || '')"
                          [class.text-gray-800]="!['Terminée', 'En cours', 'Planifié'].includes(getSelectedAction()?.statut || '')">
                      {{ getSelectedAction()?.statut }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Budget Prévu (Required) -->
        <div>
          <label for="budget_prevu" class="block text-sm font-semibold text-gray-900 mb-2">
            Budget Prévu (MAD)
            <span class="text-red-500 ml-1">*</span>
          </label>

          <!-- Loading state for entity budget check -->
          <div *ngIf="loadingEntityBudget" class="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div class="flex items-center space-x-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <span class="text-sm text-gray-600">Vérification du budget existant...</span>
            </div>
          </div>

          <!-- If there's already budgets for the selected entity and we're not editing, hide input and show the summary widget -->
          <div *ngIf="!showBudgetInput() && !loadingEntityBudget" class="p-4 rounded-lg border border-amber-200 bg-amber-50">
            <div class="flex items-start space-x-3">
              <svg class="w-6 h-6 text-amber-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="flex-1 text-sm text-amber-800">
                <div class="mt-2 text-amber-700">
                  <div><strong>Budget total prévu:</strong> 
                    <span class="font-semibold">{{ formatCompactCurrency(getCurrentBudgetPrevu()) }}</span>
                  </div>
                  <div><strong>Montant payé:</strong> 
                    <span class="font-semibold">{{ formatCompactCurrency(getDisplayedMontantPaye()) }}</span>
                  </div>
                  <div><strong>Écart:</strong> 
                    <span class="font-semibold" 
                          [class.text-green-700]="(getEcart() || 0) >= 0"
                          [class.text-red-700]="(getEcart() || 0) < 0">
                      {{ formatCompactCurrency(getEcart()) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Normal input when allowed -->
          <div *ngIf="showBudgetInput() && !loadingEntityBudget" class="relative">
            <input
              type="number"
              id="budget_prevu"
              name="budget_prevu"
              [(ngModel)]="formData.budget_prevu"
              #budgetPrevu="ngModel"
              [required]="isEdit || !entityHasBudget"
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

          <!-- Suggestion based on action cost (for action budgets only) -->
          <div *ngIf="formData.type_budget === 'action' && getSelectedAction()?.cout_total_prevu && showBudgetInput() && formData.budget_prevu !== getSelectedAction()?.cout_total_prevu" 
               class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="text-sm">
                <div class="font-medium text-blue-800">Suggestion</div>
                <div class="text-blue-700 mt-1">
                  Le coût total prévu de cette action est {{ formatCompactCurrency(getSelectedAction()?.cout_total_prevu || 0) }}.
                  <button type="button" 
                          (click)="useSuggestedBudget()"
                          class="ml-2 text-blue-800 underline hover:text-blue-900 font-medium">
                    Utiliser cette valeur
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Montant Payé -->
        <div>
          <label for="montant_paye" class="block text-sm font-semibold text-gray-900 mb-2">
            Montant Payé (MAD)
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <input
            type="number"
            id="montant_paye"
            name="montant_paye"
            [(ngModel)]="formData.montant_paye"
            min="0"
            step="0.01"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            placeholder="Ex: 50000">
          <div *ngIf="formData.montant_paye && formData.budget_prevu && formData.montant_paye > formData.budget_prevu" 
               class="mt-2 text-sm text-amber-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Le montant payé dépasse le budget prévu
          </div>
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
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400 resize-none"
            placeholder="Observations ou notes complémentaires..."></textarea>
        </div>
      </div>

      <!-- Financial Summary -->
      <div *ngIf="shouldShowFinancialSummary()" class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg class="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
          Résumé Financier
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div class="text-sm font-medium text-gray-500">Budget Prévu</div>
            <div class="text-base sm:text-xl font-bold text-blue-600">{{ formatCompactCurrency(getCurrentBudgetPrevu()) }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatFullCurrency(getCurrentBudgetPrevu()) }}
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div class="text-sm font-medium text-gray-500">Montant Payé</div>
            <div class="text-base sm:text-xl font-bold text-green-600">{{ formatCompactCurrency(getDisplayedMontantPaye()) }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ getExecutionRate() }}% du budget
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div class="text-sm font-medium text-gray-500">Écart (Solde Restant)</div>
            <div class="text-base sm:text-xl font-bold" [class.text-red-600]="getEcart() < 0" [class.text-green-600]="getEcart() >= 0">
              {{ formatCompactCurrency(getEcart()) }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatFullCurrency(getEcart()) }}
            </div>
          </div>
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
          Aucun document associé à ce suivi budget
        </div>
      </div>

      <!-- Document Upload (Optional) - MULTIPLE FILES -->
      <div class="lg:col-span-2">
        <label class="block text-sm font-semibold text-gray-900 mb-2">
          Document associé
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
          <span *ngIf="!saving && isEdit">Mettre à jour le budget</span>
          <span *ngIf="!saving && !isEdit">Créer le suivi budget</span>
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
      
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    </style>
  `
})
export class SuiviBudgetFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() suiviBudget: SuiviBudget | null = null;
  @Input() activeTab: 'projets' | 'actions' | null = null;
  @Input() projetBudgets: SuiviBudget[] = [];
  @Input() actionBudgets: SuiviBudget[] = [];
  @Input() preselectedProjetId: number | null = null;
  @Input() preselectedActionId: number | null = null;
  @Output() save = new EventEmitter<SuiviBudget>();
  @Output() cancel = new EventEmitter<void>();

  formData: FormModel = {
    type_budget: 'action',
    id_action: null,
    id_projet: null,
    budget_prevu: null,
    montant_paye: null,
    observations: ''
  };

  actions: Action[] = [];
  projets: Projet[] = [];
  groupedActions: { projet_titre: string; actions: Action[] }[] = [];
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

  // Entity budget summary state (to know if a project/action already has budgets)
  entityBudgetSummary: BudgetSummary | null = null;
  entityHasBudget = false;
  loadingEntityBudget = false;

  // Preview modal state
  showPreviewModal = false;
  previewingDocument: DocumentModel | null = null;
  previewUrl: SafeResourceUrl | null = null;
  previewContent: string | null = null;
  loadingPreview = false;

  private subs: Subscription[] = [];

  constructor(
    private suiviBudgetService: SuiviBudgetService,
    private actionService: actionService,
    private projetService: ProjetService,
    public documentService: DocumentService,
    private router: Router,
	private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadActions();
    this.loadProjets();
	this.checkForQueryParams();
  }
  
   private checkForQueryParams() {
    const sub = this.route.queryParams.subscribe(params => {
      const projetId = params['id_projet'];
      const actionId = params['id_action'];
      
      if (projetId && !this.preselectedProjetId && !this.isEdit) {
        this.preselectedProjetId = Number(projetId);
        this.formData.type_budget = 'projet';
        this.formData.id_projet = this.preselectedProjetId;
        console.log('Projet preselected from URL:', this.preselectedProjetId);
      }
      
      if (actionId && !this.preselectedActionId && !this.isEdit) {
        this.preselectedActionId = Number(actionId);
        this.formData.type_budget = 'action';
        this.formData.id_action = this.preselectedActionId;
        console.log('Action preselected from URL:', this.preselectedActionId);
      }
    });
    this.subs.push(sub);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['suiviBudget']) {
      this.initializeForm();
    }
    // Handle preselected projet changes
    if (changes['preselectedProjetId'] && this.preselectedProjetId && !this.isEdit) {
      this.formData.type_budget = 'projet';
      this.formData.id_projet = this.preselectedProjetId;
      console.log('Projet preselected in form:', this.preselectedProjetId);
      if (this.projets.length > 0) {
        this.onProjetChange(this.preselectedProjetId);
      }
    }
    // Handle preselected action changes
    if (changes['preselectedActionId'] && this.preselectedActionId && !this.isEdit) {
      this.formData.type_budget = 'action';
      this.formData.id_action = this.preselectedActionId;
      console.log('Action preselected in form:', this.preselectedActionId);
      if (this.actions.length > 0) {
        this.onActionChange(this.preselectedActionId);
      }
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.cleanupPreviewUrl();
  }

  onBudgetTypeChange() {
    // Clear relevant fields when type changes
    if (this.formData.type_budget === 'projet') {
      this.formData.id_action = null;
    } else {
      this.formData.id_projet = null;
    }
    // reset entity budget summary
    this.entityBudgetSummary = null;
    this.entityHasBudget = false;
    this.loadingEntityBudget = false;
    this.errorMessage = '';
  }

  // Called when a project is selected
  onProjetChange(newId: any) {
    this.formData.id_projet = newId ? Number(newId) : null;
    // Reset action selection just in case
    this.formData.id_action = null;
    // Load budget summary for selected projet (if any)
    if (this.formData.id_projet && !this.isEdit) {
      this.loadEntityBudgetSummary('projet', this.formData.id_projet);
    } else {
      this.entityBudgetSummary = null;
      this.entityHasBudget = false;
      this.loadingEntityBudget = false;
    }
  }

  // Called when an action is selected
  onActionChange(newId: any) {
    this.formData.id_action = newId ? Number(newId) : null;
    // Reset project selection just in case
    this.formData.id_projet = null;
    if (this.formData.id_action && !this.isEdit) {
      this.loadEntityBudgetSummary('action', this.formData.id_action);
    } else {
      this.entityBudgetSummary = null;
      this.entityHasBudget = false;
      this.loadingEntityBudget = false;
    }
  }
  
  transformDisplayValue(value: string | undefined): string {
  if (!value || value === 'default' || value.trim() === '') {
    return 'Région GON';
  }
  return value;
 }

  showBudgetInput(): boolean {
    // Always hide the budget_prevu input when editing an existing record
    if (this.isEdit) return false;

    // hide while loading
    if (this.loadingEntityBudget) return false;
    
    // If project selected, show only if that project has no budgets
    if (this.formData.type_budget === 'projet' && this.formData.id_projet) {
      return !this.entityHasBudget;
    }
    // If action selected, show only if that action has no budgets
    if (this.formData.type_budget === 'action' && this.formData.id_action) {
      return !this.entityHasBudget;
    }
    // If no entity selected, allow entering the budget (user may create a general entry)
    return true;
  }

  // Helper to display budget input validation error in template
  budgetPrevuInvalid(): boolean {
    if (!this.showBudgetInput()) return false;
    const budgetPrevu = this.formData.budget_prevu;
    const isRequired = this.isEdit || !this.entityHasBudget;
    return isRequired && (!budgetPrevu || budgetPrevu <= 0);
  }

  // Helper to determine what budget value to use in financial summary
  getCurrentBudgetPrevu(): number {
    // If user manually entered a budget in the form, prefer it
    if (this.formData.budget_prevu) {
      return this.formData.budget_prevu;
    }

    // Prefer the first existing budget_prevu for the selected entity (treated as the constant entity budget).
    // This avoids double-counting when multiple suivi entries exist for the same entity.
    const firstExisting = this.getFirstExistingBudgetForEntity();
    if (firstExisting && firstExisting > 0) {
      return firstExisting;
    }

    // Fallback to entityBudgetSummary if available and input is hidden
    if (this.entityBudgetSummary && !this.showBudgetInput()) {
      return this.entityBudgetSummary.total_budget_prevu;
    }

    return 0;
  }

  // Helper to determine when to show financial summary
  shouldShowFinancialSummary(): boolean {
     return this.getCurrentBudgetPrevu() > 0 || (this.formData.montant_paye !== null && this.formData.montant_paye > 0);
  }

  // Helper to get entity records count
  getEntityRecordsCount(): number {
    if (!this.entityBudgetSummary) return 0;
    if (this.formData.type_budget === 'projet') {
      return this.entityBudgetSummary.nombre_projets || 0;
    } else {
      return this.entityBudgetSummary.nombre_actions || 0;
    }
  }

  isFormValid(): boolean {
    const hasValidType = !!this.formData.type_budget;
    
    const hasValidEntity: boolean = Boolean(
      (this.formData.type_budget === 'projet' && this.formData.id_projet) ||
      (this.formData.type_budget === 'action' && this.formData.id_action)
    );
    
    // Budget prévu validation - required if we're showing the input OR if editing
    const requiresBudgetInput = this.showBudgetInput() && (this.isEdit || !this.entityHasBudget);
    const hasValidBudget = requiresBudgetInput ? 
      !!(this.formData.budget_prevu && this.formData.budget_prevu > 0) : 
      true;
    
    // Ensure validPayment is always boolean
    let validPayment = true;
    if (this.formData.montant_paye !== null && this.formData.montant_paye !== undefined) {
      validPayment = this.formData.montant_paye >= 0;
    }

    return hasValidType && hasValidEntity && hasValidBudget && validPayment;
  }

  getSelectedAction(): Action | null {
    if (!this.formData.id_action || this.formData.type_budget !== 'action') return null;
    return this.actions.find(a => a.id_action === this.formData.id_action) || null;
  }

  getSelectedProjet(): Projet | null {
    if (!this.formData.id_projet || this.formData.type_budget !== 'projet') return null;
    return this.projets.find(p => p.id_projet === this.formData.id_projet) || null;
  }

  getSelectedActionProject(): string {
    const action = this.getSelectedAction();
    if (!action) return '';
    
    const group = this.groupedActions.find(g => 
      g.actions.some(a => a.id_action === action.id_action)
    );
    return group?.projet_titre || '';
  }

  useSuggestedBudget() {
    const action = this.getSelectedAction();
    if (action?.cout_total_prevu && this.formData.type_budget === 'action') {
      this.formData.budget_prevu = action.cout_total_prevu;
    }
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

    // reset entity budget state
    this.entityBudgetSummary = null;
    this.entityHasBudget = false;
    this.loadingEntityBudget = false;

    if (this.suiviBudget && this.suiviBudget.id_budget) {
      this.isEdit = true;
      this.formData = {
        type_budget: this.suiviBudget.type_budget,
        id_action: this.suiviBudget.id_action || null,
        id_projet: this.suiviBudget.id_projet || null,
        budget_prevu: this.suiviBudget.budget_prevu || null,
        montant_paye: this.suiviBudget.montant_paye || null,
        observations: this.suiviBudget.observations || ''
      };
      // Load existing documents for this suiviBudget
      this.loadExistingDocuments();

      // If editing, also load budget summary for associated entity to display context
      if (this.formData.id_projet) {
        this.loadEntityBudgetSummary('projet', this.formData.id_projet);
      } else if (this.formData.id_action) {
        this.loadEntityBudgetSummary('action', this.formData.id_action);
      }
    } else {
      this.isEdit = false;
      // Pre-select budget type and entity based on activeTab or preselected values
      let defaultBudgetType: 'projet' | 'action' = 'projet';
      let defaultProjetId: number | null = null;
      let defaultActionId: number | null = null;
      
      if (this.preselectedProjetId) {
        defaultBudgetType = 'projet';
        defaultProjetId = this.preselectedProjetId;
      } else if (this.preselectedActionId) {
        defaultBudgetType = 'action';
        defaultActionId = this.preselectedActionId;
      } else if (this.activeTab === 'actions') {
        defaultBudgetType = 'action';
      }
      
      this.formData = {
        type_budget: defaultBudgetType,
        id_action: defaultActionId,
        id_projet: defaultProjetId,
        budget_prevu: null,
        montant_paye: null,
        observations: ''
      };
    }
  }

  private loadActions() {
    const s = this.actionService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.actions = response.data || [];
          this.groupActionsByProject();
		  // If actions are loaded and we have a preselected action, set it
          if (this.preselectedActionId && this.formData.id_action) {
            this.onActionChange(this.preselectedActionId);
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading actions:', error);
      }
    });
    this.subs.push(s);
  }

  private loadProjets() {
    const s = this.projetService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.projets = response.data || [];
		   // If projets are loaded and we have a preselected projet, set it
          if (this.preselectedProjetId && this.formData.id_projet) {
            this.onProjetChange(this.preselectedProjetId);
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading projets:', error);
      }
    });
    this.subs.push(s);
  }

  private groupActionsByProject() {
    const grouped: { [key: string]: { projet_titre: string; actions: Action[] } } = {};
    
    this.actions.forEach(action => {
      const projetTitre = action.projet_titre || 'Projet non défini';
      
      if (!grouped[projetTitre]) {
        grouped[projetTitre] = {
          projet_titre: projetTitre,
          actions: []
        };
      }
      
      grouped[projetTitre].actions.push(action);
    });

    this.groupedActions = Object.values(grouped).sort((a, b) => 
      a.projet_titre.localeCompare(b.projet_titre)
    );
  }

  // Returns the displayed montant payé: existing entity paid amount (if any) + current form field
  getDisplayedMontantPaye(): number {
  const existingPaid = this.entityBudgetSummary?.total_montant_paye || 0;
  const currentField = Number(this.formData.montant_paye || 0);

  // When editing, entityBudgetSummary already includes the original montant_paye for this entry.
  // Subtract the original value then add the current form value so the displayed total reflects
  // the true sum across all entries after the edit (avoids double-counting).
  if (this.isEdit && this.suiviBudget) {
    const original = Number(this.suiviBudget.montant_paye || 0);
    return existingPaid - original + currentField;
  }

  return existingPaid + currentField;
  }

  // Helper to determine execution rate shown in the financial summary (uses displayed total paid)
  getExecutionRate(): string {
    const budgetPrevu = this.getCurrentBudgetPrevu();
    if (!budgetPrevu || budgetPrevu === 0) return '0';
    const rate = (this.getDisplayedMontantPaye() / budgetPrevu) * 100;
    return rate.toFixed(1);
  }

  // Compute the remaining balance (écart) using the displayed total paid
  getEcart(): number {
    return this.getCurrentBudgetPrevu() - this.getDisplayedMontantPaye();
  }

  // Compact currency formatting for Financial Summary (K/M format)
  formatCompactCurrency(amount: number): string {
    if (!amount && amount !== 0) return '0 MAD';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M MAD`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K MAD`;
    } else {
      return `${(amount || 0).toFixed(0)} MAD`;
    }
  }

    // Full currency formatting for detailed view (shown below compact format)
  formatFullCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' MAD';
  }

  // Replace the existing onSubmit() method in suivi-budget-form.component.ts with this implementation.
onSubmit() {
  if (this.saving || !this.isFormValid()) return;

  this.saving = true;
  this.errorMessage = '';

  try {
    
    let budgetPrevuToSend: number = 0;

    if (this.isEdit) {
      budgetPrevuToSend = Number(
        this.formData.budget_prevu ?? this.suiviBudget?.budget_prevu ?? 0
      );
    } else {
      if (this.showBudgetInput()) {
        // creating and user is entering a budget
        budgetPrevuToSend = Number(this.formData.budget_prevu ?? 0);
      } else {
        // creating and input is hidden because entity already has budget(s)
        // use the first existing budget entry's budget_prevu amount (which should be constant for the entity)
        const firstExistingBudget = this.getFirstExistingBudgetForEntity();
        budgetPrevuToSend = firstExistingBudget || 0;
      }
    }

    const payload: CreateBudgetRequest = {
      type_budget: this.formData.type_budget,
      id_action: this.formData.type_budget === 'action' ? this.formData.id_action : null,
      id_projet: this.formData.type_budget === 'projet' ? this.formData.id_projet : null,
      budget_prevu: budgetPrevuToSend,
      montant_paye: this.formData.montant_paye || 0,
	  date_entree: new Date().toISOString().slice(0, 10),
      observations: this.formData.observations || undefined
    };

    const operation = this.isEdit && this.suiviBudget
      ? this.suiviBudgetService.update(this.suiviBudget.id_budget, payload)
      : this.suiviBudgetService.create(payload);

    const sub = operation.subscribe({
      next: async (response: any) => {
        if (response.success) {
          // If there are files to upload, upload them after saving the suiviBudget
          if (this.selectedFiles.length > 0) {
            try {
              await this.uploadDocument(response.data.id_budget);
              // Success with document upload
              this.save.emit(response.data);
            } catch (uploadError) {
              console.error('Document upload error:', uploadError);
              // SuiviBudget saved but document upload failed
              this.errorMessage = 'Suivi budget enregistré mais erreur lors du téléchargement du document';
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
  
   private getFirstExistingBudgetForEntity(): number {
    if (!this.formData.id_projet && !this.formData.id_action) {
      return 0;
    }

    // Look through the current tab budgets to find existing entries for this entity
    const currentBudgets = this.activeTab === 'projets' ? this.projetBudgets : this.actionBudgets;
    
    if (this.formData.type_budget === 'projet' && this.formData.id_projet) {
      const existingBudget = currentBudgets.find(b => 
        b.type_budget === 'projet' && b.id_projet === this.formData.id_projet
      );
      return existingBudget ? Number(existingBudget.budget_prevu) : 0;
    }
    
    if (this.formData.type_budget === 'action' && this.formData.id_action) {
      const existingBudget = currentBudgets.find(b => 
        b.type_budget === 'action' && b.id_action === this.formData.id_action
      );
      return existingBudget ? Number(existingBudget.budget_prevu) : 0;
    }
    
    return 0;
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

    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('fr-FR');
  }

  // Upload multiple documents after saving suiviBudget
  private uploadDocument(budgetId: number): Promise<void> {
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
              id_entite: budgetId,
              type_entite: 'suivi_budget',
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
    if (!this.suiviBudget?.id_budget) return;

    this.loadingDocuments = true;
    const sub = this.documentService.getByEntity('suivi_budget', this.suiviBudget.id_budget).subscribe({
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

  // Load budget execution summary for a project or action to determine if a budget already exists
  private loadEntityBudgetSummary(type: 'projet' | 'action', id: number) {
    if (!id) return;

    this.entityBudgetSummary = null;
    this.entityHasBudget = false;
    this.loadingEntityBudget = true;

    let sub;
    if (type === 'projet') {
      sub = this.suiviBudgetService.getBudgetExecutionSummary(id, undefined).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.entityBudgetSummary = response.data;
            // Consider entity has budget if there's existing budget_prevu > 0 OR if there are existing budget records
            this.entityHasBudget = !!(
              (response.data.total_budget_prevu && response.data.total_budget_prevu > 0) ||
              (response.data.nombre_projets && response.data.nombre_projets > 0) ||
              (response.data.nombre_actions && response.data.nombre_actions > 0)
            );
          } else {
            this.entityBudgetSummary = null;
            this.entityHasBudget = false;
          }
          this.loadingEntityBudget = false;
        },
        error: (error) => {
          console.error('Error loading budget summary for project:', error);
          this.entityBudgetSummary = null;
          this.entityHasBudget = false;
          this.loadingEntityBudget = false;
        }
      });
    } else {
      // action
      sub = this.suiviBudgetService.getBudgetExecutionSummary(undefined, id).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.entityBudgetSummary = response.data;
            // Consider entity has budget if there's existing budget_prevu > 0 OR if there are existing budget records
            this.entityHasBudget = !!(
              (response.data.total_budget_prevu && response.data.total_budget_prevu > 0) ||
              (response.data.nombre_projets && response.data.nombre_projets > 0) ||
              (response.data.nombre_actions && response.data.nombre_actions > 0)
            );
          } else {
            this.entityBudgetSummary = null;
            this.entityHasBudget = false;
          }
          this.loadingEntityBudget = false;
        },
        error: (error) => {
          console.error('Error loading budget summary for action:', error);
          this.entityBudgetSummary = null;
          this.entityHasBudget = false;
          this.loadingEntityBudget = false;
        }
      });
    }

    if (sub) this.subs.push(sub);
  }

  // View documents page with filter
  viewDocumentsPage() {
    if (!this.suiviBudget?.id_budget) return;

    this.router.navigate(['/documents'], {
      queryParams: {
        type_entite: 'suivi_budget',
        id_entite: this.suiviBudget.id_budget
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
