import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User, CreateUserRequest, UserRole } from '../models/user.model';
import { ZoneService } from '../services/zone.service';

type FormModel = {
  prenom: string;
  nom: string;
  login: string;
  email: string;
  password: string;
  role: UserRole | '';
  structure: string;
  actif: boolean;
  provinces?: string[]; // optional multi-select
  communes?: string[];  // optional multi-select
};

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" #userForm="ngForm" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Prénom -->
        <div>
          <label for="prenom" class="block text-sm font-semibold text-gray-900 mb-2">
            Prénom
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            [(ngModel)]="formData.prenom"
            #prenom="ngModel"
            required
            maxlength="50"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="prenom.invalid && prenom.touched"
            [class.border-green-300]="prenom.valid && prenom.touched"
            [class.border-gray-300]="prenom.untouched"
            placeholder="Ex: Jean">
          <div *ngIf="prenom.invalid && prenom.touched" class="mt-2 text-sm text-red-600">
            Le prénom est obligatoire
          </div>
        </div>

        <!-- Nom -->
        <div>
          <label for="nom" class="block text-sm font-semibold text-gray-900 mb-2">
            Nom
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            [(ngModel)]="formData.nom"
            #nom="ngModel"
            required
            maxlength="50"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="nom.invalid && nom.touched"
            [class.border-green-300]="nom.valid && nom.touched"
            [class.border-gray-300]="nom.untouched"
            placeholder="Ex: Dupont">
          <div *ngIf="nom.invalid && nom.touched" class="mt-2 text-sm text-red-600">
            Le nom est obligatoire
          </div>
        </div>

        <!-- Login -->
        <div>
          <label for="login" class="block text-sm font-semibold text-gray-900 mb-2">
            Nom d'utilisateur
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            id="login"
            name="login"
            [(ngModel)]="formData.login"
            #login="ngModel"
            required
            maxlength="30"
            pattern="^[a-zA-Z0-9._-]+$"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="login.invalid && login.touched"
            [class.border-green-300]="login.valid && login.touched"
            [class.border-gray-300]="login.untouched"
            placeholder="Ex: jdupont">
          <div *ngIf="login.invalid && login.touched" class="mt-2 text-sm text-red-600">
            <div *ngIf="login.errors?.['required']">Le nom d'utilisateur est obligatoire</div>
            <div *ngIf="login.errors?.['pattern']">Seuls les lettres, chiffres, points, tirets et underscores sont autorisés</div>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-900 mb-2">
            Email
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            [(ngModel)]="formData.email"
            #email="ngModel"
            required
            email
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="email.invalid && email.touched"
            [class.border-green-300]="email.valid && email.touched"
            [class.border-gray-300]="email.untouched"
            placeholder="Ex: jean.dupont@example.com">
          <div *ngIf="email.invalid && email.touched" class="mt-2 text-sm text-red-600">
            <div *ngIf="email.errors?.['required']">L'email est obligatoire</div>
            <div *ngIf="email.errors?.['email']">Format d'email invalide</div>
          </div>
        </div>

        <!-- Password (only for create) -->
        <div *ngIf="!isEdit">
          <label for="password" class="block text-sm font-semibold text-gray-900 mb-2">
            Mot de passe
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            [(ngModel)]="formData.password"
            #password="ngModel"
            required
            minlength="8"
            class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            [class.border-red-300]="password.invalid && password.touched"
            [class.border-green-300]="password.valid && password.touched"
            [class.border-gray-300]="password.untouched"
            placeholder="Minimum 8 caractères">
          <div *ngIf="password.invalid && password.touched" class="mt-2 text-sm text-red-600">
            <div *ngIf="password.errors?.['required']">Le mot de passe est obligatoire</div>
            <div *ngIf="password.errors?.['minlength']">Le mot de passe doit contenir au moins 8 caractères</div>
          </div>
        </div>

        <!-- Role -->
        <div>
          <label for="role" class="block text-sm font-semibold text-gray-900 mb-2">
            Rôle
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="role"
              name="role"
              [(ngModel)]="formData.role"
              #role="ngModel"
              required
              class="block w-full px-4 py-3 text-sm border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                     focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                     hover:border-gray-400 appearance-none bg-white"
              [class.border-red-300]="role.invalid && role.touched"
              [class.border-green-300]="role.valid && role.touched"
              [class.border-gray-300]="role.untouched">
              <option value="">Sélectionner un rôle</option>
              <option value="Admin">Administrateur</option>
              <option value="Coordinateur">Coordinateur</option>
              <option value="Opérateur">Opérateur</option>
              <option value="Observateur">Observateur</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div *ngIf="role.invalid && role.touched" class="mt-2 text-sm text-red-600">
            Le rôle est obligatoire
          </div>
        </div>

        <!-- Structure -->
        <div class="md:col-span-2">
          <label for="structure" class="block text-sm font-semibold text-gray-900 mb-2">
            Structure
          </label>
          <input
            type="text"
            id="structure"
            name="structure"
            [(ngModel)]="formData.structure"
            maxlength="100"
            class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                   focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                   hover:border-gray-400"
            placeholder="Ex: Ministère, Direction, Service...">
        </div>

        <!-- Provinces (checkbox list with search & quick actions, optional) -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Provinces (optionnel)
          </label>

          <div class="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Rechercher une province..."
              [(ngModel)]="provincesFilter"
              class="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-indigo-400"
            />
            <button type="button" (click)="selectAllProvinces()" class="px-3 py-2 text-xs bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700">Tout</button>
            <button type="button" (click)="clearProvinces()" class="px-1 py-2 text-xs bg-indigo-50 border border-gray-200 rounded-md">Effacer</button>
          </div>

          <div class="max-h-44 overflow-auto border-2 rounded-xl p-2 bg-white">
            <div *ngIf="filteredProvinces.length === 0" class="text-xs text-gray-500 py-4 text-center">
              Aucune province trouvée
            </div>
            <div *ngFor="let p of filteredProvinces; trackBy: trackByValue" class="flex items-center py-1 px-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                [id]="'prov-' + p"
                [checked]="isSelected('provinces', p)"
                (change)="toggleSelection('provinces', p)"
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label [for]="'prov-' + p" class="ml-3 text-sm text-gray-700 cursor-pointer">{{ p }}</label>
            </div>
          </div>

          <div class="mt-2 text-xs text-gray-600">
            Sélectionnées: <span class="font-medium text-gray-800">{{ formData.provinces?.length || 0 }}</span>
          </div>
        </div>

        <!-- Communes (checkbox list with search & quick actions, optional) -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-2">
            Communes (optionnel)
          </label>

          <div class="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Rechercher une commune..."
              [(ngModel)]="communesFilter"
              class="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-indigo-400"
            />
            <button type="button" (click)="selectAllCommunes()" class="px-3 py-2 text-xs bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700">Tout</button>
            <button type="button" (click)="clearCommunes()" class="px-1 py-2 text-xs bg-indigo-50 border border-gray-200 rounded-md">Effacer</button>
          </div>

          <div class="max-h-44 overflow-auto border-2 rounded-xl p-2 bg-white">
            <div *ngIf="filteredCommunes.length === 0" class="text-xs text-gray-500 py-4 text-center">
              Aucune commune trouvée
            </div>
            <div *ngFor="let c of filteredCommunes; trackBy: trackByValue" class="flex items-center py-1 px-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                [id]="'comm-' + c"
                [checked]="isSelected('communes', c)"
                (change)="toggleSelection('communes', c)"
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label [for]="'comm-' + c" class="ml-3 text-sm text-gray-700 cursor-pointer">{{ c }}</label>
            </div>
          </div>

          <div class="mt-2 text-xs text-gray-600">
            Sélectionnées: <span class="font-medium text-gray-800">{{ formData.communes?.length || 0 }}</span>
          </div>
        </div>

        <!-- Statut (only for edit) -->
        <div *ngIf="isEdit" class="md:col-span-2">
          <label class="flex items-center">
            <input
              type="checkbox"
              name="actif"
              [(ngModel)]="formData.actif"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <span class="ml-3 text-sm font-medium text-gray-700">Compte actif</span>
          </label>
        </div>
      </div>

      <!-- Role Description -->
      <div *ngIf="formData.role" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 class="text-sm font-semibold text-blue-900 mb-2">Permissions du rôle {{ getRoleDisplayName(formData.role) }}:</h4>
        <div class="text-xs text-blue-800 space-y-1">
          <div *ngFor="let permission of getRolePermissions(formData.role)">• {{ permission }}</div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-semibold text-red-800">Erreur</h3>
            <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0 pt-6 border-t border-gray-200">
        <button
          type="button"
          (click)="onCancel()"
          class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white 
                 hover:bg-gray-50 hover:border-gray-400 
                 focus:outline-none focus:ring-4 focus:ring-gray-200
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
          <span *ngIf="saving">{{ isEdit ? 'Mise à jour...' : 'Création...' }}</span>
          <span *ngIf="!saving && isEdit">Mettre à jour</span>
          <span *ngIf="!saving && !isEdit">Créer l'utilisateur</span>
        </button>
      </div>
    </form>
  `
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();

  formData: FormModel = {
    prenom: '',
    nom: '',
    login: '',
    email: '',
    password: '',
    role: '',
    structure: '',
    actif: true,
    provinces: [],
    communes: []
  };

  provincesOptions: string[] = [];
  communesOptions: string[] = [];

  provincesFilter = '';
  communesFilter = '';

  saving = false;
  errorMessage = '';
  isEdit = false;

  constructor(private userService: UserService, private zoneService: ZoneService) {}

  ngOnInit() {
    this.initializeForm();
    this.loadZoneOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user']) {
      this.initializeForm();
    }
  }

  private loadZoneOptions() {
    // Load zones and extract unique provinces and communes for select options
    this.zoneService.getAll().subscribe({
      next: (resp) => {
        if (resp && resp.success && Array.isArray((resp as any).data)) {
          const zones = (resp as any).data;
          const provincesSet = new Set<string>();
          const communesSet = new Set<string>();

          zones.forEach((z: any) => {
            if (z.province) provincesSet.add(z.province);
            if (z.commune) communesSet.add(z.commune);
          });

          // Convert to sorted arrays
          this.provincesOptions = Array.from(provincesSet).sort((a, b) => a.localeCompare(b, 'fr'));
          this.communesOptions = Array.from(communesSet).sort((a, b) => a.localeCompare(b, 'fr'));
        }
      },
      error: (err) => {
        // Non-fatal: leave options empty if API fails
        console.warn('Unable to load zone options for user form', err);
      }
    });
  }

  // Filtered lists used by the template
  get filteredProvinces(): string[] {
    const q = (this.provincesFilter || '').trim().toLowerCase();
    if (!q) return this.provincesOptions;
    return this.provincesOptions.filter(p => p.toLowerCase().includes(q));
  }

  get filteredCommunes(): string[] {
    const q = (this.communesFilter || '').trim().toLowerCase();
    if (!q) return this.communesOptions;
    return this.communesOptions.filter(c => c.toLowerCase().includes(q));
  }

  trackByValue(_: number, value: string) {
    return value;
  }

  isSelected(field: 'provinces' | 'communes', value: string): boolean {
    const arr = this.formData[field] || [];
    return arr.indexOf(value) !== -1;
  }

  toggleSelection(field: 'provinces' | 'communes', value: string) {
    if (!this.formData[field]) this.formData[field] = [];
    const arr = this.formData[field] as string[];
    const idx = arr.indexOf(value);
    if (idx === -1) {
      arr.push(value);
    } else {
      arr.splice(idx, 1);
    }
    // assign back to trigger change detection if needed
    this.formData[field] = arr;
  }

  selectAllProvinces() {
    this.formData.provinces = this.provincesOptions.slice();
  }

  clearProvinces() {
    this.formData.provinces = [];
  }

  selectAllCommunes() {
    this.formData.communes = this.communesOptions.slice();
  }

  clearCommunes() {
    this.formData.communes = [];
  }

  isFormValid(): boolean {
    const hasValidBasicFields = !!(
      this.formData.prenom?.trim() &&
      this.formData.nom?.trim() &&
      this.formData.login?.trim() &&
      this.formData.email?.trim() &&
      this.formData.role
    );

    const hasValidPassword = this.isEdit || this.formData.password?.length >= 8;

    return hasValidBasicFields && hasValidPassword;
  }

  getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      'Admin': 'Administrateur',
      'Coordinateur': 'Coordinateur',
      'Opérateur': 'Opérateur',
      'Observateur': 'Observateur'
    };
    return roleNames[role] || role;
  }

  getRolePermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      'Admin': [
        'Gestion complète des utilisateurs',
        'Création et modification de toutes les entités',
        'Accès au journal d\'activité',
        'Export et nettoyage des données',
        'Génération de tous les rapports'
      ],
      'Coordinateur': [
        'Gestion des zones et actions',
        'Mise à jour des ouvrages et indicateurs',
        'Création des plans annuels',
        'Génération de rapports',
        'Upload de documents'
      ],
      'Opérateur': [
        'Consultation des données',
        'Mise à jour des progrès des ouvrages',
        'Ajout de mesures d\'indicateurs',
        'Upload de documents',
        'Génération de rapports basiques'
      ],
      'Observateur': [
        'Consultation uniquement',
        'Téléchargement de documents',
        'Téléchargement de rapports',
        'Analyse des tendances'
      ]
    };
    return permissions[role] || [];
  }

  private initializeForm() {
    if (this.user) {
      this.isEdit = true;
      this.formData = {
        prenom: this.user.prenom,
        nom: this.user.nom,
        login: this.user.login,
        email: this.user.email,
        password: '', // Never populate password for edit
        role: this.user.role,
        structure: this.user.structure,
        actif: this.user.actif,
        provinces: Array.isArray((this.user as any).provinces) ? (this.user as any).provinces.slice() : [],
        communes: Array.isArray((this.user as any).communes) ? (this.user as any).communes.slice() : []
      };
    } else {
      this.isEdit = false;
      this.formData = {
        prenom: '',
        nom: '',
        login: '',
        email: '',
        password: '',
        role: '',
        structure: '',
        actif: true,
        provinces: [],
        communes: []
      };
    }
  }

  onSubmit() {
    if (this.saving || !this.isFormValid()) return;

    this.saving = true;
    this.errorMessage = '';

    const userData: CreateUserRequest = {
      prenom: this.formData.prenom.trim(),
      nom: this.formData.nom.trim(),
      login: this.formData.login.trim(),
      email: this.formData.email.trim(),
      password: this.formData.password,
      role: this.formData.role as UserRole,
      structure: this.formData.structure.trim(),
      actif: this.formData.actif,
      provinces: this.formData.provinces?.length ? this.formData.provinces : undefined,
      communes: this.formData.communes?.length ? this.formData.communes : undefined
    };

    const operation = this.isEdit && this.user
      ? this.userService.update(this.user.id_utilisateur, userData)
      : this.userService.create(userData);

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
  }

  onCancel() {
    this.cancel.emit();
  }
}
