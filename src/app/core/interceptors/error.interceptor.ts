import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // HTTP Error status
      const status = error.status;
      const apiMessage = error?.error?.message || error?.message || 'Erro inesperado.';

      // Ignore 401 errors for Edge Functions related to authentication
      const isAuthFunction =
        req.url.includes('/functions/v1/check-lockout') ||
        req.url.includes('/functions/v1/record-login-failure') ||
        req.url.includes('/functions/v1/remaining-attempts');

      // Ignore 401 errors for login/register endpoints
      const isAuthEndpoint = req.url.includes('/auth/v1/token') || req.url.includes('/auth/v1/signup');

      // Trate casos especiais
      if (status === 401 && !isAuthFunction && !isAuthEndpoint) {
        // Only show session expired for non-auth endpoints
        messageService.add({
          severity: 'warn',
          summary: 'Session Expired',
          detail: 'Your session has expired. Please log in again.',
        });
      } else if (status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Access Denied',
          detail: 'You do not have permission for this action.',
        });
        router.navigate(['/unauthorized']);
      } else if (status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'No connection',
          detail: 'Unable to connect to the server.',
        });
      } else if (!isAuthFunction && !isAuthEndpoint) {
        // For any other error, display a friendly message
        // But don't show errors for auth functions/endpoints
        messageService.add({
          severity: 'error',
          summary: `Error ${status}`,
          detail: apiMessage,
        });
      }

      return throwError(() => error);
    })
  );
};
