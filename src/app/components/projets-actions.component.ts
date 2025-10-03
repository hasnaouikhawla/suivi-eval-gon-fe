import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetsComponent } from './projets.component';
import { ActionsComponent } from './actions.component';

@Component({
  selector: 'app-projets-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjetsComponent, ActionsComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Tab Navigation Header -->
    <div class="bg-gray-100 shadow-none border-none">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-6">
          <!-- Main Title -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gestion des Projets et Actions</h1>
            <p class="mt-1 text-sm text-gray-600">
              Planification et suivi des projets et actions du plan d'aménagement
            </p>
          </div>

          <!-- Tab Navigation with Current Context -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <!-- Tab Navigation -->
              <nav class="flex space-x-6" aria-label="Tabs">
                <button
                  type="button"
                  (click)="switchToTab('projets')"
                  [class]="getTabClass('projets')"
                  class="group whitespace-nowrap py-2 px-1 border-b-2 font-medium text-lg transition-all duration-200 ease-in-out">
                  <div class="flex items-center">
                    <svg class="w-6 h-6 mr-2 transition-colors" 
                         [class]="getTabIconClass('projets')"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Projets
                    <span *ngIf="projetsCount !== null" 
                          [class]="getBadgeClass('projets')"
                          class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200">
                      {{ projetsCount }}
                    </span>
                  </div>
                </button>
                
                <button
                  type="button"
                  (click)="switchToTab('actions')"
                  [class]="getTabClass('actions')"
                  class="group whitespace-nowrap py-2 px-1 border-b-2 font-medium text-lg transition-all duration-200 ease-in-out">
                  <div class="flex items-center">
                    <svg class="w-6 h-6 mr-2 transition-colors" 
                         [class]="getTabIconClass('actions')"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    Actions
                    <span *ngIf="actionsCount !== null" 
                          [class]="getBadgeClass('actions')"
                          class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200">
                      {{ actionsCount }}
                    </span>
                  </div>
                </button>
              </nav>
            </div>

            <!-- Right side content -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <!-- Create Button for Current Tab -->
              <button
                *ngIf="activeTab === 'projets' && canCreateProjets"
                type="button"
                (click)="createNewProjet()"
                class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Nouveau Projet
              </button>

              <button
                *ngIf="activeTab === 'actions' && canCreateActions"
                type="button"
                (click)="createNewAction()"
                class="inline-flex items-center px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Nouvelle Action
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content-container" #tabContainer>
      <!-- Projets Tab Content -->
      <div *ngIf="activeTab === 'projets'" class="tab-content">
        <app-projets #projetsComponent></app-projets>
      </div>

      <!-- Actions Tab Content -->
      <div *ngIf="activeTab === 'actions'" class="tab-content">
        <app-actions #actionsComponent [preselectedProjetId]="selectedProjetId"></app-actions>
      </div>
    </div>

    <!-- Mobile Tab Navigation -->
    <div class="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-1 flex">
        <button
          type="button"
          (click)="switchToTab('projets')"
          [class]="getMobileTabClass('projets')"
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Projets
        </button>
        <button
          type="button"
          (click)="switchToTab('actions')"
          [class]="getMobileTabClass('actions')"
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          Actions
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
    app-projets,
    app-actions {
      display: block;
      width: 100%;
    }

    /* Smooth transitions */
    .tab-content {
      transition: opacity 0.2s ease-in-out;
    }
  `]
})
export class ProjetsActionsComponent implements OnInit, AfterViewInit {
  @ViewChild('projetsComponent') projetsComponent!: ProjetsComponent;
  @ViewChild('actionsComponent') actionsComponent!: ActionsComponent;
  @ViewChild('tabContainer', { read: ElementRef }) tabContainer!: ElementRef;

  activeTab: 'projets' | 'actions' = 'projets';
  selectedProjetId: number | null = null;
  projetsCount: number | null = null;
  actionsCount: number | null = null;
  canCreateProjets: boolean = false;
  canCreateActions: boolean = false;

  private observer?: MutationObserver;
  private headerRemovalInterval?: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'actions') {
        this.activeTab = 'actions';
        
        if (params['id_projet']) {
          this.selectedProjetId = parseInt(params['id_projet'], 10);
        }
      }
    });
  }

  ngAfterViewInit() {
    // Check permissions after components are loaded
    setTimeout(() => {
      this.checkPermissions();
      this.startAggressiveHeaderRemoval();
    }, 100);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.headerRemovalInterval) {
      clearInterval(this.headerRemovalInterval);
    }
  }

  private startAggressiveHeaderRemoval() {
    // Remove headers immediately
    this.removeChildHeaders();

    // Set up continuous removal with very frequent intervals
    this.headerRemovalInterval = setInterval(() => {
      this.removeChildHeaders();
    }, 10); // Check every 10ms

    // Set up mutation observer for instant removal when DOM changes
    this.observer = new MutationObserver((mutations) => {
      this.removeChildHeaders();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true
    });
  }

  private removeChildHeaders() {
    try {
      // Method 1: Remove by ID
      const idsToRemove = [
        'projets-header-title',
        'projets-header-subtitle',
        'actions-header-title',
        'actions-header-subtitle'
      ];

      idsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.remove(); // Completely remove from DOM
        }
      });

      // Method 2: Remove entire header sections
      const container = this.tabContainer?.nativeElement;
      if (container) {
        // Find all header divs with the specific classes
        const headerSections = container.querySelectorAll('div.bg-white.shadow-sm.border-b.border-gray-200, div.bg-gray-50');
        
        headerSections.forEach((section: Element) => {
          const text = section.textContent || '';
          // If this section contains header text, remove it entirely
          if (text.includes('Gestion des projets') || 
              text.includes('Gestion des actions') ||
              text.includes('Planification et suivi') ||
              text.includes('Nouveau Projet') ||
              text.includes('Nouvelle Action')) {
            section.remove(); // Remove the entire section from DOM
          }
        });
      }

      // Method 3: Remove any element containing the specific header texts
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const text = element.textContent?.trim() || '';
        // Remove elements that ONLY contain header text (avoid removing parent containers)
        if ((text === 'Gestion des projets' || 
             text === 'Planification et suivi des projets du plan d\'aménagement' ||
             text === 'Gestion des actions' ||
             text === 'Suivi et gestion des actions du plan d\'aménagement') &&
            element.tagName !== 'BODY' && 
            element.tagName !== 'HTML') {
          element.remove();
        }
      });

    } catch (error) {
      // Silently handle errors
    }
  }

  private checkPermissions() {
    // Get permissions from child components
    if (this.projetsComponent) {
      this.canCreateProjets = this.projetsComponent.canCreateprojets;
    }
    if (this.actionsComponent) {
      this.canCreateActions = this.actionsComponent.canCreateActions;
    }
  }

  switchToTab(tab: 'projets' | 'actions') {
  this.activeTab = tab;
  
  // Update URL parameters based on the active tab
  if (tab === 'projets') {
    // Clear all query parameters when switching to projets tab
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
    this.selectedProjetId = null; // Clear the selected project
  } else if (tab === 'actions') {
    // Keep existing parameters or set tab to actions
    const currentParams = { ...this.route.snapshot.queryParams };
    if (currentParams['tab'] !== 'actions') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { ...currentParams, tab: 'actions' },
        replaceUrl: true
      });
    }
  }
  
  // Immediately start removing headers for the new tab
  setTimeout(() => {
    this.checkPermissions();
    this.removeChildHeaders();
  }, 1); // Almost immediate
  }

  createNewProjet() {
    if (this.projetsComponent) {
      this.projetsComponent.openCreateModal();
    }
  }

  createNewAction() {
    if (this.actionsComponent) {
      this.actionsComponent.openCreateModal();
    }
  }

  getTabClass(tab: 'projets' | 'actions'): string {
    if (this.activeTab === tab) {
      return 'border-indigo-500 text-indigo-600';
    }
    return 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }

  getTabIconClass(tab: 'projets' | 'actions'): string {
    if (this.activeTab === tab) {
      return 'text-indigo-600';
    }
    return 'text-gray-400 group-hover:text-gray-600';
  }

  getBadgeClass(tab: 'projets' | 'actions'): string {
    if (this.activeTab === tab) {
      return 'bg-indigo-100 text-indigo-800';
    }
    return 'bg-gray-100 text-gray-800 group-hover:bg-gray-200';
  }

  getMobileTabClass(tab: 'projets' | 'actions'): string {
    if (this.activeTab === tab) {
      return 'bg-indigo-600 text-white';
    }
    return 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  }

  updateCounts(projetsCount?: number, actionsCount?: number) {
    if (projetsCount !== undefined) {
      this.projetsCount = projetsCount;
    }
    if (actionsCount !== undefined) {
      this.actionsCount = actionsCount;
    }
  }

  switchToProjects() {
    this.switchToTab('projets');
  }

  switchToActions() {
    this.switchToTab('actions');
  }
}
