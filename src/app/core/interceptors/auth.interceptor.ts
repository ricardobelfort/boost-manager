// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Pega o token JWT (do Supabase) do serviço de auth
  const session = authService.currentSession; // pode ser getSession() ou getter do AuthService
  const token = session?.access_token; // adapte para seu AuthService!

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // Se for 401, redireciona para login
      if (error.status === 401) {
        authService.signOut();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};