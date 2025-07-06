import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getSupabaseClient } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
  status$ = new BehaviorSubject<'ok' | 'error'>('ok');
  private supabase = getSupabaseClient();

  constructor() {
    timer(0, 60000)
      .pipe(switchMap(() => this.supabase.from('profiles').select('id').limit(1)))
      .subscribe({
        next: ({ error }) => {
          this.status$.next(error ? 'error' : 'ok');
        },
        error: () => this.status$.next('error'),
      });
  }
}
