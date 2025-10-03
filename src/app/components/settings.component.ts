import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { User, UserRole } from '../models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header Section -->
    <div class="bg-gray-100 shadow-none border-none">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Paramètres du Profil</h1>
            <p class="mt-1 text-sm text-gray-600">
              Gérez vos informations personnelles et votre mot de passe
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto bg-gray-100">
      <!-- Loader -->
      <div *ngIf="loadingProfile" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span class="ml-4 text-gray-500">Chargement du profil...</span>
      </div>

      <!-- User Profile Information Card (Read-only) -->
      <div *ngIf="!loadingProfile" class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-6 py-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Informations personnelles</h3>
          <p class="mt-1 text-sm text-gray-600">Ces informations sont gérées par votre administrateur.</p>
        </div>
        <div class="px-6 py-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Prénom (Disabled) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Prénom
              </label>
              <input
                type="text"
                [value]="userProfile.prenom || ''"
                disabled
                class="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm 
                       bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Non défini">
            </div>

            <!-- Nom (Disabled) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Nom
              </label>
              <input
                type="text"
                [value]="userProfile.nom || ''"
                disabled
                class="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm 
                       bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Non défini">
            </div>

            <!-- Role (Disabled) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Rôle
              </label>
              <input
                type="text"
                [value]="userProfile.role || ''"
                disabled
                class="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm 
                       bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Non défini">
            </div>

            <!-- Structure (Disabled) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Structure
              </label>
              <input
                type="text"
                [value]="userProfile.structure || ''"
                disabled
                class="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm 
                       bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Non définie">
            </div>
          </div>
        </div>
      </div>

      <!-- Account Settings Card (Editable) -->
      <div *ngIf="!loadingProfile" class="bg-white shadow-sm rounded-xl border-2 border-gray-200 mb-8">
        <div class="px-6 py-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Paramètres du compte</h3>
          <p class="mt-1 text-sm text-gray-600">Mettez à jour vos informations de connexion.</p>
        </div>
        <div class="px-6 py-6">
          <form (ngSubmit)="updateAccountSettings()" #accountForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Username -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  name="login"
                  [(ngModel)]="accountSettings.login"
                  required
                  minlength="3"
                  maxlength="50"
                  pattern="^[a-zA-Z0-9_-]+$"
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         placeholder-gray-400 
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400"
                  placeholder="Votre nom d'utilisateur">
                <div class="mt-1 text-xs text-gray-500">
                  3-50 caractères, lettres, chiffres, tirets et underscores uniquement
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="accountSettings.email"
                  required
                  class="block w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                         placeholder-gray-400 
                         focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                         hover:border-gray-400"
                  placeholder="votre.email@exemple.com">
              </div>
            </div>

            <!-- Update Account Button -->
            <div class="mt-6 flex justify-end">
              <button
                type="submit"
                [disabled]="!accountForm.form.valid || updatingAccount"
                class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                <svg *ngIf="!updatingAccount" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <svg *ngIf="updatingAccount" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ updatingAccount ? 'Mise à jour...' : 'Mettre à jour le compte' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Change Password Card -->
      <div *ngIf="!loadingProfile" class="bg-white shadow-sm rounded-xl border-2 border-gray-200">
        <div class="px-6 py-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
          <p class="mt-1 text-sm text-gray-600">Modifiez votre mot de passe pour sécuriser votre compte.</p>
        </div>
        <div class="px-6 py-6">
          <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Current Password -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Mot de passe actuel
                </label>
                <div class="relative">
                  <input
                    [type]="showCurrentPassword ? 'text' : 'password'"
                    name="currentPassword"
                    [(ngModel)]="passwordData.currentPassword"
                    required
                    class="block w-full px-4 py-3 pr-12 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                           placeholder-gray-400 
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                           hover:border-gray-400"
                    placeholder="Mot de passe actuel">
                  <button type="button" (click)="showCurrentPassword = !showCurrentPassword" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                    <svg *ngIf="!showCurrentPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <svg *ngIf="showCurrentPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- New Password -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Nouveau mot de passe
                </label>
                <div class="relative">
                  <input
                    [type]="showNewPassword ? 'text' : 'password'"
                    name="newPassword"
                    [(ngModel)]="passwordData.newPassword"
                    required
                    minlength="8"
                    class="block w-full px-4 py-3 pr-12 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                           placeholder-gray-400 
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                           hover:border-gray-400"
                    placeholder="Nouveau mot de passe">
                  <button type="button" (click)="showNewPassword = !showNewPassword" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                    <svg *ngIf="!showNewPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <svg *ngIf="showNewPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                    </svg>
                  </button>
                </div>
                <div class="mt-1 text-xs text-gray-500">
                  Minimum 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux
                </div>
              </div>

              <!-- Confirm Password -->
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">
                  Confirmer le mot de passe
                </label>
                <div class="relative">
                  <input
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    name="confirmPassword"
                    [(ngModel)]="passwordData.confirmPassword"
                    required
                    class="block w-full px-4 py-3 pr-12 text-sm border-2 border-gray-300 rounded-xl shadow-sm transition-all duration-200 ease-in-out
                           placeholder-gray-400 
                           focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none
                           hover:border-gray-400"
                    [class.border-red-300]="passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword"
                    placeholder="Confirmer le mot de passe">
                  <button type="button" (click)="showConfirmPassword = !showConfirmPassword" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                    <svg *ngIf="!showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <svg *ngIf="showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                    </svg>
                  </button>
                </div>
                <div *ngIf="passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword" class="mt-2 text-sm text-red-600">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>

            <!-- Change Password Button -->
            <div class="mt-6 flex justify-end">
              <button
                type="submit"
                [disabled]="!isPasswordFormValid() || changingPassword"
                class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                <svg *ngIf="!changingPassword" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <svg *ngIf="changingPassword" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ changingPassword ? 'Modification...' : 'Changer le mot de passe' }}
              </button>
            </div>
          </form>
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
export class SettingsComponent implements OnInit {
  updatingAccount = false;
  changingPassword = false;
  loadingProfile = false;
  successMessage = '';
  errorMessage = '';

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Read-only user profile information
  userProfile: {
    prenom?: string;
    nom?: string;
    role?: UserRole;
    structure?: string;
  } = {};

  // Editable account settings
  accountSettings = {
    login: '',
    email: ''
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.retrieveProfile();
  }

  retrieveProfile() {
    this.loadingProfile = true;
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          const userData = response.data;
          
          // Set read-only profile information
          this.userProfile = {
            prenom: userData.prenom,
            nom: userData.nom,
            role: userData.role,
            structure: userData.structure
          };

          // Set editable account settings
          this.accountSettings = {
            login: userData.login,
            email: userData.email
          };
        }
        this.loadingProfile = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        this.showError('Erreur lors du chargement du profil');
        this.loadingProfile = false;
      }
    });
  }

  updateAccountSettings() {
    this.updatingAccount = true;
    
    // Create update payload with current profile data + new account settings
    const updateData = {
      prenom: this.userProfile.prenom!,
      nom: this.userProfile.nom!,
      login: this.accountSettings.login,
      email: this.accountSettings.email,
      structure: this.userProfile.structure || ''
    };

    this.authService.updateProfile(updateData).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Handle new token if login was changed
          if (response.token) {
            // Update stored token
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('geoconseil_token', response.token);
            }
            this.showSuccess('Nom d\'utilisateur et compte mis à jour avec succès');
          } else {
            this.showSuccess('Compte mis à jour avec succès');
          }
          this.retrieveProfile();
        }
        this.updatingAccount = false;
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.showError(error.error?.message || 'Erreur lors de la mise à jour des paramètres');
        this.updatingAccount = false;
      }
    });
  }

  changePassword() {
    if (!this.isPasswordFormValid()) return;

    this.changingPassword = true;
    
    this.authService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Mot de passe modifié avec succès');
          this.resetPasswordForm();
        }
        this.changingPassword = false;
      },
      error: (error) => {
        console.error('Erreur lors du changement de mot de passe:', error);
        this.showError(error.error?.message || 'Erreur lors du changement de mot de passe');
        this.changingPassword = false;
      }
    });
  }

  isPasswordFormValid(): boolean {
    return !!(
      this.passwordData.currentPassword &&
      this.passwordData.newPassword &&
      this.passwordData.confirmPassword &&
      this.passwordData.newPassword === this.passwordData.confirmPassword &&
      this.passwordData.newPassword.length >= 8
    );
  }

  resetPasswordForm() {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
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