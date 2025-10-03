import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { 
  roleGuard, 
  adminGuard, 
  usersGuard, 
  journalGuard,
  adminOrCoordinateurGuard
} from './auth/role.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/login.component').then(c => c.LoginComponent) 
  },
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard.component').then(c => c.DashboardComponent), 
    canActivate: [AuthGuard] 
  },
  
  { 
    path: 'projets-actions', 
    loadComponent: () => import('./components/projets-actions.component').then(c => c.ProjetsActionsComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'projets', action: 'read' } }
  },
  
  // Admin Dashboard - Admin only
  { 
    path: 'admin-dashboard', 
    loadComponent: () => import('./components/admin-dashboard.component').then(c => c.AdminDashboardComponent), 
    canActivate: [AuthGuard, usersGuard]
  },

  { 
    path: 'documents', 
    loadComponent: () => import('./components/document.component').then(c => c.DocumentComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'documents', action: 'read' } }
  },

  { 
    path: 'cadre-logique-indicateurs', 
    loadComponent: () => import('./components/cadre-logique-indicateurs.component').then(c => c.CadreLogiqueIndicateursComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'cadreLogique', action: 'read' } }
  },
  
  { 
    path: 'suivi-indicateurs', 
    loadComponent: () => import('./components/suivi-indicateurs.component').then(c => c.SuiviIndicateursComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'suiviIndicateurs', action: 'read' } }
  },

  { 
    path: 'suivi-budgets', 
    loadComponent: () => import('./components/suivi-budgets.component').then(c => c.SuiviBudgetsComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'suiviBudgets', action: 'read' } }
  },
 
  { 
    path: 'profile', 
    loadComponent: () => import('./components/settings.component').then(c => c.SettingsComponent), 
    canActivate: [AuthGuard] 
  },

// Unauthorized page
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./components/unauthorized.component').then(c => c.UnauthorizedComponent) 
  },
  
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  },

/* 
// Previous routes (no longer in sidebar)
  
  // Zones - All authenticated users can read
  { 
    path: 'zones', 
    loadComponent: () => import('./components/zones.component').then(c => c.ZonesComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'zones', action: 'read' } }
  },
  
  // actions - All authenticated users can read
  { 
    path: 'projets', 
    loadComponent: () => import('./components/projets.component').then(c => c.ProjetsComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'projets', action: 'read' } }
  },
  
  // actions - All authenticated users can read
  { 
    path: 'actions', 
    loadComponent: () => import('./components/actions.component').then(c => c.ActionsComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'actions', action: 'read' } }
  },
  
  // Indicateurs - All authenticated users can read
  { 
    path: 'indicateurs', 
    loadComponent: () => import('./components/indicateurs.component').then(c => c.IndicateursComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'indicateurs', action: 'read' } }
  },
  
  // Rapports - All authenticated users can read
  { 
    path: 'rapports', 
    loadComponent: () => import('./components/rapport.component').then(c => c.RapportComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'rapports', action: 'read' } }
  },
  
  // Users - Admin only
  { 
    path: 'users', 
    loadComponent: () => import('./components/users.component').then(c => c.UsersComponent), 
    canActivate: [AuthGuard, usersGuard]
  },
  
  // Journal - Admin only
  { 
    path: 'journal', 
    loadComponent: () => import('./components/journal.component').then(c => c.JournalComponent), 
    canActivate: [AuthGuard, journalGuard]
  },
  
  // Cadre Logique - All authenticated users can read
  { 
    path: 'cadre-logique', 
    loadComponent: () => import('./components/cadre-logique.component').then(c => c.CadreLogiqueComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'cadreLogique', action: 'read' } }
  },
  
  // Plans Annuels - All authenticated users can read
  { 
    path: 'plans-annuels', 
    loadComponent: () => import('./components/plans-annuels.component').then(c => c.PlansAnnuelsComponent), 
    canActivate: [AuthGuard, roleGuard],
    data: { permission: { resource: 'plansAnnuels', action: 'read' } }
  }
*/
];
