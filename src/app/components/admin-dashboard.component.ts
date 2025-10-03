import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersComponent } from './users.component';
import { JournalComponent } from './journal.component';
import { RapportComponent } from './rapport.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, UsersComponent, JournalComponent, RapportComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Tab Navigation Header -->
    <div class="bg-gray-100 shadow-none border-none dashboard-main-header">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-6">
          <!-- Main Title -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
            <p class="mt-1 text-sm text-gray-600">
              Administration système, gestion des utilisateurs et rapports
            </p>
          </div>

          <!-- Tab Navigation with Action Buttons in Same Row -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <!-- Left side: Tabs and Context -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 flex-1">
              <!-- Tab Navigation -->
              <nav class="flex space-x-4 lg:space-x-6 items-center" aria-label="Tabs">
                <button
                  type="button"
                  (click)="switchToTab('users')"
                  [class]="getTabClass('users')"
                  class="group whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm lg:text-lg transition-all duration-200 ease-in-out">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 lg:w-6 lg:h-6 mr-1 lg:mr-2 transition-colors"
                         [class]="getTabIconClass('users')"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                    <span class="hidden sm:inline">Utilisateurs</span>
                    <span class="sm:hidden">Users</span>
                    <span *ngIf="usersCount !== null"
                          [class]="getBadgeClass('users')"
                          class="ml-1 lg:ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200">
                      {{ usersCount }}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  (click)="switchToTab('journal')"
                  [class]="getTabClass('journal')"
                  class="group whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm lg:text-lg transition-all duration-200 ease-in-out">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 lg:w-6 lg:h-6 mr-1 lg:mr-2 transition-colors"
                         [class]="getTabIconClass('journal')"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <span class="hidden sm:inline">Journal d'Activité</span>
                    <span class="sm:hidden">Journal</span>
                    <span *ngIf="journalCount !== null"
                          [class]="getBadgeClass('journal')"
                          class="ml-1 lg:ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200">
                      {{ journalCount }}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  (click)="switchToTab('rapport')"
                  [class]="getTabClass('rapport')"
                  class="group whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm lg:text-lg transition-all duration-200 ease-in-out">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 lg:w-6 lg:h-6 mr-1 lg:mr-2 transition-colors"
                         [class]="getTabIconClass('rapport')"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span class="hidden sm:inline">Rapports</span>
                    <span class="sm:hidden">Reports</span>
                    <span *ngIf="rapportsCount !== null"
                          [class]="getBadgeClass('rapport')"
                          class="ml-1 lg:ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200">
                      {{ rapportsCount }}
                    </span>
                  </div>
                </button>
              </nav>
            </div>

            <!-- Right side: Action Buttons - Aligned with tabs -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-shrink-0">
              <!-- Users Tab Actions -->
              <button
                *ngIf="activeTab === 'users' && canCreateUsers"
                type="button"
                (click)="createNewUser()"
                class="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span class="hidden sm:inline">Nouvel Utilisateur</span>
                <span class="sm:hidden">Nouveau</span>
              </button>

              <!-- Journal Tab Actions -->
              <div *ngIf="activeTab === 'journal'" class="flex flex-wrap gap-2">
                <button
                  type="button"
                  (click)="generateJournalReport()"
                  class="inline-flex items-center px-3 lg:px-4 py-2 border-2 border-indigo-600 text-xs lg:text-sm font-semibold rounded-xl shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out">
                  <svg class="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Rapport
                </button>
                <button
                  type="button"
                  (click)="exportJournalData()"
                  class="inline-flex items-center px-3 lg:px-4 py-2 border-2 border-green-600 text-xs lg:text-sm font-semibold rounded-xl shadow-sm text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 ease-in-out">
                  <svg class="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Exporter
                </button>
                <button
                  type="button"
                  (click)="openJournalCleanup()"
                  class="inline-flex items-center px-3 lg:px-4 py-2 border-2 border-red-600 text-xs lg:text-sm font-semibold rounded-xl shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 ease-in-out">
                  <svg class="w-3 h-3 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Nettoyage
                </button>
              </div>

              <!-- Rapport Tab Actions -->
              <button
                *ngIf="activeTab === 'rapport' && canGenerateReports"
                type="button"
                (click)="createNewReport()"
                class="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span class="hidden sm:inline">Générer Rapport</span>
                <span class="sm:hidden">Générer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content-container bg-gray-100" #tabContainer>
      <!-- Users Tab Content -->
      <div *ngIf="activeTab === 'users'" class="tab-content">
        <app-users #usersComponent></app-users>
      </div>

      <!-- Journal Tab Content -->
      <div *ngIf="activeTab === 'journal'" class="tab-content">
        <app-journal #journalComponent></app-journal>
      </div>

      <!-- Rapport Tab Content -->
      <div *ngIf="activeTab === 'rapport'" class="tab-content">
        <app-rapports #rapportComponent></app-rapports>
      </div>
    </div>

    <!-- Mobile Tab Navigation -->
    <div class="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div class="bg-gray-100 rounded-xl shadow-none border-none p-1 flex">
        <button
          type="button"
          (click)="switchToTab('users')"
          [class]="getMobileTabClass('users')"
          class="flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
          Utilisateurs
        </button>
        <button
          type="button"
          (click)="switchToTab('journal')"
          [class]="getMobileTabClass('journal')"
          class="flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Journal
        </button>
        <button
          type="button"
          (click)="switchToTab('rapport')"
          [class]="getMobileTabClass('rapport')"
          class="flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Rapports
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tab-content-container {
      width: 100%;
      position: relative;
    }

    .tab-content {
      width: 100%;
      min-height: calc(100vh - 200px);
      box-sizing: border-box;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .tab-content {
        min-height: calc(100vh - 160px);
      }
    }

    /* Ensure child components take full width */
    app-users,
    app-journal,
    app-rapports {
      display: block;
      width: 100%;
    }

    /* Custom responsive breakpoints for better alignment */
    @media (min-width: 1024px) {
      .dashboard-main-header .flex-col.lg\\:flex-row {
        align-items: center;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('usersComponent') usersComponent!: UsersComponent;
  @ViewChild('journalComponent') journalComponent!: JournalComponent;
  @ViewChild('rapportComponent') rapportComponent!: RapportComponent;
  @ViewChild('tabContainer', { read: ElementRef }) tabContainer!: ElementRef;

  activeTab: 'users' | 'journal' | 'rapport' = 'users';
  usersCount: number | null = null;
  journalCount: number | null = null;
  rapportsCount: number | null = null;
  canCreateUsers: boolean = false;
  canGenerateReports: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const validTabs = ['users', 'journal', 'rapport'];
        if (validTabs.includes(params['tab'])) {
          this.activeTab = params['tab'] as 'users' | 'journal' | 'rapport';
        }
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkPermissions();
    }, 100);
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private checkPermissions() {
    // Basic placeholder permissions; replace with real checks if available
    this.canCreateUsers = true;
    this.canGenerateReports = true;
  }

  switchToTab(tab: 'users' | 'journal' | 'rapport') {
    this.activeTab = tab;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      replaceUrl: true
    });

    this.cdr.detectChanges();
  }

  createNewUser() {
    if (this.usersComponent) {
      this.usersComponent.openCreateModal();
    }
  }

  generateJournalReport() {
    if (this.journalComponent) {
      this.journalComponent.generateReport();
    }
  }

  exportJournalData() {
    if (this.journalComponent) {
      this.journalComponent.exportData();
    }
  }

  openJournalCleanup() {
    if (this.journalComponent) {
      this.journalComponent.openCleanupModal();
    }
  }

  createNewReport() {
    if (this.rapportComponent) {
      this.rapportComponent.openGenerateModal();
    }
  }

  getTabClass(tab: 'users' | 'journal' | 'rapport'): string {
    if (this.activeTab === tab) {
      return 'border-indigo-500 text-indigo-600';
    }
    return 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }

  getTabIconClass(tab: 'users' | 'journal' | 'rapport'): string {
    if (this.activeTab === tab) {
      return 'text-indigo-600';
    }
    return 'text-gray-400 group-hover:text-gray-600';
  }

  getBadgeClass(tab: 'users' | 'journal' | 'rapport'): string {
    if (this.activeTab === tab) {
      return 'bg-indigo-100 text-indigo-800';
    }
    return 'bg-gray-100 text-gray-800 group-hover:bg-gray-200';
  }

  getMobileTabClass(tab: 'users' | 'journal' | 'rapport'): string {
    if (this.activeTab === tab) {
      return 'bg-indigo-600 text-white';
    }
    return 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  }

  // Utility methods for external use
  switchToUsers() {
    this.switchToTab('users');
  }

  switchToJournal() {
    this.switchToTab('journal');
  }

  switchToRapports() {
    this.switchToTab('rapport');
  }
}
