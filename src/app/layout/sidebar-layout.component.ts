import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AccessControlService } from '../services/access-control.service';
import { User, UserRole } from '../models/user.model';

interface SidebarItem {
  iconType: string;
  text: string;
  path: string;
  permission?: {
    resource: string;
    action: string;
  };
  roles?: UserRole[];
  alwaysShow?: boolean;
}

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen bg-slate-100">
      <!-- Sidebar -->
      <aside class="fixed inset-y-0 left-0 w-64 bg-[#F3F4F6] shadow-2xl shadow-gray-400/50 flex flex-col z-40 border-r-2 border-gray-400">
        <!-- Logo & Brand (image only, centered, no glow) -->
        <div class="px-6 py-4 border-b-2 border-gray-400 flex-shrink-0 shadow-inner shadow-gray-400/50">
          <div class="w-full flex justify-center">
            <img
              src="logo.png"
              alt="Ministère de l'Agriculture, de la Pêche maritime, du Développement rural et des Eaux et forêts"
              class="w-100 h-26 object-contain transform -translate-x-2"
              loading="lazy"
              aria-hidden="false"
            />
          </div>
        </div>
        
        <!-- Navigation -->
        <nav class="flex-1 flex flex-col justify-between min-h-0 py-4 px-2">
          <ul class="space-y-1 flex-1 flex flex-col justify-center">
            <li *ngFor="let item of visibleSidebarItems">
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-blue-500 text-white font-semibold shadow-md"
                [routerLinkActiveOptions]="{ exact: false }"
                class="flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200
                  text-gray-700 hover:bg-blue-200 hover:text-gray-900 hover:shadow-sm group text-sm"
                [ngClass]="{'font-semibold bg-blue-500 text-white shadow-md': item.path === currentRoute}"
              >
                <span class="flex-shrink-0">
                  <ng-container [ngSwitch]="item.iconType">
                    <svg *ngSwitchCase="'dashboard'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-blue-400' : 'text-blue-600 group-hover:text-blue-700'" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    <svg *ngSwitchCase="'zone'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-cyan-400' : 'text-cyan-600 group-hover:text-cyan-700'" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <svg *ngSwitchCase="'projets-actions'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-green-400' : 'text-green-600 group-hover:text-green-700'" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <svg *ngSwitchCase="'cadre-logique-indicateurs'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-red-400' : 'text-red-600 group-hover:text-red-700'" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 16h.01m.01-5.01h.01m.01 2.01h.01M13 13h2m0 0h2m-2 0v2m0-2V9"/>
                    </svg>
                    <svg *ngSwitchCase="'admin-dashboard'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-purple-400' : 'text-purple-600 group-hover:text-purple-700'" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                    </svg>
                    <svg *ngSwitchCase="'documents'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-indigo-400' : 'text-indigo-600 group-hover:text-indigo-700'" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <svg *ngSwitchCase="'suivi-budgets'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-orange-400' : 'text-orange-600 group-hover:text-orange-700'"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <circle cx="12" cy="12" r="7" stroke-width="2" stroke="currentColor" fill="currentColor"></circle>
                      <path d="M9 12h6" stroke-width="2" stroke-linecap="round" stroke="white"></path>
                    </svg>
                    <svg *ngSwitchCase="'plans-annuels'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-violet-400' : 'text-violet-600 group-hover:text-violet-700'" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <svg *ngSwitchCase="'suivi-indicateurs'" class="w-5 h-5 transition-colors duration-200" 
                         [ngClass]="item.path === currentRoute ? 'text-pink-400' : 'text-pink-600 group-hover:text-pink-700'" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </ng-container>
                </span>
                <span class="truncate font-medium">{{ item.text }}</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <!-- User info with clickable profile -->
        <div class="border-t-2 border-gray-300 px-4 py-3 flex-shrink-0">
          <!-- Clickable Profile Section -->
          <button 
            (click)="navigateToProfile()"
            class="w-full flex items-center gap-2 mb-2 p-2 rounded-lg hover:bg-blue-200 transition-all duration-200 group cursor-pointer">
            <div class="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm group-hover:bg-gray-700 transition-colors flex-shrink-0">
              {{ getUserInitials() }}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold truncate text-gray-800 group-hover:text-gray-900 transition-colors">
                  {{ currentUser?.prenom }} {{ (currentUser?.nom || '') | slice:0:1 }}{{ currentUser?.nom ? '.' : '' }}
                </p>
                <!-- Role Badge -->
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ml-1 flex-shrink-0"
                      [ngClass]="getRoleBadgeClass()">
                  {{ getRoleAbbreviation() }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-600 truncate group-hover:text-gray-700 transition-colors">
                  {{ currentUser?.structure || 'Geo Conseil Développement' }}
                </p>
              </div>
            </div>
          </button>
          
          <!-- Logout Button -->
          <button
            (click)="logout()"
            [disabled]="loggingOut"
            class="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-400 rounded-md transition-all duration-200 disabled:opacity-50">
            <svg *ngIf="!loggingOut" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <svg *ngIf="loggingOut" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loggingOut ? 'Déconnexion...' : 'Se déconnecter' }}</span>
          </button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <div class="flex-1 ml-64">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .active {
      background-color: #1f2937 !important;
      color: #fff !important;
      font-weight: 600 !important;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
    }

    /* Remove scrollbars completely */
    aside {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* Internet Explorer and Edge */
    }

    aside::-webkit-scrollbar {
      display: none; /* Webkit browsers */
    }

    /* Ensure proper height distribution */
    .flex-1 {
      display: flex;
      flex-direction: column;
    }

    /* Navigation items should be evenly distributed */
    nav ul {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      height: 100%;
      max-height: none;
      overflow: visible;
    }

    /* Compact layout optimizations */
    nav {
      padding: 1rem 0.5rem;
    }
    
    nav ul li a {
      padding: 0.625rem 1rem;
      margin-bottom: 0.25rem;
    }

    /* Ensure sidebar fits screen height */
    aside {
      height: 100vh;
      overflow: hidden;
    }

    /* Smooth transitions for all interactive elements */
    a, button {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Enhanced hover effects */
    .group:hover .group-hover\\:bg-gray-700 {
      background-color: #374151;
    }
  `]
})
export class SidebarLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private accessControl = inject(AccessControlService);
  private router = inject(Router);
  
  sidebarItems: SidebarItem[] = [
    { 
      iconType: 'dashboard', 
      text: 'Tableau de Bord', 
      path: '/dashboard', 
      alwaysShow: true 
    },
    { 
      iconType: 'projets-actions', 
      text: 'Projets & Actions', 
      path: '/projets-actions',
      permission: { resource: 'projets', action: 'read' }
    },
    { 
      iconType: 'cadre-logique-indicateurs', 
      text: 'Cadre Logique', 
      path: '/cadre-logique-indicateurs',
      permission: { resource: 'cadreLogique', action: 'read' }
    },
    { 
      iconType: 'suivi-indicateurs', 
      text: 'Suivi Indicateurs', 
      path: '/suivi-indicateurs',
      permission: { resource: 'suiviIndicateurs', action: 'read' }
    },
    { 
      iconType: 'documents', 
      text: 'Documents', 
      path: '/documents',
      permission: { resource: 'documents', action: 'read' }
    },
    { 
      iconType: 'suivi-budgets', 
      text: 'Suivi Budgets', 
      path: '/suivi-budgets',
      permission: { resource: 'suiviBudgets', action: 'read' }
    },
    { 
      iconType: 'admin-dashboard', 
      text: 'Administration', 
      path: '/admin-dashboard',
      roles: ['Admin'] as UserRole[]
    }
  ];
  
  visibleSidebarItems: SidebarItem[] = [];
  currentRoute = '';
  currentUser: User | null = null;
  loggingOut = false;

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.updateVisibleItems();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateVisibleItems() {
    this.visibleSidebarItems = this.sidebarItems.filter(item => {
      // Always show items marked as alwaysShow
      if (item.alwaysShow) {
        return true;
      }

      // Check role-based permissions
      if (item.roles && item.roles.length > 0) {
        return this.accessControl.hasAnyRole(item.roles);
      }

      // Check resource-based permissions
      if (item.permission) {
        return this.accessControl.canAccess(
          item.permission.resource as any, 
          item.permission.action
        );
      }

      // Default to visible if no restrictions
      return true;
    });

    console.log('Visible sidebar items:', this.visibleSidebarItems.map(item => item.text));
    console.log('Current user role:', this.currentUser?.role);
  }

  getRoleBadgeClass(): string {
    const roleClasses = {
      'Admin': 'bg-red-100 text-red-800 border border-red-200',
      'Coordinateur': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Operateur': 'bg-green-100 text-green-800 border border-green-200',
      'Observateur': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    
    return roleClasses[this.currentUser?.role as keyof typeof roleClasses] || 'bg-gray-100 text-gray-800 border border-gray-200';
  }

  getRoleAbbreviation(): string {
    const roleAbbreviations = {
      'Admin': 'Admin',
      'Coordinateur': 'Coordinateur',
      'Operateur': 'Oprérateur',
      'Observateur': 'Observateur'
    };
    
    return roleAbbreviations[this.currentUser?.role as keyof typeof roleAbbreviations] || 'USR';
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    
    const firstInitial = this.currentUser.prenom?.charAt(0)?.toUpperCase() || '';
    const lastInitial = this.currentUser.nom?.charAt(0)?.toUpperCase() || '';
    
    return firstInitial + lastInitial || 'U';
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    if (this.loggingOut) return;
    
    this.loggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        // AuthService handles the navigation
        this.loggingOut = false;
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.loggingOut = false;
      }
    });
  }
}