import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../services/zone.service';
import { Zone, CreateZoneRequest } from '../models/zone.model';
import { Subscription, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, map } from 'rxjs/operators';

type FormModel = {
  commune: string;
  province: string;
  perimetre: string;
};

@Component({
  selector: 'app-zone-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #zoneForm="ngForm" class="space-y-8" autocomplete="off">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Province (Required) with suggestions dropdown (moved to be first) -->
        <div class="relative">
          <label for="province" class="block text-sm font-semibold text-gray-900 mb-2">
            Province
            <span class="text-red-500 ml-1">*</span>
          </label>

          <input
            #provinceInput
            type="text"
            id="province"
            name="province"
            [(ngModel)]="formData.province"
            #province="ngModel"
            required
            (input)="provinceInput$.next(provinceInput.value)"
            (focus)="showProvinceSuggestions = true"
            (blur)="hideProvinceSuggestionsDelayed()"
            placeholder="Ex: Rabat-Salé-Kénitra"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none hover:border-gray-400"
            [class.border-red-300]="province.invalid && province.touched"
            [class.border-green-300]="province.valid && province.touched"
            [class.border-gray-300]="province.untouched"
            autocomplete="off"
          />

          <!-- Province suggestions -->
          <ul *ngIf="showProvinceSuggestions && provinceSuggestions.length > 0"
              class="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-white border border-gray-200 shadow-lg">
            <li *ngFor="let s of provinceSuggestions" (mousedown)="selectProvince(s)"
                class="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer">
              {{ s }}
            </li>
          </ul>

          <div *ngIf="province.invalid && province.touched" class="mt-2 text-sm text-red-600">
            La province est obligatoire
          </div>
        </div>

        <!-- Commune (Required) with suggestions dropdown (moved to be second) -->
        <div class="relative">
          <label for="commune" class="block text-sm font-semibold text-gray-900 mb-2">
            Commune
            <span class="text-red-500 ml-1">*</span>
          </label>

          <input
            #communeInput
            type="text"
            id="commune"
            name="commune"
            [(ngModel)]="formData.commune"
            #commune="ngModel"
            required
            (input)="communeInput$.next(communeInput.value)"
            (focus)="showCommuneSuggestions = true"
            (blur)="hideCommuneSuggestionsDelayed()"
            placeholder="Ex: Rabat"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none hover:border-gray-400
                   disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed"
            [class.border-red-300]="commune.invalid && commune.touched"
            [class.border-green-300]="commune.valid && commune.touched"
            [class.border-gray-300]="commune.untouched"
            autocomplete="off"
          />

          <!-- Suggestions dropdown -->
          <ul *ngIf="showCommuneSuggestions && communeSuggestions.length > 0"
              class="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-white border border-gray-200 shadow-lg">
            <li *ngFor="let s of communeSuggestions" (mousedown)="selectCommune(s)"
                class="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer">
              {{ s }}
            </li>
          </ul>

          <div *ngIf="commune.invalid && commune.touched" class="mt-2 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            La commune est obligatoire
          </div>
        </div>

        <!-- Perimetre (Required) -->
        <div class="lg:col-span-2">
          <label for="perimetre" class="block text-sm font-semibold text-gray-900 mb-2">
            Périmètre
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="perimetre"
            name="perimetre"
            [(ngModel)]="formData.perimetre"
            #perimetre="ngModel"
            required
            placeholder="Ex: Bouregreg et Chaouia"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none hover:border-gray-400"
            [class.border-red-300]="perimetre.invalid && perimetre.touched"
            [class.border-green-300]="perimetre.valid && perimetre.touched"
            [class.border-gray-300]="perimetre.untouched"
          />
          <div *ngIf="perimetre.invalid && perimetre.touched" class="mt-2 text-sm text-red-600">
            Le périmètre est obligatoire
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="rounded-xl bg-red-50 border-2 border-red-200 p-4 animate-fadeIn">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
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
        <button type="button" (click)="onCancel()" class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 ease-in-out">
          Annuler
        </button>
        <button type="submit" [disabled]="!isFormValid() || saving" class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-transparent rounded-xl text-sm font-semibold text-white transition-all duration-200 ease-in-out transform disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:scale-[1.02] enabled:active:scale-[0.98]" [class.bg-indigo-600]="isFormValid() && !saving" [class.hover:bg-indigo-700]="isFormValid() && !saving" [class.focus:ring-4]="isFormValid() && !saving" [class.focus:ring-indigo-200]="isFormValid() && !saving" [class.focus:outline-none]="isFormValid() && !saving" [class.bg-gray-400]="!isFormValid() || saving">
          <svg *ngIf="saving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span *ngIf="saving">Enregistrement...</span>
          <span *ngIf="!saving && isEdit">Mettre à jour la zone</span>
          <span *ngIf="!saving && !isEdit">Créer la zone</span>
        </button>
      </div>
    </form>

    <style>
      @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    </style>
  `
})
export class ZoneFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() zone: Zone | null = null;
  @Output() save = new EventEmitter<Zone>();
  @Output() cancel = new EventEmitter<void>();

  formData: FormModel = {
    commune: '',
    province: '',
    perimetre: ''
  };

  saving = false;
  errorMessage = '';
  isEdit = false;

  // Autocomplete / suggestions sources
  provinces: string[] = [];
  communes: string[] = [];

  // Suggestions shown to user
  provinceSuggestions: string[] = [];
  communeSuggestions: string[] = [];

  // Subjects and UI state
  provinceInput$ = new Subject<string>();
  communeInput$ = new Subject<string>();
  showProvinceSuggestions = false;
  showCommuneSuggestions = false;

  private subs: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(private zoneService: ZoneService) {}

  ngOnInit() {
    this.initializeForm();

    // load provinces once
    this.loadProvinces();

    // province typing -> filter local provinces suggestions and (optionally) load communes if exact match selected
    this.provinceInput$.pipe(
      debounceTime(250),
      map(v => (v || '').trim()),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      if (!val) {
        this.provinceSuggestions = [];
        this.communes = [];
        this.communeSuggestions = [];
        return;
      }

      // filter local provinces loaded from stats
      const lower = val.toLowerCase();
      this.provinceSuggestions = this.provinces.filter(p => p.toLowerCase().includes(lower)).slice(0, 20);

      // if typed exactly matches an existing province (case-insensitive) load communes for it
      const exact = this.provinces.find(p => p.toLowerCase() === lower);
      if (exact) {
        this.loadCommunesForProvince(exact);
      } else {
        // clear communes until user picks or types a province
        this.communes = [];
        this.communeSuggestions = [];
      }
    });

    // commune typing -> filter communes suggestions (communes are loaded when province is set/selected)
    this.communeInput$.pipe(
      debounceTime(150),
      map(v => (v || '').trim()),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      if (!val) {
        this.communeSuggestions = this.communes.slice(0, 20);
        return;
      }
      const lower = val.toLowerCase();
      this.communeSuggestions = this.communes.filter(c => c.toLowerCase().includes(lower)).slice(0, 20);
    });

    // initialize suggestions if editing
    if (this.formData.province) {
      this.loadCommunesForProvince(this.formData.province);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['zone']) {
      this.initializeForm();
      if (this.formData.province) {
        this.loadCommunesForProvince(this.formData.province);
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subs.forEach(s => s.unsubscribe());
  }

  isFormValid(): boolean {
    return !!(
      this.formData.commune && this.formData.commune.trim() &&
      this.formData.province && this.formData.province.trim() &&
      this.formData.perimetre && this.formData.perimetre.trim()
    );
  }

  private initializeForm() {
    if (this.zone && this.zone.id_zone) {
      this.isEdit = true;
      this.formData = {
        commune: this.zone.commune || '',
        province: this.zone.province || '',
        perimetre: this.zone.perimetre || ''
      };
    } else {
      this.isEdit = false;
      this.formData = { commune: '', province: '', perimetre: '' };
    }
  }

  private loadProvinces() {
    const s = this.zoneService.getStats().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.par_province) {
          this.provinces = Object.keys(res.data.par_province).sort();
        } else {
          this.provinces = [];
        }
      },
      error: (err) => {
        console.error('Failed to load provinces for autocomplete:', err);
        this.provinces = [];
      }
    });
    this.subs.push(s);
  }

  private loadCommunesForProvince(province?: string) {
    const prov = (province || '').trim();
    if (!prov) {
      this.communes = [];
      this.communeSuggestions = [];
      return;
    }

    const s = this.zoneService.getByProvince(prov).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const set = new Set<string>();
          res.data.forEach(z => {
            if (z.commune && z.commune.trim()) {
              set.add(z.commune.trim());
            }
          });
          this.communes = Array.from(set).sort();
          // initialize suggestions if user has already typed something
          const typed = (this.formData.commune || '').trim().toLowerCase();
          this.communeSuggestions = typed ? this.communes.filter(c => c.toLowerCase().includes(typed)).slice(0, 20) : this.communes.slice(0, 20);
        } else {
          this.communes = [];
          this.communeSuggestions = [];
        }
      },
      error: (err) => {
        console.error('Failed to load communes for province:', err);
        this.communes = [];
        this.communeSuggestions = [];
      }
    });
    this.subs.push(s);
  }

  // Called when user selects a province suggestion
  selectProvince(value: string) {
    this.formData.province = value;
    this.provinceSuggestions = [];
    this.showProvinceSuggestions = false;
    this.loadCommunesForProvince(value);
  }

  // Called when user selects a commune suggestion
  selectCommune(value: string) {
    this.formData.commune = value;
    this.communeSuggestions = [];
    this.showCommuneSuggestions = false;
  }

  // hide suggestions after a short delay so click handlers can run
  hideProvinceSuggestionsDelayed() {
    setTimeout(() => this.showProvinceSuggestions = false, 180);
  }
  hideCommuneSuggestionsDelayed() {
    setTimeout(() => this.showCommuneSuggestions = false, 180);
  }

  onSubmit() {
    if (this.saving || !this.isFormValid()) return;

    this.saving = true;
    this.errorMessage = '';

    try {
      const payload: CreateZoneRequest = {
        commune: this.formData.commune.trim(),
        province: this.formData.province.trim(),
        perimetre: this.formData.perimetre.trim()
      };

      const operation = this.isEdit && this.zone
        ? this.zoneService.update(this.zone.id_zone, payload)
        : this.zoneService.create(payload);

      const sub = operation.subscribe({
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
          this.errorMessage = error.error?.message || error.message || 'Erreur lors de l\'enregistrement';
          this.saving = false;
        }
      });
      this.subs.push(sub);
    } catch (error: any) {
      console.error('Form submission error:', error);
      this.errorMessage = error?.message || 'Erreur lors de la préparation des données';
      this.saving = false;
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
