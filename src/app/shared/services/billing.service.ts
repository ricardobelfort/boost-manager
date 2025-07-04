import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { supabase } from 'supabase.client';

@Injectable({ providedIn: 'root' })
export class BillingService {
  plans$ = new BehaviorSubject<any[]>([]);
  activePlans$ = new BehaviorSubject<number>(0);

  // Aqui: count de tenants (ativos, se quiser)
  totalTenants$ = from(
    supabase.from('tenants').select('*', { count: 'exact', head: true }).eq('status', 'active') // ou remova se quiser todos
  ).pipe(map((resp: any) => resp.count || 0));

  constructor() {
    this.loadPlans();
  }

  async loadPlans() {
    const { data } = await supabase.from('subscriptions').select('*').eq('status', 'active');

    this.plans$.next(data || []);
    this.activePlans$.next((data || []).length);
  }
}
