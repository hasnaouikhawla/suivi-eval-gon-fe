import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { 
  LoginCredentials, 
  AuthResponse, 
  User, 
  ProfileUpdateRequest, 
  ChangePasswordRequest,
  ApiResponse 
} from '../models/user.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly TOKEN_KEY = 'geoconseil_token';
  private readonly USER_KEY = 'geoconseil_user';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Only validate token expiry locally on initialization
    // Don't make HTTP requests that could fail and logout user unnecessarily
    if (this.isBrowser) {
      // The hasValidToken() method now checks token expiry locally
      // If token is expired, it will automatically clear auth data
      const isValid = this.hasValidToken();
      this.isAuthenticatedSubject.next(isValid);
    }
  }

  /**
   * Authenticate user with login credentials
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/profile`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setUser(response.data);
        }
      }),
      catchError(error => {
        console.error('Get profile error:', error);
        if (error.status === 401 || error.status === 403) {
          // Clear local auth state (no network call) to avoid cascades from interceptor
          this.clearLocalAuth();
        }
        throw error;
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: ProfileUpdateRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/profile`, profileData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setUser(response.data);
        }
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        throw error;
      })
    );
  }

  /**
   * Change user password
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/change-password`, passwordData).pipe(
      catchError(error => {
        console.error('Change password error:', error);
        throw error;
      })
    );
  }

  /**
   * Logout user
   *
   * - If there's no token locally, clear local auth state immediately (avoid network call).
   * - If a token exists, call server logout, but still clear local data on error.
   */
  logout(): Observable<any> {
    const token = this.getToken();
    // If there is no token, don't call the backend; just clear local state.
    if (!token) {
      // Clear client-side auth immediately (don't navigate here; allow caller to decide)
      this.clearLocalAuth();
      return of(null);
    }

    // If token exists, attempt server logout but always clear local data
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        // On successful server logout, clear and navigate to login
        this.clearAuthData();
      }),
      catchError(() => {
        // Even if the server request fails, clear local data and navigate
        this.clearAuthData();
        return of(null);
      })
    );
  }

  /**
   * Get current user value
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Validate token with server (call this only when needed, not on init)
   * Use this method when you need to explicitly verify token validity with the server
   */
  validateTokenWithServer(): Observable<boolean> {
    if (!this.hasValidToken()) {
      return of(false);
    }

    return this.getProfile().pipe(
      map(() => true),
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.clearAuthData();
          return of(false);
        }
        // For other errors (network issues, server down, etc.), don't logout user
        console.warn('Token validation failed due to non-auth error:', error);
        throw error;
      })
    );
  }

  /**
   * Refresh user data from server (optional method for manual refresh)
   */
  refreshUserData(): Observable<User | null> {
    if (!this.hasValidToken()) {
      return of(null);
    }

    return this.getProfile().pipe(
      map(response => response.data),
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.clearAuthData();
          return of(null);
        }
        // For other errors, return current user data
        console.warn('Failed to refresh user data:', error);
        return of(this.getCurrentUser());
      })
    );
  }

  /**
   * Set authentication data
   */
  private setAuthData(token: string, user: User): void {
    if (!this.isBrowser) return;
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Set user data
   */
  private setUser(user: User): void {
    if (!this.isBrowser) return;
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Public: clear authentication data locally without navigation.
   * Used by interceptors to stop loops without issuing additional network calls.
   */
  public clearLocalAuth(): void {
    if (!this.isBrowser) return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Clear authentication data and navigate to login (private - used for full logout)
   */
  private clearAuthData(): void {
    if (!this.isBrowser) return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) return null;
    
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  /**
   * Check if token is expired by decoding JWT
   */
  private isTokenExpired(token: string): boolean {
    try {
      // Split the token and decode the payload
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT token format');
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token has expiry claim
      if (!payload.exp) {
        console.warn('Token does not have expiry claim');
        return false; // If no expiry, assume it's valid (adjust based on your backend)
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        console.log('Token has expired');
      }
      
      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // If we can't decode it, consider it expired
    }
  }

  /**
   * Check if there's a valid token (checks both existence and expiry)
   */
  private hasValidToken(): boolean {
    if (!this.isBrowser) return false;
    
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const user = this.getUserFromStorage();
      
      if (!token || !user) {
        return false;
      }
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log('Token expired, clearing auth data');
        this.clearAuthData();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }
}