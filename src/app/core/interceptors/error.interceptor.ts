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

      // Trate casos especiais
      if (status === 401) {
        // This will already be handled by AuthInterceptor, but it may display something
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
      } else {
        // For any other error, display a friendly message
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
