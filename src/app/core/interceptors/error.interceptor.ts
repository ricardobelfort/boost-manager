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
        // Já será tratado pelo AuthInterceptor, mas pode exibir algo
        messageService.add({
          severity: 'warn',
          summary: 'Sessão Expirada',
          detail: 'Sua sessão expirou. Faça login novamente.',
        });
      } else if (status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Acesso negado',
          detail: 'Você não tem permissão para essa ação.',
        });
        router.navigate(['/unauthorized']);
      } else if (status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'Sem conexão',
          detail: 'Não foi possível se conectar ao servidor.',
        });
      } else {
        // Para qualquer outro erro, mostre uma mensagem amigável
        messageService.add({
          severity: 'error',
          summary: `Erro ${status}`,
          detail: apiMessage,
        });
      }

      return throwError(() => error);
    })
  );
};
