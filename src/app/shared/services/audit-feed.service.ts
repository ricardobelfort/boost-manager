import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class AuditFeedService {
  feed$ = new BehaviorSubject<any[]>([]);

  // Aqui: count de registros de auditoria
  auditCount$ = from(
    supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: true })
  ).pipe(map((resp: any) => resp.count || 0));

  constructor() {
    // Carrega os últimos 10 eventos
    this.loadFeed();

    // Realtime: escuta inserts na tabela
    supabase
      .channel('audit-log')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_log' }, payload => {
        this.feed$.next([payload.new, ...this.feed$.value].slice(0, 20));
      })
      .subscribe();
  }

  async loadFeed() {
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
    this.feed$.next(data || []);
  }
}
