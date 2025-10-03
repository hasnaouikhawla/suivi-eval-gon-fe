import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get the auth token
  const authToken = authService.getToken();

  // Clone the request and add the authorization header if token exists
  let authReq = req;
  if (authToken) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }

  // Handle the request and catch auth errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const url = req.url || '';
      // Avoid triggering logout for requests to auth endpoints to prevent loops
      const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/logout') || url.includes('/auth/login') || url.includes('/auth/logout');

      if (error.status === 401) {
        // If there's no token locally, or the failing request is an auth endpoint,
        // clear local auth state WITHOUT issuing another logout HTTP request.
        if (!authService.getToken() || isAuthEndpoint) {
          try {
            authService.clearLocalAuth();
          } catch (e) {
            // Fallback: if clearing local auth fails for some reason, attempt logout but only if token exists.
            if (authService.getToken()) {
              authService.logout().subscribe({
                next: () => {},
                error: () => {}
              });
            }
          }
        } else {
          // Only call server logout when a token is present and the failed request is not an auth endpoint.
          // This avoids cascades when login fails (no token) and prevents the interceptor from generating
          // additional outgoing requests that could trip rate limits.
          authService.logout().subscribe({
            next: () => {},
            error: () => {}
          });
        }
      }

      return throwError(() => error);
    })
  );
};