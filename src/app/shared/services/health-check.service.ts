import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { supabase } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
  status$ = new BehaviorSubject<'ok' | 'error'>('ok');

  constructor() {
    timer(0, 60000).pipe(
      switchMap(() => supabase.from('profiles').select('id').limit(1))
    ).subscribe({
      next: ({ error }) => {
        this.status$.next(error ? 'error' : 'ok');
      },
      error: () => this.status$.next('error')
    });
  }
}
