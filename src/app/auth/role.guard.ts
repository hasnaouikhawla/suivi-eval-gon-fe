import { inject } from '@angular/core';
import { Router, type CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccessControlService } from '../services/access-control.service';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Main role guard that checks permissions based on route data
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const accessControl = inject(AccessControlService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check authentication first
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check for specific permission requirement
  const requiredPermission: { resource: string; action: string } = route.data?.['permission'];
  
  if (requiredPermission) {
    if (!accessControl.canAccess(requiredPermission.resource as any, requiredPermission.action)) {
      console.warn(`Access denied: User lacks permission ${requiredPermission.action} on ${requiredPermission.resource}`);
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  // Check for role-based requirement
  const requiredRoles: UserRole[] = route.data?.['roles'];
  if (requiredRoles && requiredRoles.length > 0) {
    if (!accessControl.hasAnyRole(requiredRoles)) {
      console.warn(`Access denied: User lacks required roles: ${requiredRoles.join(', ')}`);
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};

/**
 * Specific guards for common use cases
 */

// Admin only access
export const adminGuard: CanActivateFn = (route, state) => {
  const accessControl = inject(AccessControlService);
  const router = inject(Router);

  if (!accessControl.hasRole('Admin')) {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};

// Admin or Coordinateur access
export const adminOrCoordinateurGuard: CanActivateFn = (route, state) => {
  const accessControl = inject(AccessControlService);
  const router = inject(Router);

  if (!accessControl.hasAnyRole(['Admin', 'Coordinateur'])) {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};

// Users management guard (Admin only)
export const usersGuard: CanActivateFn = (route, state) => {
  const accessControl = inject(AccessControlService);
  const router = inject(Router);

  if (!accessControl.canManageUsers) {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};

// Journal access guard (Admin only)
export const journalGuard: CanActivateFn = (route, state) => {
  const accessControl = inject(AccessControlService);
  const router = inject(Router);

  if (!accessControl.canAccessJournal) {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};
