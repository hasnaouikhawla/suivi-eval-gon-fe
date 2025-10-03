import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CadreLogiqueService } from '../services/cadre-logique.service';
import { CadreLogique, CreateCadreLogiqueRequest, CadreLogiqueNiveau } from '../models/cadre-logique.model';

type FormModel = {
  intitule: string;
  niveau: CadreLogiqueNiveau;
  parent_id: number | null;
  ordre: number | null;
  observations: string;
};

@Component({
  selector: 'app-cadre-logique-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #cadreLogiqueForm="ngForm" class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Intitulé (Required) -->
        <div class="lg:col-span-2">
          <label for="intitule" class="block text-sm font-semibold text-gray-900 mb-2">
            Intitulé
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
              placeholder="Ex: Améliorer l'accès aux services de base">
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

        <!-- Niveau (Required) -->
        <div>
          <label for="niveau" class="block text-sm font-semibold text-gray-900 mb-2">
            Niveau
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="niveau"
              name="niveau"
              [(ngModel)]="formData.niveau"
              #niveau="ngModel"
              required
              (change)="onNiveauChange()"
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="niveau.invalid && niveau.touched"
              [class.border-green-300]="niveau.valid && niveau.touched"
              [class.border-gray-300]="niveau.untouched">
              <option value="">Sélectionner un niveau</option>
              <option value="Objectif global">Objectif global</option>
              <option value="Objectif spécifique">Objectif spécifique</option>
              <option value="Résultat">Résultat</option>
              <option value="Activité">Activité</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="niveau.invalid && niveau.touched" class="mt-2 text-sm text-red-600">
            Le niveau est obligatoire
          </div>
        </div>

        <!-- Parent (Optional for global, required otherwise) -->
        <div>
          <label for="parent_id" class="block text-sm font-semibold text-gray-900 mb-2">
            Élément parent
            <span class="text-gray-500 text-xs ml-1" *ngIf="formData.niveau === 'Objectif global'">(optionnel)</span>
            <span class="text-red-500 text-xs ml-1" *ngIf="formData.niveau !== 'Objectif global'">(requis)</span>
          </label>
          <div class="relative">
            <select
              id="parent_id"
              name="parent_id"
              [(ngModel)]="formData.parent_id"
              [required]="formData.niveau !== 'Objectif global'"
              class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white">
              <!-- Only show the 'no parent' option when creating/updating Objectif global -->
              <option *ngIf="formData.niveau === 'Objectif global'" [value]="null">Aucun parent (racine)</option>

              <!-- Parent options are already filtered to the direct previous niveau -->
              <option [value]="element.id_cadre" *ngFor="let element of parentOptions">
                {{ element.intitule }} ({{ element.niveau }})
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Ordre -->
        <div>
          <label for="ordre" class="block text-sm font-semibold text-gray-900 mb-2">
            Ordre
            <span class="text-gray-500 text-xs ml-1">(optionnel)</span>
          </label>
          <input
            type="number"
            id="ordre"
            name="ordre"
            [(ngModel)]="formData.ordre"
            min="1"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            placeholder="Ex: 1">
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
          [disabled]="!isFormValid() || saving"
          class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-transparent rounded-xl text-sm font-semibold text-white 
                 transition-all duration-200 ease-in-out transform
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                 enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
          [class.bg-indigo-600]="isFormValid() && !saving"
          [class.hover:bg-indigo-700]="isFormValid() && !saving"
          [class.focus:ring-4]="isFormValid() && !saving"
          [class.focus:ring-indigo-200]="isFormValid() && !saving"
          [class.focus:outline-none]="isFormValid() && !saving"
          [class.bg-gray-400]="!isFormValid() || saving">
          <svg *ngIf="saving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span *ngIf="saving">Enregistrement...</span>
          <span *ngIf="!saving && isEdit">Mettre à jour l'élément</span>
          <span *ngIf="!saving && !isEdit">Créer l'élément</span>
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
export class CadreLogiqueFormComponent implements OnInit, OnChanges {
  @Input() cadreLogique: CadreLogique | null = null;
  @Output() save = new EventEmitter<CadreLogique>();
  @Output() cancel = new EventEmitter<void>();

  formData: FormModel = {
    intitule: '',
    niveau: 'Objectif global',
    parent_id: null,
    ordre: null,
    observations: ''
  };

  parentOptions: CadreLogique[] = [];
  saving = false;
  errorMessage = '';
  isEdit = false;

  constructor(private cadreLogiqueService: CadreLogiqueService) {}

  ngOnInit() {
    this.initializeForm();
    this.loadParentOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cadreLogique']) {
      this.initializeForm();
      this.loadParentOptions();
    }
  }

  isFormValid(): boolean {
    const base = !!(this.formData.intitule && this.formData.intitule.trim() && this.formData.niveau);
    // Only Objectif global can be root; for all other niveaux parent is required
    if (this.formData.niveau === 'Objectif global') {
      return base;
    }
    return base && (this.formData.parent_id !== null && this.formData.parent_id !== undefined);
  }

  private initializeForm() {
    if (this.cadreLogique && this.cadreLogique.id_cadre) {
      this.isEdit = true;
      this.formData = {
        intitule: this.cadreLogique.intitule || '',
        niveau: this.cadreLogique.niveau || 'Objectif global',
        parent_id: this.cadreLogique.parent_id || null,
        ordre: this.cadreLogique.ordre || null,
        observations: this.cadreLogique.observations || ''
      };
    } else {
      this.isEdit = false;
      this.formData = {
        intitule: '',
        niveau: 'Objectif global',
        parent_id: null,
        ordre: null,
        observations: ''
      };
    }
  }

  /**
   * Return the direct previous niveau for a given niveau.
   * If niveau is 'Objectif global' returns null (no parent allowed).
   */
  private getPreviousNiveau(niveau: CadreLogiqueNiveau | string): CadreLogiqueNiveau | null {
    switch (niveau) {
      case 'Objectif spécifique':
        return 'Objectif global';
      case 'Résultat':
        return 'Objectif spécifique';
      case 'Activité':
        return 'Résultat';
      case 'Objectif global':
      default:
        return null;
    }
  }

  /**
   * Load parent options filtered to only those having the direct previous niveau.
   * Uses getByLevel to fetch only the relevant level (more efficient).
   * - If niveau is 'Objectif global' parentOptions will be empty (no parents).
   * - When editing, ensure the current parent remains in options even if edge-case mismatches occur.
   */
  loadParentOptions(niveau?: CadreLogiqueNiveau, callback?: () => void) {
    const levelToCheck = niveau || this.formData.niveau;
    const prev = this.getPreviousNiveau(levelToCheck);

    if (!prev) {
      // Objectif global -> no parents allowed
      this.parentOptions = [];
      if (callback) callback();
      return;
    }

    this.cadreLogiqueService.getByLevel(prev).subscribe({
      next: (response) => {
        if (response.success) {
          // filter out self when editing
          const filtered = response.data.filter(el => !(this.isEdit && el.id_cadre === this.cadreLogique?.id_cadre));
          // ensure current parent is included if editing (edge cases)
          if (this.isEdit && this.cadreLogique?.parent_id) {
            const hasCurrentParent = filtered.some(p => p.id_cadre === this.cadreLogique!.parent_id);
            if (!hasCurrentParent) {
              // try to fetch current parent explicitly and include it if found
              this.cadreLogiqueService.getById(this.cadreLogique.parent_id!).subscribe({
                next: (resp) => {
                  if (resp.success && resp.data) {
                    filtered.push(resp.data);
                  }
                  // sort by ordre then intitule for nicer UX
                  this.parentOptions = filtered.sort((a, b) => (a.ordre || 0) - (b.ordre || 0) || (a.intitule || '').localeCompare(b.intitule || ''));
                  if (callback) callback();
                },
                error: () => {
                  this.parentOptions = filtered.sort((a, b) => (a.ordre || 0) - (b.ordre || 0) || (a.intitule || '').localeCompare(b.intitule || ''));
                  if (callback) callback();
                }
              });
              return;
            }
          }
          this.parentOptions = filtered.sort((a, b) => (a.ordre || 0) - (b.ordre || 0) || (a.intitule || '').localeCompare(b.intitule || ''));
        } else {
          this.parentOptions = [];
        }
        if (callback) callback();
      },
      error: (error) => {
        console.error('Error loading parent options:', error);
        this.parentOptions = [];
        if (callback) callback();
      }
    });
  }

  /**
   * Called when the niveau select changes.
   * Reload parent options for the newly selected niveau and clear parent_id if it's not allowed.
   */
  onNiveauChange() {
    // reload parent options for new niveau, then validate current parent_id
    this.loadParentOptions(undefined, () => {
      if (this.formData.niveau === 'Objectif global') {
        // global must be root
        this.formData.parent_id = null;
      } else {
        if (this.formData.parent_id !== null && this.formData.parent_id !== undefined) {
          const allowed = this.parentOptions.some(p => p.id_cadre === this.formData.parent_id);
          // if the currently selected parent is not allowed for the new niveau, clear it
          if (!allowed) {
            this.formData.parent_id = null;
          }
        }
      }
    });
  }

  onSubmit() {
    if (this.saving || !this.isFormValid()) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      const payload: CreateCadreLogiqueRequest = {
        intitule: this.formData.intitule.trim(),
        niveau: this.formData.niveau,
        parent_id: this.formData.parent_id || undefined,
        ordre: this.formData.ordre || undefined,
        observations: this.formData.observations || undefined
      };

      const operation = this.isEdit && this.cadreLogique
        ? this.cadreLogiqueService.update(this.cadreLogique.id_cadre, payload)
        : this.cadreLogiqueService.create(payload);

      operation.subscribe({
        next: (response) => {
          if (response.success) {
            this.save.emit(response.data);
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
    } catch (error) {
      console.error('Form submission error:', error);
      this.errorMessage = 'Erreur lors de la préparation des données';
      this.saving = false;
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}