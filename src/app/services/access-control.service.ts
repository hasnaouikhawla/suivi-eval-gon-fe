import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole, User } from '../models/user.model';

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface RolePermissions {
  users: Permission & { 
    activate: boolean; 
    changePassword: boolean; 
    changeOwnPassword: boolean; 
  };
  zones: Permission;
  projets: Permission & { statusUpdate: boolean; };
  actions: Permission & { 
    progressUpdate: boolean; 
    statusUpdate: boolean; 
    bulkProgressUpdate: boolean; 
  };
  indicateurs: Permission & { progressUpdate: boolean; };
  cadreLogique: Permission & { 
    hierarchy: boolean; 
    stats: boolean; 
  };
  suiviBudgets: Permission & { budgetExecution: boolean; };
  plansAnnuels: Permission & { 
    statusUpdate: boolean; 
    executionSummary: boolean; 
  };
  documents: Permission & { 
    upload: boolean; 
    download: boolean; 
  };
  rapports: Permission & { 
    generate: boolean; 
    download: boolean; 
  };
  journal: Permission & { 
    search: boolean; 
    export: boolean; 
    cleanup: boolean; 
    stats: boolean; 
  };
  suiviIndicateurs: Permission & { 
    bulkAdd: boolean; 
    trendAnalysis: boolean; 
  };
}

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {

  constructor(private authService: AuthService) {}

  /**
   * Get permissions for current user's role based on permissions.md
   */
  getCurrentUserPermissions(): RolePermissions | null {
    const user = this.authService.getCurrentUser();
    if (!user) return null;
    
    return this.getRolePermissions(user.role);
  }

  /**
   * Get permissions for a specific role - exactly matching permissions.md
   */
  getRolePermissions(role: UserRole): RolePermissions {
    const permissions: Record<UserRole, RolePermissions> = {
      'Admin': {
        users: { 
          create: true, read: true, update: true, delete: true,
          activate: true, changePassword: true, changeOwnPassword: true
        },
        zones: { create: true, read: true, update: true, delete: true },
        projets: { 
          create: true, read: true, update: true, delete: true, 
          statusUpdate: true 
        },
        actions: { 
          create: true, read: true, update: true, delete: true,
          progressUpdate: true, statusUpdate: true, bulkProgressUpdate: true
        },
        indicateurs: { 
          create: true, read: true, update: true, delete: true,
          progressUpdate: true
        },
        cadreLogique: { 
          create: true, read: true, update: true, delete: true,
          hierarchy: true, stats: true
        },
        suiviBudgets: { 
          create: true, read: true, update: true, delete: true,
          budgetExecution: true
        },
        plansAnnuels: { 
          create: true, read: true, update: true, delete: true,
          statusUpdate: true, executionSummary: true
        },
        documents: { 
          create: false, read: true, update: false, delete: true,
          upload: true, download: true
        },
        rapports: { 
          create: false, read: true, update: true, delete: true,
          generate: true, download: true
        },
        journal: { 
          create: false, read: true, update: false, delete: false,
          search: true, export: true, cleanup: true, stats: true
        },
        suiviIndicateurs: { 
          create: true, read: true, update: true, delete: true,
          bulkAdd: true, trendAnalysis: true
        }
      },
      'Coordinateur': {
        users: { 
          create: false, read: false, update: false, delete: false,
          activate: false, changePassword: false, changeOwnPassword: true
        },
        zones: { create: true, read: true, update: true, delete: true },
        projets: { 
          create: true, read: true, update: true, delete: true, 
          statusUpdate: true 
        },
        actions: { 
          create: true, read: true, update: true, delete: true,
          progressUpdate: true, statusUpdate: true, bulkProgressUpdate: true
        },
        indicateurs: { 
          create: true, read: true, update: true, delete: true,
          progressUpdate: true
        },
        cadreLogique: { 
          create: true, read: true, update: true, delete: true,
          hierarchy: true, stats: true
        },
        suiviBudgets: { 
          create: true, read: true, update: true, delete: true,
          budgetExecution: true
        },
        plansAnnuels: { 
          create: true, read: true, update: true, delete: true,
          statusUpdate: true, executionSummary: true
        },
        documents: { 
          create: false, read: true, update: false, delete: true,
          upload: true, download: true
        },
        rapports: { 
          create: false, read: true, update: true, delete: true,
          generate: true, download: true
        },
        journal: { 
          create: false, read: false, update: false, delete: false,
          search: false, export: false, cleanup: false, stats: false
        },
        suiviIndicateurs: { 
          create: true, read: true, update: true, delete: true,
          bulkAdd: true, trendAnalysis: true
        }
      },
      'Opérateur': {
        users: { 
          create: false, read: false, update: false, delete: false,
          activate: false, changePassword: false, changeOwnPassword: true
        },
        zones: { create: false, read: true, update: false, delete: false },
        projets: { 
          create: false, read: true, update: false, delete: false, 
          statusUpdate: false 
        },
        actions: { 
          create: false, read: true, update: false, delete: false,
          progressUpdate: true, statusUpdate: true, bulkProgressUpdate: true
        },
        indicateurs: { 
          create: false, read: true, update: false, delete: false,
          progressUpdate: true
        },
        cadreLogique: { 
          create: false, read: true, update: false, delete: false,
          hierarchy: true, stats: true
        },
        suiviBudgets: { 
          create: false, read: true, update: false, delete: false,
          budgetExecution: true
        },
        plansAnnuels: { 
          create: false, read: true, update: false, delete: false,
          statusUpdate: false, executionSummary: true
        },
        documents: { 
          create: false, read: true, update: false, delete: false,
          upload: true, download: true
        },
        rapports: { 
          create: false, read: true, update: false, delete: false,
          generate: true, download: true
        },
        journal: { 
          create: false, read: false, update: false, delete: false,
          search: false, export: false, cleanup: false, stats: false
        },
        suiviIndicateurs: { 
          create: true, read: true, update: true, delete: false,
          bulkAdd: true, trendAnalysis: true
        }
      },
      'Observateur': {
        users: { 
          create: false, read: false, update: false, delete: false,
          activate: false, changePassword: false, changeOwnPassword: true
        },
        zones: { create: false, read: true, update: false, delete: false },
        projets: { 
          create: false, read: true, update: false, delete: false, 
          statusUpdate: false 
        },
        actions: { 
          create: false, read: true, update: false, delete: false,
          progressUpdate: false, statusUpdate: false, bulkProgressUpdate: false
        },
        indicateurs: { 
          create: false, read: true, update: false, delete: false,
          progressUpdate: false
        },
        cadreLogique: { 
          create: false, read: true, update: false, delete: false,
          hierarchy: true, stats: true
        },
        suiviBudgets: { 
          create: false, read: true, update: false, delete: false,
          budgetExecution: true
        },
        plansAnnuels: { 
          create: false, read: true, update: false, delete: false,
          statusUpdate: false, executionSummary: true
        },
        documents: { 
          create: false, read: true, update: false, delete: false,
          upload: false, download: true
        },
        rapports: { 
          create: false, read: true, update: false, delete: false,
          generate: false, download: true
        },
        journal: { 
          create: false, read: false, update: false, delete: false,
          search: false, export: false, cleanup: false, stats: false
        },
        suiviIndicateurs: { 
          create: false, read: true, update: false, delete: false,
          bulkAdd: false, trendAnalysis: true
        }
      }
    };

    return permissions[role];
  }

  /**
   * Check if current user can perform action on resource
   */
  canAccess(resource: keyof RolePermissions, action: string): boolean {
    const permissions = this.getCurrentUserPermissions();
    if (!permissions) return false;
    
    const resourcePermissions = permissions[resource] as any;
    if (!resourcePermissions) return false;
    
    return resourcePermissions[action] === true;
  }

  // Convenience methods for common checks
  get canManageUsers(): boolean { return this.canAccess('users', 'read'); }
  get canCreateProjets(): boolean { return this.canAccess('projets', 'create'); }
  get canEditProjets(): boolean { return this.canAccess('projets', 'update'); }
  get canDeleteProjets(): boolean { return this.canAccess('projets', 'delete'); }
  get canCreateActions(): boolean { return this.canAccess('actions', 'create'); }
  get canEditActions(): boolean { return this.canAccess('actions', 'update'); }
  get canDeleteActions(): boolean { return this.canAccess('actions', 'delete'); }
  get canCreateZones(): boolean { return this.canAccess('zones', 'create'); }
  get canUploadDocuments(): boolean { return this.canAccess('documents', 'upload'); }
  get canGenerateReports(): boolean { return this.canAccess('rapports', 'generate'); }
  get canAccessJournal(): boolean { return this.canAccess('journal', 'read'); }
  get canUpdateActionProgress(): boolean { return this.canAccess('actions', 'progressUpdate'); }

  /**
   * Check if current user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }
}