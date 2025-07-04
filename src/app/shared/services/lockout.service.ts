import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface LockoutResponse {
  locked: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class LockoutService {
  // Substitua pelos seus endpoints, se mudar
  private checkLockoutUrl = 'https://nqaipmnlcoioqqqzcghu.supabase.co/functions/v1/check-lockout';
  private recordLoginFailureUrl = 'https://nqaipmnlcoioqqqzcghu.supabase.co/functions/v1/record-login-failure';

  constructor(private http: HttpClient) {}

  /** Verifica se a conta está bloqueada antes do login */
  checkAccountLockout(email: string): Observable<LockoutResponse> {
    return this.http.post<LockoutResponse>(this.checkLockoutUrl, { email }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /** Registra uma tentativa de login falha */
  recordLoginFailure(email: string): Observable<LockoutResponse> {
    return this.http.post<LockoutResponse>(this.recordLoginFailureUrl, { email }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
