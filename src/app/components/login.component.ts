import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginCredentials } from '../models/user.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6">
      <div class="w-full max-w-md mx-auto">
        <!-- Logo with subtle glow -->
        <div class="flex justify-center mb-4">
          <img src="logo.png" alt="GeoConseil" class="w-56 md:w-72 h-auto object-contain filter" loading="lazy" />
        </div>
		<div class="text-center mb-8">
           <h2 class="text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-none">Projet pour la conservation des eaux et des sols et la collecte des eaux pluviales pour la région Guelmim-Oued-noun</h2>
        </div>

        <!-- Enhanced login form with glowing effects -->
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 mx-4 glow-container" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <div class="text-center mb-6">
            <h1 id="login-title" class="text-2xl font-bold text-slate-800 mb-2">Connexion</h1>
            <p class="text-sm text-slate-600">Accédez à votre espace personnel</p>
          </div>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-6">
            <!-- Login Field with enhanced styling -->
            <div>
              <label for="login" class="block text-sm font-semibold text-slate-700 mb-2">Nom d'utilisateur</label>
              <div class="relative group">
                <input
                  type="text"
                  id="login"
                  name="login"
                  [(ngModel)]="credentials.login"
                  #loginField="ngModel"
                  required
                  autocomplete="username"
                  class="block w-full px-4 py-3 pl-11 text-sm text-slate-800 placeholder-slate-400 
                         bg-white border border-slate-200 rounded-xl shadow-sm 
                         transition-all duration-300 ease-in-out
                         focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/20 focus:outline-none
                         focus:shadow-lg focus:shadow-[#2563eb]/20
                         group-hover:border-slate-300"
                  placeholder="Entrez votre nom d'utilisateur"
                  [disabled]="loading" />
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-[#2563eb] transition-colors duration-200">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div *ngIf="loginField.valid && loginField.touched" class="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-500">
                  <svg class="h-5 w-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div *ngIf="loginField.invalid && loginField.touched" class="mt-2 text-xs text-red-600 flex items-center animate-slideIn">
                <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01M6 18h12"/>
                </svg>
                Le nom d'utilisateur est obligatoire
              </div>
            </div>

            <!-- Password Field with enhanced styling -->
            <div>
              <label for="password" class="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
              <div class="relative group">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  id="password"
                  name="password"
                  [(ngModel)]="credentials.password"
                  #passwordField="ngModel"
                  required
                  autocomplete="current-password"
                  class="block w-full px-4 py-3 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 
                         bg-white border border-slate-200 rounded-xl shadow-sm 
                         transition-all duration-300 ease-in-out
                         focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/20 focus:outline-none
                         focus:shadow-lg focus:shadow-[#2563eb]/20
                         group-hover:border-slate-300"
                  placeholder="Entrez votre mot de passe"
                  [disabled]="loading" />
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-[#2563eb] transition-colors duration-200">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                  </svg>
                </div>

                <button type="button" (click)="togglePasswordVisibility()"
                        class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-[#2563eb] focus:outline-none transition-colors duration-200"
                        [disabled]="loading" aria-label="Afficher le mot de passe">
                  <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9.878 9.878l4.242 4.242"/>
                  </svg>
                </button>
              </div>
              <div *ngIf="passwordField.invalid && passwordField.touched" class="mt-2 text-xs text-red-600 flex items-center animate-slideIn">
                <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01M6 18h12"/>
                </svg>
                Le mot de passe est obligatoire
              </div>
            </div>

            <!-- Enhanced Error Message -->
            <div *ngIf="errorMessage" class="rounded-lg bg-red-50/90 backdrop-blur-sm border border-red-200 p-3 text-sm text-red-700 animate-slideIn">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01M6 18h12"/>
                </svg>
                <div>
                  <div class="font-semibold">Erreur de connexion</div>
                  <div class="mt-1 text-xs">{{ errorMessage }}</div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-between gap-4">
              <label class="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer">
                <input type="checkbox" class="rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]/20 focus:ring-offset-0 transition-all" />
                <span class="ml-2">Se souvenir</span>
              </label>

              <div>
                <a class="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline transition-colors" href="#">Mot de passe oublié ?</a>
              </div>
            </div>

            <!-- Enhanced Submit Button -->
            <button type="submit"
                    [disabled]="!loginForm.form.valid || loading"
                    [ngClass]="{
                      'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] focus:ring-4 focus:ring-[#2563eb]/30 shadow-lg shadow-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/40 glow-button': loginForm.form.valid && !loading,
                      'bg-gray-300 cursor-not-allowed': !loginForm.form.valid || loading
                    }"
                    class="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl text-sm font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
              <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span *ngIf="loading">Connexion...</span>
              <span *ngIf="!loading">Se connecter</span>
            </button>
          </form>

          <!-- Enhanced Footer -->
          <div class="mt-6 text-center text-xs text-slate-500 lg:hidden">
            © 2024 Geo Conseil Développement. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0,120,215,0.35); }
        50% { box-shadow: 0 0 30px rgba(0,120,215,0.45); }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }

      .animate-slideIn {
        animation: slideIn 0.3s ease-out;
      }

      /* Container glow effect using Edge-like blue (subtle) */
      .glow-container {
        box-shadow:
          0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 10px 10px -5px rgba(0, 0, 0, 0.04),
          0 0 25px rgba(0, 120, 215, 0.35);
      }

      .glow-container:hover {
        box-shadow:
          0 25px 50px -12px rgba(0, 0, 0, 0.15),
          0 0 40px rgba(0, 120, 215, 0.55);
        transition: box-shadow 0.3s ease-in-out;
      }

      /* Button glow effect */
      .glow-button {
        position: relative;
        overflow: hidden;
      }

      .glow-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      .glow-button:hover::before {
        left: 100%;
      }

      /* Improve input autofill color contrast */
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
        -webkit-text-fill-color: #1f2937 !important;
      }

      /* Custom focus states for better accessibility */
      input:focus,
      button:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
    </style>
  `
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  credentials: LoginCredentials = {
    login: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  showPassword = false;
  returnUrl = '/dashboard';

  ngOnInit() {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Get the return URL from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  /**
   * Helper: determines whether the provided text/status indicates invalid credentials
   */
  private isInvalidCredentialsIndicator(text?: string, status?: number): boolean {
    if (status === 401) {
      // 401 often means invalid credentials in this API
      return true;
    }
    if (!text) return false;
    const t = text.toLowerCase();
    return (
      t.includes('identifiants invalides') ||
      t.includes('identifiants') ||
      t.includes('mot de passe') ||
      t.includes('nom d\'utilisateur') ||
      t.includes('incorrect') ||
      t.includes('invalid credentials') ||
      t.includes('invalid')
    );
  }

  /**
   * Helper: determines whether the provided text indicates a deactivated account
   */
  private isDeactivatedIndicator(text?: string): boolean {
    if (!text) return false;
    const t = text.toLowerCase();
    return (
      t.includes('compte désactiv') ||
      t.includes('compte desactiv') ||
      t.includes('désactivé') ||
      t.includes('deactivated') ||
      t.includes('disabled') ||
      t.includes('blocked')
    );
  }

  /**
   * Submit handler:
   * - Shows explicit message for "invalid credentials" and "account deactivated"
   * - Shows a single generic message for everything else (server/network errors, unexpected responses)
   *
   * Improvements:
   * - Uses finalize() to always clear loading flag (prevents stuck 'loading' state)
   * - Handles 429 (rate limit) separately and displays Retry-After when present
   * - Clears previous error state at start
   */
  onSubmit() {
    if (this.loading) return;

    // reset UI state before request
    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.credentials).pipe(
      finalize(() => {
        // ensure loading cleared for every outcome
        this.loading = false;
      })
    ).subscribe({
      next: (response: any) => {
        console.debug('Login response:', response);

        if (response && response.success) {
          // Successful login -> clear any error and navigate
          this.errorMessage = '';
          this.router.navigate([this.returnUrl]);
          return;
        }

        // Server responded with success: false (rare for this endpoint)
        const serverMsg = response?.message ? String(response.message) : '';

        if (this.isDeactivatedIndicator(serverMsg)) {
          this.errorMessage = 'Votre compte est désactivé. Contactez l\'administrateur.';
        } else if (this.isInvalidCredentialsIndicator(serverMsg, response?.status)) {
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
        } else {
          // Any other server response -> show generic message
          this.errorMessage = 'Erreur lors de la connexion. Veuillez réessayer.';
          console.warn('Suppressed server response (not shown to user):', response);
        }
      },
      error: (error: any) => {
        console.debug('Login error (network/server):', error);

        // If server returned 429 (rate limit) surface a helpful message with retry info
        if (error?.status === 429) {
          const retryAfter = error?.headers?.get ? error.headers.get('Retry-After') : (error?.error?.retryAfter || null);
          if (retryAfter) {
            this.errorMessage = `Trop de tentatives. Réessayez dans ${retryAfter} secondes.`;
          } else {
            this.errorMessage = 'Trop de tentatives. Réessayez plus tard.';
          }
          return;
        }

        // Clear any previous stored token/user if present and error indicates auth issue
        if (error?.status === 401 || this.isInvalidCredentialsIndicator(error?.error?.message || error?.message, error?.status)) {
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
          return;
        }

        // Deactivated account (server-side message)
        if (this.isDeactivatedIndicator(error?.error?.message || error?.message)) {
          this.errorMessage = 'Votre compte est désactivé. Contactez l\'administrateur.';
          return;
        }

        // Generic fallback for other errors (500, network, unexpected)
        this.errorMessage = 'Erreur lors de la connexion. Veuillez réessayer.';
        console.warn('Suppressed server/network error (not shown to user):', error);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
