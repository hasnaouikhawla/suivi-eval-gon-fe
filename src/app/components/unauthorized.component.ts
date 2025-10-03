import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 text-center border border-gray-200">
          <!-- Error Icon -->
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          
          <!-- Title -->
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h2>
          
          <!-- Description -->
          <div class="mb-8">
            <p class="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <p class="text-red-800 font-medium mb-2">Informations sur votre compte :</p>
              <div class="text-red-700 space-y-1 text-left">
                <p><span class="font-medium">Nom :</span> {{ currentUser?.prenom }} {{ currentUser?.nom }}</p>
                <p><span class="font-medium">Rôle :</span> {{ getRoleDisplayName() }}</p>
                <p><span class="font-medium">Structure :</span> {{ currentUser?.structure || 'Non définie' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="space-y-3">
            <button
              type="button"
              (click)="goToDashboard()"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Retour au Tableau de Bord
            </button>
            
            <button
              type="button"
              (click)="goBack()"
              class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Page Précédente
            </button>
          </div>
          
          <!-- Help Section -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <p class="text-xs text-gray-500 mb-3">
              Besoin d'accès supplémentaires ?
            </p>
            <div class="text-xs text-gray-600">
              <p>Contactez votre administrateur système pour :</p>
              <ul class="mt-2 space-y-1 text-left">
                <li>• Demander des permissions supplémentaires</li>
                <li>• Modifier votre rôle utilisateur</li>
                <li>• Signaler un problème d'accès</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional Info -->
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-medium text-blue-800">Information</span>
          </div>
          <p class="text-xs text-blue-700">
            Les permissions sont définies selon votre rôle dans l'organisation. 
            Chaque rôle a accès à des fonctionnalités spécifiques du système.
          </p>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  getRoleDisplayName(): string {
    if (!this.currentUser?.role) return 'Non défini';
    
    const roleNames = {
      'Admin': 'Administrateur',
      'Coordinateur': 'Coordinateur',
      'Opérateur': 'Opérateur',
      'Observateur': 'Observateur'
    };
    
    return roleNames[this.currentUser.role] || this.currentUser.role;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goBack() {
    window.history.back();
  }
}
