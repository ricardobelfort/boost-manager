import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { supabase } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class ErrorLogService {
  errors$ = new BehaviorSubject<any[]>([]);

  constructor() {
    this.loadErrors();
    supabase
      .channel('error-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'error_logs' }, payload => {
        this.errors$.next([payload.new, ...this.errors$.value].slice(0, 10));
      })
      .subscribe();
  }

  async loadErrors() {
    const { data } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    this.errors$.next(data || []);
  }
}
